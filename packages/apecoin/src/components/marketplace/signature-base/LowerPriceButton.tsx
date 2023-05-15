import DatePicker from 'components/DatePicker'
import Link from 'components/Link'
import useAuthToken from 'hooks/useAuthToken'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getContractAddressByListingStrategy } from 'utils/marketplace'

import {
  Button,
  ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/solidity'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { fetchAccountOrderNonce, makeOrder } from '@x/apis/fn'
import { addresses, findToken, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { ListingStrategy, Order, OrderItem, signMakerOrder, FeeDistType } from '@x/models'
import { getFirst } from '@x/utils'
import { handleError } from '@x/web3'
import Overlay from './Overlay'

export interface LowerPriceButtonProps extends ButtonProps {
  activeListing: OrderItem
}

export default function LowerPriceButton({ activeListing, children, disabled, ...props }: LowerPriceButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button onClick={onOpen} disabled={disabled} {...props}>
        {children || 'Lower Price'}
      </Button>
      <Overlay title="Lower List Price" isOpen={isOpen} onClose={onClose} showCloseButton={false}>
        <LowerPriceContent order={activeListing} isOpen={isOpen} onClose={onClose} />
      </Overlay>
    </>
  )
}

interface LowerPriceModalProps extends Omit<ModalProps, 'children'> {
  order: OrderItem
}

interface LowerPriceFormData {
  price: string
  deadline: Date
}

function LowerPriceContent({ order, isOpen, onClose, ...props }: LowerPriceModalProps) {
  const toast = useToast({ title: 'Lower Listing' })

  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

  const { account, library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const paymentToken = useMemo(
    () => findToken(order.currency, order.chainId) || getChain(order.chainId).nativeCurrency,
    [order],
  )

  const defaultValues = useMemo<LowerPriceFormData>(
    () => ({
      price: formatUnits(order.price, paymentToken.decimals),
      deadline: DateTime.fromISO(order.endTime).toJSDate(),
    }),
    [order, paymentToken],
  )

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<LowerPriceFormData>({
    mode: 'onChange',
    defaultValues,
  })

  useEffect(() => {
    if (isOpen) reset(defaultValues)
  }, [isOpen, reset, defaultValues])

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  const deadlineRegister = register('deadline', {
    required: true,
    validate: value => {
      if (DateTime.fromJSDate(value).diff(DateTime.now()).valueOf() <= 0) return 'Invalid deadline'
    },
  })

  const onSubmit = handleSubmit(async data => {
    try {
      if (!account) throw new Error('cannot get account')
      if (!library) throw new Error('cannot get library')

      const { nonce } = await fetchAccountOrderNonce(account, order.chainId, authToken)

      const price = parseUnits(data.price, paymentToken.decimals).toString()
      const startTime = DateTime.now().startOf('second').toSeconds().toString()
      const endTime = DateTime.fromJSDate(data.deadline).startOf('second').toSeconds().toString()

      const newOrder: Order = {
        chainId: order.chainId,
        isAsk: true,
        signer: order.signer,
        items: [{ collection: order.collection, tokenId: order.tokenId, amount: order.amount, price: price }],
        strategy: getContractAddressByListingStrategy(order.strategy, order.chainId),
        currency: order.currency,
        nonce,
        startTime,
        endTime,
        minPercentageToAsk: order.minPercentageToAsk,
        marketplace: keccak256(['string'], ['apecoin']),
        params:
          order.strategy === ListingStrategy.PrivateSale
            ? defaultAbiCoder.encode(['address'], [order.reservedBuyer])
            : defaultAbiCoder.encode([], []),
        feeDistType: FeeDistType.Burn,
      }

      const signedOrder = await signMakerOrder(
        library.getSigner(),
        order.chainId,
        addresses.exchange[order.chainId],
        newOrder,
      )

      await makeOrder(signedOrder)
    } catch (error) {
      handleError(error, { toast })
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <FormControl isInvalid={!!errors.price}>
          <FormLabel>
            <Text variant="caption">New Price</Text>
          </FormLabel>
          <InputGroup>
            <Input
              autoComplete="off"
              {...register('price', {
                max: {
                  value: defaultValues.price,
                  message:
                    'The new listing price must be lower than the current listing price. To set a higher price, please cancel the current listing and re-list at a higher price.',
                },
                validate: v => {
                  return !isNaN(parseFloat(v)) || 'Invalid value.'
                },
              })}
            />
            <InputRightElement>{paymentToken.symbol}</InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
        </FormControl>
        <Text variant="body2">
          After updating the listing, the previous listing is still active as it would require gas to cancel. If you
          intend to remove the previous listing, visit <Link href="#">Active Listing</Link> on the Portfolio page to
          cancel.
        </Text>
        <FormControl isInvalid={!!errors.deadline}>
          <FormLabel mr={0}>
            <Text variant="caption">Listing Expiration Date</Text>
          </FormLabel>
          <DatePicker
            name={deadlineRegister.name}
            ref={deadlineRegister.ref}
            selected={watch('deadline')}
            onChange={(date, e) => {
              if (e) deadlineRegister.onChange(e)
              const endTime = getFirst(date)
              if (endTime) setValue('deadline', endTime, { shouldValidate: true })
            }}
            onBlur={deadlineRegister.onBlur}
            minDate={new Date()}
            showTimeInput
            showTimeSelect
            popperProps={{
              strategy: 'fixed',
            }}
            dateFormat="MM/dd/yyyy h:mm aa"
            width="100%"
            height="40px"
          />
          <FormErrorMessage>{errors.deadline?.message}</FormErrorMessage>
        </FormControl>
        <Stack direction="row" w="full" spacing={4}>
          <Button variant="outline" color="primary" w="100%" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="solid" w="100%" disabled={!isDirty || !isValid} isLoading={isSubmitting}>
            Set New Price
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}
