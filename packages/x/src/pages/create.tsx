import { fetchNonce } from '@x/apis/dist/fn'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Center, Container, Grid, GridItem, Stack, Text } from '@chakra-ui/layout'
import { chakra } from '@chakra-ui/system'
import { FormControl, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import { Select } from '@chakra-ui/select'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Textarea } from '@chakra-ui/textarea'
import { Checkbox } from '@chakra-ui/checkbox'
import { Button } from '@chakra-ui/button'
import { BigNumber } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { formatUnits } from '@ethersproject/units'
import { verifyMessage } from '@ethersproject/wallet'
import { isErrorResponse } from '@x/utils'
import { useLazyMintableCollectionsQuery } from '@x/apis'
import { useUploadMutation, useAddUnlockableContentMutation } from '@x/apis'
import { useMarketplaceContract, useMintableErc721Contract } from '@x/hooks'
import Layout from 'components/Layout/v2'
import ImageUploader from 'components/input/ImageUploader'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { useImageUploader } from '@x/hooks'
import useToast from 'hooks/useToast'
import { ensureEnoughNativeToken, handleError, makeSignatureMessage } from '@x/web3'
import { compareAddress, signMessage } from '@x/utils'
import { Alert } from '@chakra-ui/alert'
import { ChainId, getChain, getChainNameForUrl } from '@x/constants'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import TokenBalance from 'components/wallet/TokenBalance'
import { WarningIcon } from '@x/components/icons'
import { useMutation } from 'react-query'

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

  const { account, library, chainId = ChainId.Fantom, callContract } = useActiveWeb3React()

  const chain = getChain(chainId)

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const imageUploader = useImageUploader()

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange', defaultValues: { name: '', description: '' } })

  const [fetchMintableCollections, { data: mintableCollections, isLoading: isLoadingMintableCollections }] =
    useLazyMintableCollectionsQuery()

  const nonceMutation = useMutation(fetchNonce)

  const [upload] = useUploadMutation()

  const [addUnlockableContent] = useAddUnlockableContentMutation()

  const erc721Contract = useMintableErc721Contract(watch('contractAddress'), chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [fee, setFee] = useState(Zero)

  const [currentProcess, setCurrentProcess] = useState('')

  useEffect(() => {
    if (authToken) fetchMintableCollections({ authToken, chainId })
  }, [authToken, chainId, fetchMintableCollections])

  // reset whole form after chain id changed
  useEffect(() => reset(), [chainId, reset])

  useEffect(() => {
    if (mintableCollections?.data && mintableCollections.data.length > 0) {
      setValue('contractAddress', mintableCollections.data[0].erc721Address)
    }
  }, [mintableCollections, setValue])

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
        setCurrentProcess('Checking')

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
          const nonce = await nonceMutation.mutateAsync(authToken)

          const message = makeSignatureMessage(nonce)

          signature = await signMessage(library.getSigner(), account, message)

          signatureAddress = verifyMessage(message, signature)
        }

        const collectionName = mintableCollections?.data?.find(collection =>
          compareAddress(collection.erc721Address, contractAddress),
        )?.collectionName

        setCurrentProcess('Uploading asset')

        const res = await upload({ authToken, image: imageUploader.image, royalty, collectionName, ...data })

        if (isErrorResponse(res)) throw res.error

        if (res.data.status === 'fail') throw new Error('upload image failed')

        setCurrentProcess('Minting token')

        const { jsonHash, jsonUrl } = res.data.data

        const mintTx = await callContract({
          contract: erc721Contract,
          method: 'mint',
          args: [account, jsonUrl || jsonHash || ''],
          chainId,
          value: fee !== Zero ? fee : undefined,
        })

        const receipt = await mintTx.wait()

        const tokenId = BigNumber.from(receipt.logs[0]?.topics?.[3] || '')

        if (fixedRoyalty > 0) {
          setCurrentProcess('Registering royalty')

          const registerRoyaltyTx = await marketplaceContract.registerRoyalty(contractAddress, tokenId, fixedRoyalty)

          await registerRoyaltyTx.wait()
        }

        if (signature && signatureAddress) {
          setCurrentProcess('Uploading secret content')

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

        router.push(`/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${BigNumber.from(tokenId).toNumber()}`)
      } catch (error) {
        handleError(error, { toast })

        throw error
      } finally {
        setCurrentProcess('')
      }
    },
  )

  const isLoading = [
    isLoadingAuthToken,
    nonceMutation.isLoading,
    isLoadingMintableCollections,
    imageUploader.isLoading,
    isSubmitting,
    !erc721Contract,
    !marketplaceContract,
  ].some(Boolean)

  const disabled = [isLoading, !isDirty, !isValid, !imageUploader.image, isSubmitSuccessful].some(Boolean)

  return (
    <Layout title="Create">
      <Container maxW="container.xl" pt="166px">
        <chakra.form onSubmit={onSubmit}>
          <Grid templateColumns={{ lg: '1fr 2fr' }} columnGap={12} rowGap={8}>
            <GridItem rowSpan={4}>
              <FormControl isRequired isInvalid={!imageUploader.image}>
                <ImageUploader w="360px" h="360px" {...imageUploader} />
                <FormErrorMessage>Image is required</FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem colStart={1} rowStart={5}>
              <FormControl isRequired isInvalid={!!errors.contractAddress}>
                <Select
                  placeholder="Collection Name"
                  {...register('contractAddress', { required: 'Collection is required' })}
                >
                  {mintableCollections?.data?.map(({ erc721Address, collectionName }) => (
                    <option key={erc721Address} value={erc721Address}>
                      {collectionName}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.contractAddress?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.name}>
                <Input
                  variant="solid"
                  placeholder="Name"
                  {...register('name', { maxLength: 40, required: 'Name is required' })}
                />
                <FormHelperText textAlign="right">{watch('name').length}/40</FormHelperText>
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <Textarea variant="solid" placeholder="Description" {...register('description', { maxLength: 120 })} />
                <FormHelperText textAlign="right">{watch('description').length}/120</FormHelperText>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.royalty}>
                <InputGroup variant="solid">
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    max={100}
                    placeholder="Royalty (%)"
                    {...register('royalty', {
                      min: { value: 0, message: 'Valid range 0.00 ~ 100.00' },
                      max: { value: 100, message: 'Valid range 0.00 ~ 100.00' },
                      required: 'Royalty is required',
                    })}
                  />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
                <FormErrorMessage>{errors.royalty?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <Input variant="solid" placeholder="Link to IP Right Document" {...register('xtra')} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <Checkbox width="100%" {...register('hasUnlockableContent')}>
                  Unlockable Content
                </Checkbox>
                {watch('hasUnlockableContent') && (
                  <Textarea
                    variant="solid"
                    mt={4}
                    placeholder="Unlockable Content"
                    {...register('unlockableContent')}
                  />
                )}
              </FormControl>
            </GridItem>
            <GridItem>
              <Text fontSize="lg" fontWeight="bold">
                Fee: {formatUnits(fee, chain.nativeCurrency.decimals)} {chain.nativeCurrency.symbol}
              </Text>
              <TokenBalance
                fontSize="lg"
                fontWeight="bold"
                mb={4}
                chainId={chainId}
                tokenId={getChain(chainId).nativeCurrency.symbol}
              />
            </GridItem>
            <GridItem>
              {account ? (
                <Button
                  variant="primary"
                  size="xl"
                  type="submit"
                  disabled={disabled}
                  isLoading={isLoading}
                  loadingText={currentProcess}
                >
                  Mint on {chain.name}
                </Button>
              ) : (
                <ConnectWalletButton />
              )}
            </GridItem>
            <GridItem colSpan={2}>
              <Center>
                <Alert maxW="870px" status="warning">
                  <Stack>
                    <Stack direction="row" alignItems="center">
                      <WarningIcon w="36px" h="36px" />
                      <Text color="currentcolor" fontSize="sm" fontWeight="bold">
                        Warning
                      </Text>
                    </Stack>
                    <Text color="currentcolor" fontSize="sm" fontWeight="bold">
                      Information cannot be changed after minting. Please be sure the information is correct before
                      confirming transaction.
                    </Text>
                  </Stack>
                </Alert>
              </Center>
            </GridItem>
          </Grid>
        </chakra.form>
      </Container>
    </Layout>
  )
}
