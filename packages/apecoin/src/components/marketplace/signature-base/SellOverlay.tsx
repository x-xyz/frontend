import SelectToken from 'components/input/SelectToken'
import Media from 'components/Media'
import { defaultAbiCoder, isAddress } from 'ethers/lib/utils'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'

import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Spacer, Stack, Text } from '@chakra-ui/layout'
import { ModalProps } from '@chakra-ui/modal'
import {
  Box,
  Checkbox,
  HStack,
  IconButton,
  Image,
  Skeleton,
  StackProps,
  Tooltip,
  useCallbackRef,
} from '@chakra-ui/react'
import { chakra } from '@chakra-ui/system'
import { BigNumberish } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { fetchAccountOrderNonce, fetchCollectionV2, fetchTokenV2, makeOrder } from '@x/apis/fn'
import { addresses, ChainId, findToken } from '@x/constants'
import { useActiveWeb3React, useErc721ApprovalForAll, useErc721Contract, useMarketplaceContract } from '@x/hooks'
import { TokenType } from '@x/models'
import { getFirst } from '@x/utils'
import { handleError } from '@x/web3'

import DatePicker from '../../DatePicker'
import { fetchPrice } from '@x/apis/dist/fn/coin'
import Overlay from './Overlay'
import { Collection, Order, signMakerOrder, FeeDistType } from '@x/models/dist'
import * as apis from '@x/apis/fn'
import RefreshIcon from '../../icons/RefreshIcon'
import { ethers } from 'ethers'
import useAuthToken from '../../../hooks/useAuthToken'
import { keccak256 } from '@ethersproject/solidity'
import SelectFeeDistType from 'components/input/SelectFeeDistType'

