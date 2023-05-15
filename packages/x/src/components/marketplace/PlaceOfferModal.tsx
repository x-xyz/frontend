import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/modal'
import { chakra } from '@chakra-ui/system'
import { Stack } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/button'
import { parseUnits } from '@ethersproject/units'
import SelectToken from 'components/input/SelectToken'
import DatePicker from 'components/DatePicker'
import { useMarketplaceContract, useErc20Contract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { findToken } from '@x/constants'
import { getFirst } from '@x/utils'
import { ensureEnoughErc20Allowance } from '@x/web3'
import { useActiveWeb3React } from '@x/hooks'
import { ChainId } from '@x/constants'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import { BigNumberish } from '@ethersproject/bignumber'
import TokenBalance from 'components/wallet/TokenBalance'

export interface PlaceOfferModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
}

interface FormData {
  paymentToken: string
  price: string
  endTime: Date
}

export default function PlaceOfferModal({
  chainId,
  contractAddress,
  tokenID,
  onClose,
  ...props
}: PlaceOfferModalProps) {
  const toast = useToast({ title: 'Place offer' })

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

  const { account, callContract } = useActiveWeb3React()

  const paymentToken = watch('paymentToken')

  const token = useMemo(() => (paymentToken ? findToken(paymentToken, chainId) : undefined), [paymentToken, chainId])

  const erc20Contract = useErc20Contract(token?.isNative ? undefined : token?.address, chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  const onSubmit = handleSubmit(async ({ paymentToken, price, endTime }) => {
    try {
      const deadline = Math.floor(endTime.getTime() / 1000)

      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!erc20Contract) throw new Error('cannot get erc20 contract')

      if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      const approveTxHash = await ensureEnoughErc20Allowance(
        erc20Contract,
        account,
        marketplaceContract.address,
        price,
        token,
      )

      if (approveTxHash) {
        toast({ status: 'success', description: `Approved. ${approveTxHash}` })
      }

      const priceInEther = parseUnits(price, token.decimals)

      const tx = await callContract({
        contract: marketplaceContract,
        method: 'createOffer',
        args: [contractAddress, tokenID, paymentToken, 1, priceInEther, deadline],
      })

      await tx.wait()

      toast({ status: 'success', description: `Offer placed. ${tx.hash}` })
    } catch (error: unknown) {
      if (error instanceof Error) toast({ status: 'error', description: error.message })

      throw error
    }
  })

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Place your offer
          <ModalCloseButton />
        </ModalHeader>
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <Stack spacing={6}>
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>Price</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>
                      <SelectToken
                        chainId={chainId}
                        buttonProps={{ borderWidth: 0 }}
                        value={watch('paymentToken')}
                        onChange={value => setValue('paymentToken', value)}
                        withNativeToken={false}
                      />
                    </InputLeftAddon>
                    <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} placeholder="0.00" />
                  </InputGroup>
                  <FormHelperText textAlign="right">
                    <TokenBalance chainId={chainId} tokenId={watch('paymentToken')} />
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Offer Expiration</FormLabel>
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
              <Button type="submit" variant="outline" w="100%" disabled={!isDirty || !isValid} isLoading={isSubmitting}>
                Place Offer
              </Button>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
