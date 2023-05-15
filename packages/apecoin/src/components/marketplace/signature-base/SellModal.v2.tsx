import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import SelectPeriod, { Period } from 'components/input/SelectPeriod'
import SelectToken from 'components/input/SelectToken'
import Media from 'components/Media'
import { isAddress } from 'ethers/lib/utils'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'

import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Box, Spacer, Stack, Text, Center } from '@chakra-ui/layout'
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
import { Badge, Checkbox } from '@chakra-ui/react'
import { chakra } from '@chakra-ui/system'
import { BigNumberish } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { fetchCollectionV2, fetchTokenV2 } from '@x/apis/fn'
import { addresses, ChainId, findToken } from '@x/constants'
import { useActiveWeb3React, useErc721ApprovalForAll, useErc721Contract, useMarketplaceContract } from '@x/hooks'
import { TokenType } from '@x/models'
import { getFirst } from '@x/utils'
import { handleError } from '@x/web3'

import DatePicker from '../../DatePicker'
import { fetchPrice } from '@x/apis/dist/fn/coin'

export interface SellModalProps extends Omit<ModalProps, 'children'> {
  mode: 'create' | 'update'
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  defaultValues?: Partial<FormData>
  tokenType?: TokenType
  onConfirmSell?: (data: FormData) => void
}

export interface FormData {
  paymentToken: string
  price: string
  quantity?: number
  deadline: Date
  isPrivateSale: boolean
  reservedAddress?: string
}

const tokenSymbolToCoingeckoId: Record<string, string> = {
  ETH: 'ethereum',
  WETH: 'weth',
  APE: 'apecoin',
  USDT: 'tether',
  USDC: 'usd-coin',
}