export interface SellOverlayProps extends Omit<ModalProps, 'children'> {
  mode: 'create' | 'update'
  chainId: ChainId
  contractAddress: string
  tokenID: string
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

export default function SellOverlay({
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
}: SellOverlayProps) {
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
    formState: { isDirty, isValid, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange', defaultValues: { isPrivateSale: false, ...defaultValues } })

  const { account, callContract, library } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(contractAddress, chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contractAddress,
    account,
    addresses.marketplace[chainId],
  )

  const [isListing, setIsListing] = useState(false)

  const [authToken] = useAuthToken()

  const [feeDistType, setDistType] = useState(FeeDistType.Burn)

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  useEffect(() => {
    if (isOpen) reset(defaultValues)
  }, [isOpen, reset, defaultValues])

  const onSubmit = handleSubmit(async formData => {
    setIsListing(true)

    const { price, deadline, quantity = 1, isPrivateSale, reservedAddress } = formData
    const paymentToken = findToken(formData.paymentToken, chainId)

    try {
      if (!paymentToken) throw new Error(`unknown token: ${formData.paymentToken}`)
      if (!account) throw new Error('cannot get account')
      if (!library) throw new Error('cannot get library')

      const priceInEther = parseUnits(price, paymentToken.decimals)
      const deadlineInSeconds = Math.floor(DateTime.fromJSDate(deadline).toSeconds())
      const startingTime = Math.floor(DateTime.now().toSeconds())

      const nonceData = await fetchAccountOrderNonce(account, chainId, authToken)

      const params = isPrivateSale
        ? defaultAbiCoder.encode(['address'], [reservedAddress])
        : defaultAbiCoder.encode([], [])

      const strategy = isPrivateSale ? addresses.strategyPrivateSale[chainId] : addresses.strategyFixedPrice[chainId]

      const order: Order = {
        chainId: chainId,
        isAsk: true,
        signer: account,
        items: [
          {
            collection: contractAddress,
            tokenId: tokenID,
            amount: quantity.toString(),
            price: priceInEther.toString(),
          },
        ],
        strategy: strategy,
        currency: paymentToken.address,
        nonce: nonceData.nonce,
        startTime: startingTime.toString(),
        endTime: deadlineInSeconds.toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256(['string'], ['apecoin']),
        params: params,
        feeDistType,
      }

      const signedOrder = await signMakerOrder(library.getSigner(), chainId, addresses.exchange[chainId], order)

      await makeOrder(signedOrder)

      onClose()
    } catch (error) {
      handleError(error, { toast })
    }
  })

  const creatorRoyalties = collection?.royalty || 0

  const marketplaceFee = watch('paymentToken') === '0x4d224452801aced8b2f0aebe155379bb5d594381' ? 0.0025 : 0.005

  const sellPrice = parseFloat(watch('price'))

  const earning = useMemo(
    () => (isNaN(sellPrice) ? 0 : sellPrice) * (1 - marketplaceFee - creatorRoyalties * 0.01),
    [sellPrice, marketplaceFee, creatorRoyalties],
  )

  const fees = useMemo(
    () => (isNaN(sellPrice) ? 0 : sellPrice) * (marketplaceFee + creatorRoyalties * 0.01),
    [sellPrice, marketplaceFee, creatorRoyalties],
  )

  const sellPaymentToken = findToken(watch('paymentToken'))

  const { data: unitPrice = '0' } = useQuery(
    ['price', tokenSymbolToCoingeckoId[sellPaymentToken?.symbol || 'ETH']],
    fetchPrice,
  )

  const buttonLabel = mode === 'create' ? 'Complete Listing' : 'Update Listing'

  const deadlineRegister = register('deadline', {
    required: true,
    validate: value => {
      if (DateTime.fromJSDate(value).diff(DateTime.now()).valueOf() <= 0) return 'Invalid deadline'
    },
  })

  function renderFloorPrice() {
    return (
      <Stack spacing={1}>
        <Text variant="caption" color="textSecondary">
          Floor Price
        </Text>
        <Skeleton w="fit-content" isLoaded={!!collection}>
          <Text minW="12" variant="body2">
            {collection?.openseaFloorPriceInNative.toLocaleString(undefined, {
              maximumFractionDigits: 3,
              minimumFractionDigits: 3,
            })}{' '}
            ETH
          </Text>
        </Skeleton>
        <Skeleton w="fit-content" isLoaded={!!collection}>
          <Text minW="12" variant="body2" color="textSecondary">
            $
            {collection?.openseaFloorPriceInUsd.toLocaleString(undefined, {
              maximumFractionDigits: 3,
              minimumFractionDigits: 3,
            })}
          </Text>
        </Skeleton>
      </Stack>
    )
  }

  const [openSeaLastUpdateTime, setOpenSeaLastUpdateTime] = useState<number>()
  const {
    data: externalListings,
    isLoading: isLoadingExternalListings,
    isFetching: isFetchingExternalListings,
    refetch: refetchExternalListings,
  } = useQuery(['external-listings', account || ''], apis.fetchExternalListings)

  const { mutateAsync: refreshExternalListings, isLoading: isRefreshingExternalListings } = useMutation(
    apis.refreshExternalListings,
    {
      onSuccess: async () => {
        await refetchExternalListings()
        setOpenSeaLastUpdateTime(Date.now())
      },
    },
  )

  function renderOpenSeaButtons() {
    const externalListing = (externalListings || []).find(ex => ex.tokenId === tokenID)

    return (
      <Stack>
        <HStack alignItems="center">
          <IconButton
            variant="icon"
            w={6}
            h={6}
            p={0}
            minW="unset"
            border="1px solid"
            borderColor="divider"
            borderRadius="20px"
            bgColor="unset"
            icon={<RefreshIcon w={4} h={4} color="white" />}
            aria-label="Refresh Icon"
            isLoading={isRefreshingExternalListings}
            disabled={isRefreshingExternalListings}
            onClick={() => refreshExternalListings(account || '')}
          />
          <Stack>
            <Text variant="captionSub">
              OpenSea prices last updated
              <br />
              {openSeaLastUpdateTime
                ? DateTime.fromMillis(openSeaLastUpdateTime).toLocaleString({ timeStyle: 'short', dateStyle: 'long' })
                : '-'}
            </Text>
          </Stack>
        </HStack>
        <HStack spacing={4}>
          <Button
            variant="outline"
            disabled={!externalListing || externalListing.paymentToken === ethers.constants.AddressZero}
            flex="1 0 auto"
            onClick={() => {
              if (!externalListing || externalListing.paymentToken === ethers.constants.AddressZero) return
              setValue('paymentToken', externalListing.paymentToken)
              setValue('price', externalListing.price)
            }}
          >
            OS Listed Price
          </Button>
          <Button
            variant="outline"
            disabled={!collection?.openseaFloorPriceInNative}
            flex="1 0 auto"
            onClick={() => {
              if (!collection?.openseaFloorPriceInNative) return
              setValue(
                'price',
                collection.openseaFloorPriceInNative.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 3,
                }),
              )
              setValue('paymentToken', 'weth')
            }}
          >
            OS Floor Price
          </Button>
        </HStack>
      </Stack>
    )
  }

