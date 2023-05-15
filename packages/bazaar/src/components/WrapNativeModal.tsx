import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { RepeatIcon } from '@chakra-ui/icons'
import { Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/input'
import { Center, Stack, Text } from '@chakra-ui/layout'
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
import { InputRightAddon, SkeletonText } from '@chakra-ui/react'
import { chakra } from '@chakra-ui/system'
import { WeiPerEther, One, Zero } from '@ethersproject/constants'
import { ContractTransaction } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useBalance, useErc20Balance } from '@x/hooks'
import { useWrapNativeContract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { ensureNumber } from '@x/utils'
import { handleError } from '@x/web3'
import { useUsdPrice } from '@x/hooks'

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

  const { locale } = useRouter()

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

  const [price, isLoadingPrice] = useUsdPrice(getChain(chainId).nativeCurrency.symbol, chainId)

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

  function renderButtonLabel() {
    return isWrap ? 'Wrap' : 'Unwrap'
  }

  return (
    <Modal isOpen={isOpen} size="xl" {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`Swap ${nativeSymbol} / ${wrappedSymbol}`}</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Stack spacing={8}>
              <FormControl>
                <FormLabel>{isWrap ? nativeSymbol : wrappedSymbol}</FormLabel>
                <InputGroup>
                  <InputLeftAddon>
                    Balance:
                    <SkeletonText
                      ml={2}
                      isTruncated
                      isLoaded={!isSubmitting && isWrap ? !isLoadingNativeBalance : !isLoadingWrappedBalance}
                    >
                      {parseFloat(formatUnits(isWrap ? nativeBalance : wrappedBalance)).toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })}
                    </SkeletonText>
                  </InputLeftAddon>
                  <Input
                    pr={16}
                    type="number"
                    placeholder="0.0"
                    step={formatUnits(One)}
                    {...register('amount', { required: true })}
                  />
                  <InputRightElement w="fit-content" pr={2}>
                    <Button size="sm" onClick={onClickMax}>
                      Max
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Center w="100%">
                <Button
                  variant="outline"
                  leftIcon={<RepeatIcon />}
                  onClick={() => setValue('isWrap', !isWrap)}
                  disabled={isLoading}
                >
                  Switch
                </Button>
              </Center>
              <FormControl>
                <FormLabel>{isWrap ? wrappedSymbol : nativeSymbol}</FormLabel>
                <InputGroup>
                  <InputLeftAddon>
                    Balance:
                    <SkeletonText
                      ml={2}
                      isTruncated
                      isLoaded={!isSubmitting && isWrap ? !isLoadingWrappedBalance : !isLoadingNativeBalance}
                    >
                      {parseFloat(formatUnits(isWrap ? wrappedBalance : nativeBalance)).toLocaleString(locale, {
                        maximumFractionDigits: 4,
                      })}
                    </SkeletonText>
                  </InputLeftAddon>
                  <Input
                    type="number"
                    value={watch('amount')}
                    step={formatUnits(One)}
                    onChange={e =>
                      setValue('amount', e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                    }
                  />
                  <InputRightAddon>
                    <SkeletonText isLoaded={!isLoadingPrice}>
                      $
                      {((price || 0) * ensureNumber(watch('amount'))).toLocaleString(locale, {
                        maximumFractionDigits: 4,
                      })}
                    </SkeletonText>
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" isLoading={isLoading} disabled={disabled}>
              {renderButtonLabel()}
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  )
}
