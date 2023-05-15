import DatePicker from 'components/DatePicker'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import SelectToken from 'components/input/SelectToken'
import TokenBalance from 'components/wallet/TokenBalance'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@chakra-ui/button'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Image } from '@chakra-ui/image'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Stack } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps } from '@chakra-ui/modal'
import { chakra } from '@chakra-ui/system'
import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { parseUnits } from '@ethersproject/units'
import { fetchAccountOrderNonce, makeOrder } from '@x/apis/fn'
import { addresses, ChainId, findToken } from '@x/constants'
import { useActiveWeb3React, useAuthToken, useErc20Contract } from '@x/hooks'
import { Order, signMakerOrder, TokenType } from '@x/models'
import { getFirst } from '@x/utils'
import { ensureEnoughErc20Allowance } from '@x/web3'

export interface PlaceOfferModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  tokenType?: TokenType
}

interface FormData {
  paymentToken: string
  price: string
  quantity?: number
  endTime: Date
}

export default function PlaceOfferModal({
  chainId,
  contractAddress,
  tokenID,
  onClose,
  tokenType,
  ...props
}: PlaceOfferModalProps) {
  const toast = useToast({ title: 'Place offer' })

  const [authToken] = useAuthToken()

  const {
    register,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
    handleSubmit,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { endTime: DateTime.now().plus({ days: 1 }).toJSDate() },
  })

  const { account, library } = useActiveWeb3React()

  const paymentToken = watch('paymentToken')

  const token = useMemo(() => (paymentToken ? findToken(paymentToken, chainId) : undefined), [paymentToken, chainId])

  const erc20Contract = useErc20Contract(token?.isNative ? undefined : token?.address, chainId)

  // const marketplaceContract = useMarketplaceContract(chainId)

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  const onSubmit = handleSubmit(async ({ paymentToken, price, quantity = 1, endTime }) => {
    try {
      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!erc20Contract) throw new Error('cannot get erc20 contract')

      // if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      if (!library) throw new Error('cannot get library')

      const approveTxHash = await ensureEnoughErc20Allowance(
        erc20Contract,
        account,
        addresses.exchange[chainId],
        price,
        token,
      )

      if (approveTxHash) {
        toast({ status: 'success', description: `Approved. ${approveTxHash}` })
      }

      const priceInEther = parseUnits(price, token.decimals)

      // const tx = await callContract({
      //   contract: marketplaceContract,
      //   method: 'createOffer',
      //   args: [contractAddress, tokenID, paymentToken, quantity, priceInEther, deadline],
      // })

      // await tx.wait()

      const { nonce } = await fetchAccountOrderNonce(account, chainId, authToken)

      const order: Order = {
        chainId,
        isAsk: false,
        signer: account,
        items: [
          {
            collection: contractAddress,
            tokenId: tokenID.toString(),
            amount: quantity.toString(),
            price: priceInEther.toString(),
          },
        ],
        strategy: addresses.strategyFixedPrice[chainId],
        currency: paymentToken,
        nonce,
        startTime: DateTime.now().startOf('second').toSeconds().toString(),
        endTime: DateTime.fromJSDate(endTime).startOf('second').toSeconds().toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256([]),
        params: defaultAbiCoder.encode([], []),
      }

      const signedOrder = await signMakerOrder(library.getSigner(), chainId, addresses.exchange[chainId], order)

      await makeOrder(signedOrder)

      toast({ status: 'success', description: `Offer placed` })
    } catch (error: unknown) {
      if (error instanceof Error) toast({ status: 'error', description: error.message })

      throw error
    }
  })

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <Image position="absolute" right={4} zIndex="modal" w={7} h={7} src="/assets/icons/ico-auctionbid-56x56.svg" />
        <ModalHeader>My Offer</ModalHeader>
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <Stack spacing={6}>
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>Offer Price</FormLabel>
                  <InputGroup>
                    <Input
                      {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })}
                      placeholder="Enter price"
                    />
                    <InputRightAddon>
                      <SelectToken
                        chainId={chainId}
                        buttonProps={{ borderWidth: 0 }}
                        value={watch('paymentToken')}
                        onChange={value => setValue('paymentToken', value)}
                        withNativeToken={false}
                      />
                    </InputRightAddon>
                  </InputGroup>
                  <FormHelperText>
                    <TokenBalance chainId={chainId} tokenId={watch('paymentToken')} />
                  </FormHelperText>
                </FormControl>
                {tokenType === TokenType.Erc1155 && (
                  <FormControl isRequired isInvalid={!!errors.quantity}>
                    <FormLabel>Quantity</FormLabel>
                    <Input
                      type="number"
                      {...register('quantity', {
                        required: true,
                        pattern: /\d+/,
                        valueAsNumber: true,
                        min: 1,
                      })}
                      placeholder="1"
                      min={1}
                      step={1}
                    />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel>My Offer Expiry</FormLabel>
                  <DatePicker
                    selected={watch('endTime')}
                    onChange={date => {
                      const endTime = getFirst(date)
                      if (endTime) setValue('endTime', endTime)
                    }}
                    showTimeInput
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    width="100%"
                    height="40px"
                    popperProps={{
                      strategy: 'fixed',
                    }}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Stack w="full" spacing={5}>
                <Button
                  type="submit"
                  color="primary"
                  variant="outline"
                  w="100%"
                  disabled={!isDirty || !isValid}
                  isLoading={isSubmitting}
                >
                  Confirm Offer
                </Button>
                <Button color="primary" variant="outline" w="100%" onClick={() => onClose()}>
                  Cancel
                </Button>
              </Stack>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