export default function SellModal({
  mode,
  chainId,
  contractAddress,
  tokenID,
  onClose,
  isOpen,
  defaultValues,
  tokenType = TokenType.Erc721,
  onConfirmSell = () => void 0,
  ...props
}: SellModalProps) {
  const { data: token, isLoading: isLoadingToken } = useQuery(
    ['token', chainId, contractAddress, `${tokenID}`],
    fetchTokenV2,
  )

  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', chainId, contractAddress],
    fetchCollectionV2,
  )

  const toast = useToast({ title: 'Sell' })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange', defaultValues: { isPrivateSale: false, ...defaultValues } })

  const { account, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(contractAddress, chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contractAddress,
    account,
    addresses.marketplace[chainId],
  )

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  useEffect(() => {
    if (isOpen) reset(defaultValues)
  }, [isOpen, reset, defaultValues])

  const creatorRoyalties = collection?.royalty || 0

  const marketplaceFee = watch('paymentToken') === '0x4d224452801aced8b2f0aebe155379bb5d594381' ? 0.0025 : 0.005

  const sellPrice = parseFloat(watch('price'))

  const earning = useMemo(
    () => (isNaN(sellPrice) ? 0 : sellPrice) * (1 - marketplaceFee - creatorRoyalties * 0.01),
    [sellPrice, marketplaceFee, creatorRoyalties],
  )

  const sellPaymentToken = findToken(watch('paymentToken'))

  const { data: unitPrice = '0' } = useQuery(
    ['price', tokenSymbolToCoingeckoId[sellPaymentToken?.symbol || 'ETH']],
    fetchPrice,
  )

  const onSubmit = handleSubmit(async formData => {
    try {
      if (mode === 'create') {
        onConfirmSell(formData)
        return
      }

      if (!isApproved) {
        if (!erc721Contract) throw new Error('cannot get erc721 contract')

        const tx = await callContract({
          contract: erc721Contract,
          method: 'setApprovalForAll',
          args: [addresses.marketplace[chainId], true],
        })

        await tx.wait()

        toast({ status: 'success', description: `Approved. ${tx.hash}` })
      }

      const { price, deadline, paymentToken } = formData

      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      const priceInEther = parseUnits(price, token.decimals)
      const deadlineInSeconds = Math.floor(DateTime.fromJSDate(deadline).toSeconds())

      const tx = await callContract({
        contract: marketplaceContract,
        method: 'updateListing(address,uint256,address,uint256,uint256)',
        args: [contractAddress, tokenID, token.address, priceInEther, deadlineInSeconds],
      })

      await tx.wait()

      toast({ status: 'success', description: `Listed. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const buttonLabel = mode === 'create' ? 'List NFT' : 'Update Listing'

  const deadlineRegister = register('deadline', {
    required: true,
    validate: value => {
      if (DateTime.fromJSDate(value).diff(DateTime.now()).valueOf() <= 0) return 'Invalid deadline'
    },
  })

  const datePickerRef = useRef(null)

  const [selectedPeriod, setSelectedPeriod] = useState(Period.None)

  function renderPrice() {
    return (
      <FormControl isRequired isInvalid={!!errors.price}>
        <FormLabel mb={5}>Price</FormLabel>
        <Stack direction="row" spacing={3}>
          <SelectToken
            chainId={chainId}
            value={watch('paymentToken')}
            onChange={value => setValue('paymentToken', value)}
            buttonProps={{
              borderWidth: '1px',
              borderColor: 'divider',
              px: 2,
              minW: '120px',
              w: '120px',
            }}
          />
          <InputGroup>
            <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} placeholder="Enter amount" />
            {/* <InputRightElement></InputRightElement> */}
            <InputRightAddon px={0}>
              <Input
                w="135px"
                value={`${(parseFloat(watch('price') || '0') * parseFloat(unitPrice)).toLocaleString()} USD`}
                disabled
                textAlign="right"
                color="placeholder"
              />
            </InputRightAddon>
          </InputGroup>
        </Stack>
      </FormControl>
    )
  }

  function renderQuantity() {
    return (
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
    )
  }

  function renderDeadline() {
    return (
      <FormControl isRequired isInvalid={!!errors.deadline}>
        <FormLabel mb={5}>End date</FormLabel>
        <Stack direction="row" spacing={3}>
          <SelectPeriod
            value={selectedPeriod}
            onChange={v => {
              if (v === Period.None)
                setValue('deadline', DateTime.now().plus({ years: 99 }).toJSDate(), { shouldValidate: true })
              else if (v === Period.Day)
                setValue('deadline', DateTime.now().plus({ days: 1 }).toJSDate(), { shouldValidate: true })
              else if (v === Period.Week)
                setValue('deadline', DateTime.now().plus({ weeks: 1 }).toJSDate(), { shouldValidate: true })
              else if (v === Period.Month)
                setValue('deadline', DateTime.now().plus({ months: 1 }).toJSDate(), { shouldValidate: true })
              setSelectedPeriod(v)
            }}
            buttonProps={{
              borderWidth: '1px',
              borderColor: 'divider',
              px: 2,
              minW: '120px',
              w: '120px',
            }}
          />
          <DatePicker
            name={deadlineRegister.name}
            ref={deadlineRegister.ref}
            selected={watch('deadline')}
            onChange={(date, e) => {
              if (e) deadlineRegister.onChange(e)
              const endTime = getFirst(date)
              if (endTime) setValue('deadline', endTime, { shouldValidate: true })
              setSelectedPeriod(Period.None)
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
          <Box position="relative" ref={datePickerRef} />
        </Stack>
        <FormErrorMessage>{errors.deadline?.message}</FormErrorMessage>
      </FormControl>
    )
  }

  function renderForm() {
    return (
      <chakra.form onSubmit={onSubmit}>
        <ModalBody p={8}>
          <Stack spacing={6}>
            <Stack direction="row" spacing={4}>
              <Media
                w="80px"
                h="80px"
                src={token?.animationUrl || token?.imageUrl}
                contentType={token?.animationUrlContentType || token?.contentType}
                mimetype={token?.animationUrlMimeType}
                isLoading={isLoadingToken}
                borderRadius="4px"
                overflow="hidden"
              />
              <Stack spacing={0}>
                <Text fontSize="xl">{token?.name}</Text>
                <Text color="primary" fontSize="sm">
                  {collection?.collectionName}
                </Text>
              </Stack>
            </Stack>
            {renderPrice()}
            {mode === 'create' && tokenType === TokenType.Erc1155 && renderQuantity()}
            {renderDeadline()}
            <Stack>
              <Text>Private Listing</Text>
              <Box />
              <Text fontSize="sm">
                Reserve NFT for a specific buyer.
                <br />
                Check the box below and key in the Wallet Address.
                <br />
                This NFT can be purchased as soon as it is listed.
              </Text>
              <Checkbox checked={watch('isPrivateSale')} onChange={e => setValue('isPrivateSale', e.target.checked)}>
                <Badge
                  variant="tag"
                  bg="#9a9a9a"
                  fontSize="xs"
                  borderRadius="14px"
                  transform="scale(0.8) translateX(-12px)"
                >
                  PRIVATE LISTING
                </Badge>
              </Checkbox>
              {watch('isPrivateSale') && (
                <Input
                  placeholder="Wallet Address"
                  type="text"
                  {...register('reservedAddress', {
                    shouldUnregister: true,
                    validate: value => isAddress(value || '') || 'Invalid Address',
                  })}
                />
              )}
            </Stack>
            <Stack>
              <Text>Price and fees</Text>
              <Stack fontSize="sm">
                <Stack direction="row" borderBottomColor="#4c4c4c" borderBottomWidth="1px">
                  <Text color="#9a9a9a">NFT Price</Text>
                  <Spacer />
                  <Text>
                    {watch('price') || 0} {findToken(watch('paymentToken'))?.symbol || 'ETH'}
                  </Text>
                </Stack>
                <Stack direction="row" borderBottomColor="#4c4c4c" borderBottomWidth="1px">
                  <Text color="#9a9a9a">Quantity</Text>
                  <Spacer />
                  <Text>{watch('quantity') || 1}</Text>
                </Stack>
                <Stack direction="row" borderBottomColor="#4c4c4c" borderBottomWidth="1px">
                  <Text color="#9a9a9a">X Marketplace Fees</Text>
                  <Spacer />
                  <Text>{(marketplaceFee * 100).toFixed(3)}%</Text>
                </Stack>
                <Stack direction="row">
                  <Text color="#9a9a9a">Creator Royalties</Text>
                  <Spacer />
                  <Text>{creatorRoyalties.toFixed(2)}%</Text>
                </Stack>
              </Stack>
              <Stack align="flex-end" mt={3}>
                <Center borderColor="#40e55b" borderWidth="1px" flexDir="column" px="20px" py="10px">
                  <Text fontSize="xs" color="#9a9a9a" transform="scale(0.8)">
                    Total Earnings
                  </Text>
                  <Text fontSize="2xl">
                    {earning.toLocaleString(void 0, { maximumFractionDigits: 3, minimumFractionDigits: 3 })}{' '}
                    {findToken(watch('paymentToken'))?.symbol || 'ETH'}
                  </Text>
                  <Text fontSize="xs" color="#9a9a9a">
                    {(earning * parseFloat(unitPrice)).toLocaleString(void 0, {
                      maximumFractionDigits: 3,
                      minimumFractionDigits: 3,
                    })}{' '}
                    USD
                  </Text>
                </Center>
              </Stack>
            </Stack>
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
              isLoading={isLoadingApproved || isSubmitting}
            >
              {buttonLabel}
            </Button>
            {/* <Button variant="outline" color="primary" w="100%" onClick={() => onClose()}>
              Cancel
            </Button> */}
          </Stack>
        </ModalFooter>
      </chakra.form>
    )
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent maxW="700px" p={0} border="none" overflowY="auto">
        <ModalHeader py={6} borderBottomWidth="1px" borderBottomColor="divider" bg="#000">
          List NFT for sale
          <ModalCloseButton top={6} right={4} color="#fff" />
        </ModalHeader>

        <EnsureConsistencyChain expectedChainId={chainId}>{renderForm()}</EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
