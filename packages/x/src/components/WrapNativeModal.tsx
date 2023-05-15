import useToast from 'hooks/useToast'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button, IconButton } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Image } from '@chakra-ui/image'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { Box, Stack } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps } from '@chakra-ui/modal'
import { chakra } from '@chakra-ui/system'
import { One, WeiPerEther, Zero } from '@ethersproject/constants'
import { ContractTransaction } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, getChain } from '@x/constants'
import { useActiveWeb3React, useBalance, useErc20Balance, useWrapNativeContract } from '@x/hooks'
import { handleError } from '@x/web3'

import AccountBalanceList from './account/AccountBalanceList'
import ModalIcon from './modal/ModalIcon'

export interface WrapFtmModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
}

interface FormData {
  isWrap: boolean
  amount: string
}

const defaultValues: FormData = { isWrap: true, amount: '0' }

export default function WrapNativeModal({ chainId, isOpen, ...props }: WrapFtmModalProps) {
  const nativeSymbol = getChain(chainId).nativeCurrency.symbol

  const wrappedSymbol = `W${nativeSymbol}`

  const toast = useToast({ title: `Swap ${nativeSymbol} / ${wrappedSymbol}` })

  const { callContract } = useActiveWeb3React()

  const wrapNativeContract = useWrapNativeContract(chainId)

  const {
    value: nativeBalance,
    isLoading: isLoadingNativeBalance,
    error: nativeBalanceError,
    refresh: refreshNativeBalance,
  } = useBalance(chainId)

  const {
    value: wrappedBalance,
    isLoading: isLoadingWrappedBalance,
    error: wrappedBalanceError,
    refresh: refreshWrappedBalance,
  } = useErc20Balance(wrapNativeContract)

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<FormData>({ mode: 'onBlur', defaultValues })

  const isWrap = watch('isWrap')

  function onClickMax() {
    if (isWrap) {
      let maxValue = nativeBalance.sub(WeiPerEther.div(100))
      if (maxValue.isNegative()) maxValue = Zero
      setValue('amount', formatUnits(maxValue), { shouldDirty: true, shouldTouch: true })
    } else {
      setValue('amount', formatUnits(wrappedBalance), { shouldDirty: true, shouldTouch: true })
    }
  }

  const onSubmit = handleSubmit(async ({ isWrap, amount }) => {
    try {
      if (!wrapNativeContract) throw new Error('cannot get wftm contract')

      let tx: ContractTransaction

      if (isWrap) {
        tx = await callContract({
          contract: wrapNativeContract,
          method: 'deposit',
          args: [],
          value: parseUnits(amount),
        })
      } else {
        tx = await callContract({ contract: wrapNativeContract, method: 'withdraw', args: [parseUnits(amount)] })
      }

      await tx.wait()

      toast({ status: 'success', description: `${isWrap ? `${nativeSymbol} Wrapped` : `${wrappedSymbol} Unwrapped`}` })

      reset({ ...defaultValues, isWrap })

      refreshNativeBalance()

      refreshWrappedBalance()
    } catch (error) {
      handleError(error, { toast, suppress: !isOpen })

      throw error
    }
  })

  useEffect(() => {
    if (nativeBalanceError) handleError(nativeBalanceError, { toast, suppress: !isOpen })
    if (wrappedBalanceError) handleError(wrappedBalanceError, { toast, suppress: !isOpen })
  }, [nativeBalanceError, wrappedBalanceError, toast, isOpen])

  useEffect(() => {
    if (!isOpen) return

    reset(defaultValues)

    refreshNativeBalance()

    refreshWrappedBalance()
  }, [reset, refreshNativeBalance, refreshWrappedBalance, isOpen])

  const isLoading = isSubmitting || isLoadingNativeBalance || isLoadingWrappedBalance

  const disabled = isLoading || !isDirty || !isValid || !wrapNativeContract || parseFloat(watch('amount')) === 0

  return (
    <Modal isOpen={isOpen} size="sm" {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ModalIcon>
            <Image src="/assets/v3/ico-convert-56x56.png" />
          </ModalIcon>
          Convert(Wrap/Unwrap)
        </ModalHeader>
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Box my={3}>
              <AccountBalanceList />
              <Box h={10} />
              <FormControl>
                <FormLabel>You Pay</FormLabel>
                <InputGroup>
                  <Input
                    pr={16}
                    type="number"
                    placeholder="Enter Amount"
                    step={formatUnits(One)}
                    {...register('amount', { required: true })}
                  />
                  <InputRightElement w="4rem" fontWeight="bold">
                    {isWrap ? nativeSymbol : wrappedSymbol}
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Box h={5} />
              <Stack w="100%" align="flex-end" mb={-3}>
                <IconButton
                  aria-label="Wrap or Unwrap"
                  variant="icon"
                  onClick={() => setValue('isWrap', !isWrap)}
                  disabled={isLoading}
                  icon={<Image src="/assets/v3/ico-ethtoweth-80x80.svg" w={10} h={10} />}
                />
              </Stack>
              <FormControl>
                <FormLabel>You Receive</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    placeholder="Enter Amount"
                    value={watch('amount')}
                    step={formatUnits(One)}
                    onChange={e =>
                      setValue('amount', e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                    }
                  />
                  <InputRightElement w="4rem" fontWeight="bold">
                    {isWrap ? wrappedSymbol : nativeSymbol}
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Stack w="full" spacing={5}>
              <Button type="submit" isLoading={isLoading} disabled={disabled}>
                Convert
              </Button>
              <Button type="button" onClick={props.onClose}>
                Cancel
              </Button>
            </Stack>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  )
}
