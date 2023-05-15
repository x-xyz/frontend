import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Center, Container, Stack, Text } from '@chakra-ui/layout'
import { chakra } from '@chakra-ui/system'
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Select } from '@chakra-ui/select'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Textarea } from '@chakra-ui/textarea'
import { Checkbox } from '@chakra-ui/checkbox'
import { Button } from '@chakra-ui/button'
import { BigNumber } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { formatUnits } from '@ethersproject/units'
import { verifyMessage } from '@ethersproject/wallet'
import { PayableOverrides } from '@ethersproject/contracts'
import { isErrorResponse } from '@x/utils'
import { useNonceMutation } from '@x/apis'
import { useLazyMintableCollectionsQuery } from '@x/apis'
import { useUploadMutation, useAddUnlockableContentMutation } from '@x/apis'
import { useMarketplaceContract, useMintableErc721Contract } from '@x/hooks'
import Layout from 'components/Layout'
import ImageUploader from 'components/input/ImageUploader'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { useImageUploader } from '@x/hooks'
import { useToast } from '@x/hooks'
import { ensureEnoughNativeToken, handleError, makeSignatureMessage } from '@x/web3'
import { compareAddress, signMessage } from '@x/utils'
import { Alert } from '@chakra-ui/alert'
import { defaultNetwork, getChain } from '@x/constants'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import TokenBalance from 'components/wallet/TokenBalance'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { useConnectWalletModal } from 'components/wallet/ConnectWalletProvider'
import HeadMeta from 'components/HeadMeta'

export const getServerSideProps = createServerSidePropsGetter(void 0, { requrieAuth: true })

interface FormData {
  contractAddress: string
  name: string
  description: string
  xtra: string
  royalty: string
  hasUnlockableContent: boolean
  unlockableContent: string
}

