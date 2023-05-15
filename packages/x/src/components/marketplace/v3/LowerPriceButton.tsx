import DatePicker from 'components/DatePicker'
import Link from 'components/Link'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { defaultAbiCoder } from '@ethersproject/abi'

import {
  Button,
  ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  Switch,
  Text,
  useBoolean,
  useDisclosure,
} from '@chakra-ui/react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { addresses, findToken, getChain } from '@x/constants'
import { ListingStrategy, NftItem, Order, OrderItem, signMakerOrder } from '@x/models'
import { getFirst } from '@x/utils'
import { handleError } from '@x/web3'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { fetchAccountOrderNonce, makeOrder } from '@x/apis/fn'
import { getContractAddressByListingStrategy } from 'utils/marketplace'
import { keccak256 } from '@ethersproject/keccak256'

export interface LowerPriceButtonProps extends ButtonProps {
  token: NftItem
}

export default function LowerPriceButton({ token, children, disabled, ...props }: LowerPriceButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button onClick={onOpen} disabled={disabled || !token.activeListing} {...props}>
        {children || 'Lower Price'}
      </Button>
      {token.activeListing && <LowerPriceModal order={token.activeListing} isOpen={isOpen} onClose={onClose} />}
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

function LowerPriceModal({ order, isOpen, onClose, ...props }: LowerPriceModalProps) {
  const toast = useToast({ title: 'Lower Listing' })

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

  const [usePreviousDeadline, { toggle: toggleUsePreviousDeadline }] = useBoolean(true)

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
        marketplace: keccak256([]),
        params:
          order.strategy === ListingStrategy.PrivateSale
            ? defaultAbiCoder.encode(['address'], [order.reservedBuyer])
            : defaultAbiCoder.encode([], []),
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
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <Image position="absolute" right={4} zIndex="modal" w={7} h={7} src="/assets/icons/ico-auctionbid-56x56.svg" />
        <ModalHeader>Lower Listing</ModalHeader>
        <form onSubmit={onSubmit}>
          <ModalBody>
            <Stack spacing={6}>
              <FormControl isInvalid={!!errors.price}>
                <FormLabel>Price</FormLabel>
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
              <Text>
                After updating the listing, the previous listing is still active as it would require gas to cancel. If
                you intend to remove the previous listing. visit <Link href="#">Active Listing</Link> to cancel
              </Text>
              <FormControl isInvalid={!!errors.deadline}>
                <FormLabel mr={0}>
                  <Stack direction="row" align="center" justify="space-between">
                    <Text as="span">Use previous expiration date</Text>
                    <Switch isChecked={usePreviousDeadline} onChange={toggleUsePreviousDeadline} />
                  </Stack>
                </FormLabel>
                {usePreviousDeadline && <Text>{watch('deadline').toLocaleString()}</Text>}
                {!usePreviousDeadline && (
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
                )}
                <FormErrorMessage>{errors.deadline?.message}</FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Stack w="full" spacing={5}>
              <Button
                type="submit"
                variant="outline"
                color="primary"
                w="100%"
                disabled={!isDirty || !isValid}
                isLoading={isSubmitting}
              >
                Set New Price
              </Button>
              <Button variant="outline" color="primary" w="100%" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