  function renderPriceInput() {
    return (
      <FormControl isInvalid={!!errors.price}>
        <FormLabel>
          <Text variant="caption">List Price</Text>
        </FormLabel>
        <InputGroup>
          <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} placeholder="Enter amount" />
          <InputRightAddon
            border="1px solid"
            borderColor="line"
            borderRadius={0}
            minW="8.125rem"
            justifyContent="flex-end"
          >
            <SelectToken
              chainId={chainId}
              buttonProps={{ borderWidth: 0 }}
              textProps={{ variant: 'body2', color: 'textSecondary' }}
              value={watch('paymentToken')}
              onChange={value => setValue('paymentToken', value, { shouldValidate: true })}
              withNativeToken={true}
            />
          </InputRightAddon>
        </InputGroup>
      </FormControl>
    )
  }

  function renderQuantity() {
    return (
      <FormControl isInvalid={!!errors.quantity}>
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
      <FormControl isInvalid={!!errors.deadline}>
        <FormLabel>
          <Text variant="caption">Duration</Text>
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
    )
  }

  function renderPrivateListing() {
    return (
      <Stack py={4} spacing={4}>
        <Checkbox checked={watch('isPrivateSale')} onChange={e => setValue('isPrivateSale', e.target.checked)}>
          <Text variant="body2">Private Listing</Text>
        </Checkbox>
        {watch('isPrivateSale') && (
          <>
            <Text variant="caption">
              Reserve NFT for a specific buyer. Check the box below and key in the Wallet Address. This NFT can be
              purchased as soon as it is listed.
            </Text>
            <FormControl isInvalid={!!errors.deadline}>
              <FormLabel>
                <Text variant="caption">Enter Wallet Address</Text>
              </FormLabel>
              <Input
                placeholder="Wallet Address"
                type="text"
                {...register('reservedAddress', {
                  shouldUnregister: true,
                  validate: value => isAddress(value || '') || 'Invalid Address',
                })}
              />
            </FormControl>
          </>
        )}
      </Stack>
    )
  }

  function renderForm() {
    return (
      <chakra.form onSubmit={onSubmit}>
        <Stack spacing={0}>
          <Stack direction="row" spacing={3} py={4} alignItems="center">
            <Media
              w="60px"
              h="60px"
              src={token?.animationUrl || token?.imageUrl}
              contentType={token?.animationUrlContentType || token?.contentType}
              mimetype={token?.animationUrlMimeType}
              isLoading={isLoadingToken}
              borderRadius="4px"
              overflow="hidden"
            />
            <Stack spacing={2}>
              <Text variant="captionSub">{token?.name}</Text>
              <Text variant="captionSub" color="textSecondary">
                {collection?.collectionName}
              </Text>
            </Stack>
          </Stack>
          <Stack spacing={4} py={4}>
            {renderOpenSeaButtons()}
            {renderPriceInput()}
            {/*{mode === 'create' && tokenType === TokenType.Erc1155 && renderQuantity()}*/}
            {renderDeadline()}
            <Stack>
              <Stack fontSize="sm">
                <Stack direction="row">
                  <Text variant="captionSub">Total Listed</Text>
                  <Spacer />
                  <Text variant="captionSub">
                    {watch('price') || 0} {findToken(watch('paymentToken'))?.symbol || 'ETH'}
                  </Text>
                </Stack>
                {tokenType === TokenType.Erc1155 && (
                  <Stack direction="row">
                    <Text variant="captionSub">Quantity</Text>
                    <Spacer />
                    <Text variant="captionSub">{watch('quantity') || 1}</Text>
                  </Stack>
                )}
                <Stack direction="row">
                  <Text variant="captionSub">Fees</Text>
                  <Spacer />
                  <Text variant="captionSub">
                    {fees.toLocaleString(void 0, { maximumFractionDigits: 3, minimumFractionDigits: 3 })}{' '}
                    {findToken(watch('paymentToken'))?.symbol || 'ETH'}
                  </Text>
                </Stack>
                <Stack direction="row">
                  <Text variant="captionSub">Earning</Text>
                  <Spacer />
                  <Text variant="captionSub">
                    {earning.toLocaleString(void 0, { maximumFractionDigits: 3, minimumFractionDigits: 3 })}{' '}
                    {findToken(watch('paymentToken'))?.symbol || 'ETH'}
                  </Text>
                </Stack>
                {/*<Stack direction="row">*/}
                {/*  <Text color="#9a9a9a">Creator Royalties</Text>*/}
                {/*  <Spacer />*/}
                {/*  <Text>{creatorRoyalties.toFixed(2)}%</Text>*/}
                {/*</Stack>*/}
              </Stack>
            </Stack>
            <Stack>
              <Text fontSize="xs" color="#898989">
                What should X do with your marketplace fee?
                <Tooltip label="We will burn or donate 100% of the marketplace fee for $APE listings and 50% of the fee for any other listings.">
                  <Image display="inline-block" src="/assets/ic/info.png" />
                </Tooltip>
              </Text>
              <SelectFeeDistType value={feeDistType} onChange={setDistType} />
            </Stack>
            {renderPrivateListing()}
          </Stack>
          <Stack w="full">
            <Button
              type="submit"
              variant="outline"
              color="primary"
              w="100%"
              disabled={!isDirty || !isValid}
              isLoading={isLoadingApproved || isListing}
            >
              {buttonLabel}
            </Button>
            {/* <Button variant="outline" color="primary" w="100%" onClick={() => onClose()}>
              Cancel
            </Button> */}
          </Stack>
        </Stack>
      </chakra.form>
    )
  }

  return (
    <Overlay title="List for Sale" isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      {renderForm()}
    </Overlay>
  )
}