export default function Mint() {
  const toast = useToast({ title: 'Mint' })

  const router = useRouter()

  const { account, library, chainId = defaultNetwork } = useActiveWeb3React()

  const chain = getChain(chainId)

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const imageUploader = useImageUploader()

  const walletModal = useConnectWalletModal()

  useEffect(() => {
    if (!account) walletModal.onOpen()
  }, [account, walletModal])

  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange', defaultValues: { name: '', description: '', royalty: '0.00' } })

  const [fetchMintableCollections, { data: mintableCollections, isLoading: isLoadingMintableCollections }] =
    useLazyMintableCollectionsQuery()

  const [fetchNonce, { isLoading: isLoadingNonce }] = useNonceMutation()

  const [upload] = useUploadMutation()

  const [addUnlockableContent] = useAddUnlockableContentMutation()

  const erc721Contract = useMintableErc721Contract(watch('contractAddress'), chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [fee, setFee] = useState(Zero)

  useEffect(() => {
    if (authToken) fetchMintableCollections({ authToken, chainId })
  }, [authToken, chainId, fetchMintableCollections])

  // reset whole form after chain id changed
  useEffect(() => reset(), [chainId, reset])

  useEffect(() => {
    if (!erc721Contract) return

    setFee(Zero)

    erc721Contract
      .platformFee()
      .then(setFee)
      .catch(error => {
        /**
         * mute error, after user change chain, we still use old contract to fetch fee
         */
        // if (error instanceof Error) toast({ status: 'error', description: error.message })

        console.error(error)
      })
  }, [erc721Contract, toast])

  const onSubmit = handleSubmit(
    async ({ hasUnlockableContent, unlockableContent, contractAddress, royalty, ...data }) => {
      if (!imageUploader.image) return

      try {
        if (!account || !library) throw new Error('cannot get account')

        if (!authToken) throw new Error('cannot get auth token')

        if (!erc721Contract) throw new Error('cannot get erc721 contract')

        if (!marketplaceContract) throw new Error('cannot get marketplace contract')

        const fixedRoyalty = parseFloat(royalty) * 100

        if (isNaN(fixedRoyalty)) throw new Error('invalid royalty')

        await ensureEnoughNativeToken(library, account, fee, chain.nativeCurrency)

        let signature: string | undefined

        let signatureAddress: string | undefined

        if (hasUnlockableContent && unlockableContent.length > 0) {
          const nonceResp = await fetchNonce({ authToken })

          if (isErrorResponse(nonceResp)) throw nonceResp.error

          if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

          const message = makeSignatureMessage(nonceResp.data.data)

          signature = await signMessage(library.getSigner(), account, message)

          signatureAddress = verifyMessage(message, signature)
        }

        const collectionName = mintableCollections?.data?.find(collection =>
          compareAddress(collection.erc721Address, contractAddress),
        )?.collectionName

        const res = await upload({ authToken, image: imageUploader.image, royalty, collectionName, ...data })

        if (isErrorResponse(res)) throw res.error

        if (res.data.status === 'fail') throw new Error('upload image failed')

        const { jsonHash, jsonUrl } = res.data.data

        const options: PayableOverrides = {}

        if (fee !== Zero) {
          options.value = fee

          options.gasPrice = (await library.getGasPrice()).mul(2)
        }

        const mintTx = await erc721Contract.mint(account, jsonUrl || jsonHash || '', options)

        const receipt = await mintTx.wait()

        const tokenId = BigNumber.from(receipt.logs[0]?.topics?.[3] || '')

        if (fixedRoyalty > 0) {
          const registerRoyaltyTx = await marketplaceContract.registerRoyalty(contractAddress, tokenId, fixedRoyalty)

          await registerRoyaltyTx.wait()
        }

        if (signature && signatureAddress) {
          await addUnlockableContent({
            authToken,
            chainId,
            contract: contractAddress,
            tokenId: tokenId.toNumber(),
            content: unlockableContent,
            signature,
            signatureAddress,
          })
        }

        toast({ status: 'success', description: 'Minted' })

        router.push(`/asset/${contractAddress}/${tokenId.toNumber()}`)
      } catch (error) {
        handleError(error, { toast })

        throw error
      }
    },
  )

  const isLoading = [
    isLoadingAuthToken,
    isLoadingNonce,
    isLoadingMintableCollections,
    imageUploader.isLoading,
    isSubmitting,
  ].some(Boolean)

  const disabled = [
    isLoading,
    !isDirty,
    !isValid,
    !imageUploader.image,
    isSubmitSuccessful,
    !erc721Contract,
    !marketplaceContract,
  ].some(Boolean)

  return (
    <Layout>
      <HeadMeta subtitle="Create NFTs" />
      <Container>
        <chakra.form onSubmit={onSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired isInvalid={!imageUploader.image}>
              <FormLabel>Image</FormLabel>
              <ImageUploader {...imageUploader} />
              <FormErrorMessage>Image is required</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.contractAddress}>
              <FormLabel>Collection</FormLabel>
              <Select {...register('contractAddress', { required: 'Collection is required' })}>
                <option value="">-</option>
                {mintableCollections?.data?.map(({ erc721Address, collectionName }) => (
                  <option key={erc721Address} value={erc721Address}>
                    {collectionName}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.contractAddress?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input {...register('name', { maxLength: 40, required: 'Name is required' })} />
              <FormHelperText textAlign="right">{watch('name').length}/40</FormHelperText>
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea {...register('description', { maxLength: 120 })} />
              <FormHelperText textAlign="right">{watch('description').length}/120</FormHelperText>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.royalty}>
              <FormLabel>Royalty (%)</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  max={100}
                  {...register('royalty', {
                    min: { value: 0, message: 'Valid range 0.00 ~ 100.00' },
                    max: { value: 100, message: 'Valid range 0.00 ~ 100.00' },
                  })}
                />
                <InputRightAddon>%</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>{errors.royalty?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Link to IP Right Document</FormLabel>
              <Input {...register('xtra')} />
            </FormControl>
            <FormControl>
              <Checkbox width="100%" {...register('hasUnlockableContent')}>
                Unlockable Content
              </Checkbox>
              {watch('hasUnlockableContent') && <Textarea mt={4} {...register('unlockableContent')} />}
            </FormControl>
            <Center flexDir="column">
              <Alert mb={4} status="warning">
                ⚠️ Information cannot be changed after minting. Please be sure the information is correct before
                confirming transaction.
              </Alert>
              <Text mb={4} textAlign="center">
                Fee: {formatUnits(fee, chain.nativeCurrency.decimals)} {chain.nativeCurrency.symbol}
              </Text>
              <TokenBalance mb={4} chainId={chainId} tokenId={getChain(chainId).nativeCurrency.symbol} />
              {account ? (
                <Button type="submit" disabled={disabled} isLoading={isLoading}>
                  Mint on {chain.name}
                </Button>
              ) : (
                <ConnectWalletButton />
              )}
            </Center>
          </Stack>
        </chakra.form>
      </Container>
    </Layout>
  )
}
