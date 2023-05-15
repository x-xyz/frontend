import {
  Button,
  ButtonProps,
  Checkbox,
  Divider,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  NumberInput,
  SkeletonText,
  Stack,
  Text,
  TextProps,
  Portal,
  Tooltip,
} from '@chakra-ui/react'
import { ChainId, Collection, NftItem, Order, signMakerOrder, FeeDistType } from '@x/models'
import Layout from 'components/Layout'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueries, useQuery } from 'react-query'
import * as apis from '@x/apis/fn'
import { useRouter } from 'next/router'
import { useActiveWeb3React } from '@x/hooks'
import RefreshIcon from 'components/icons/RefreshIcon'
import { DateTime } from 'luxon'
import SelectToken from 'components/input/SelectToken'
import BulkListingButton, { PendingListing } from 'components/marketplace/signature-base/BulkListingButton'
import SimpleTableWithScrollbar from 'components/SimpleTableWithScrollbar'
import Media from 'components/Media'
import { addresses, findToken, getChain } from '@x/constants'
import DatePicker from 'components/DatePicker'
import { FaTrash } from 'react-icons/fa'
import { fetchAccountOrderNonce, fetchCollectionV2, makeOrder } from '@x/apis/fn'
import UsdPrice from 'components/UsdPrice'
import { compareAddress } from '@x/utils'
import useAuthToken from 'hooks/useAuthToken'
import { parseUnits } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/solidity'
import { defaultAbiCoder } from '@ethersproject/abi'
import { handleError } from '@x/web3/dist'
import useToast from 'hooks/useToast'
import SelectFeeDistType from 'components/input/SelectFeeDistType'

export default function BulkListing() {
  const { account, chainId } = useActiveWeb3React()

  if (!account || !chainId) return null

  return <Impl account={account} chainId={chainId} />
}

interface ImplProps {
  account: string
  chainId: ChainId
}

function Impl({ account, chainId }: ImplProps) {
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])

  const [selected, setSelected] = useState<boolean[]>([])

  const selectedCount = useMemo(() => selected.reduce((acc, value) => (value ? acc + 1 : acc), 0), [selected])

  const [endTime, setEndTime] = useState<Date>(new Date())

  const [isConfirmingListings, setConfirmingListings] = useState(false)

  const { library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const toast = useToast()

  const { back } = useRouter()

  const [bulkListPaymentToken, setBulkListPaymentToken] = useState<string>(
    getChain(ChainId.Ethereum).nativeCurrency.address,
  )

  const collectionAddresses = useMemo(
    () => [...pendingListings.reduce((acc, pl) => acc.add(pl.token.contractAddress), new Set<string>())],
    [pendingListings],
  )

  const collections = useQueries(
    collectionAddresses.map(collectionAddress => ({
      queryKey: ['collection', ChainId.Ethereum, collectionAddress],
      queryFn: () => fetchCollectionV2({ queryKey: ['collection', ChainId.Ethereum, collectionAddress], meta: {} }),
    })),
  )

  useEffect(() => {
    const data = sessionStorage.getItem('account-bulk-listing')

    if (!data) return

    sessionStorage.removeItem('account-bulk-listing')

    const nftItems: NftItem[] = JSON.parse(data)

    setPendingListings(
      nftItems.map(token => ({
        token,
        price: '0',
        paymentToken: getChain(token.chainId).nativeCurrency.address,
        quatity: '1',
      })),
    )

    setSelected(nftItems.map(() => false))
  }, [])

  const {
    data: externalListings,
    isLoading: isLoadingExternalListings,
    refetch: refetchExternalListings,
  } = useQuery(['external-listings', account], apis.fetchExternalListings)

  const { mutateAsync: refreshExternalListings, isLoading: isRefreshingExternalListings } = useMutation(
    apis.refreshExternalListings,
    { onSuccess: () => refetchExternalListings() },
  )

  const externalListingsUpdatedAt = useMemo(() => {
    if (!externalListings || externalListings.length === 0) {
      return 0
    }
    return DateTime.fromISO(externalListings[0].updatedTime).toMillis()
  }, [externalListings])

  const [feeDistType, setFeeDistType] = useState(FeeDistType.Burn)

  function calculateMarketplaceFee({ price, paymentToken, token }: PendingListing) {
    const apeToken = findToken('APE', token.chainId)
    const percentage = compareAddress(paymentToken, apeToken?.address) ? 0.0025 : 0.005
    return parseFloat(price) * percentage
  }

  function calculateCreatorFee({ price }: PendingListing, { royalty }: Collection) {
    const percentage = royalty * 0.01
    return parseFloat(price) * percentage
  }

  function applyOpenSeaListedPrice() {
    setPendingListings(prev => {
      const next = [...prev]

      for (let i = 0; i < selected.length; i++) {
        if (!selected[i]) continue

        const pl = pendingListings[i]

        const el = externalListings?.find(
          el =>
            el.chainId === pl.token.chainId &&
            compareAddress(el.contractAddress, pl.token.contractAddress) &&
            el.tokenId === pl.token.tokenId,
        )

        if (el) {
          next[i] = { ...prev[i], price: el.price, paymentToken: el.paymentToken }
        }
      }

      return next
    })
  }

  function applyOpenSeaFloorPrice() {
    setPendingListings(prev => {
      const next = [...prev]

      for (let i = 0; i < selected.length; i++) {
        if (!selected[i]) continue

        const pl = pendingListings[i]

        const col = collections.find(c => c.data && compareAddress(c.data.erc721Address, pl.token.contractAddress))

        if (col && col.data) {
          next[i] = {
            ...prev[i],
            price: `${col.data.openseaFloorPriceInNative}`,
            paymentToken: getChain(pl.token.chainId).nativeCurrency.address,
          }
        }
      }

      return next
    })
  }

  function applyBulkListPrice(value: string) {
    setPendingListings(prev => {
      const next = [...prev]

      for (let i = 0; i < selected.length; i++) {
        if (!selected[i]) continue

        const pl = pendingListings[i]

        const price = parseFloat(value)

        if (!isNaN(price)) {
          next[i] = {
            ...prev[i],
            price: `${price}`,
            paymentToken: getChain(pl.token.chainId).nativeCurrency.address,
          }
        }
      }

      return next
    })
  }

  const sellPaymentToken = useMemo(() => {
    if (pendingListings.length === 0) return
    return (
      findToken(pendingListings[0].paymentToken, pendingListings[0].token.chainId) ||
      getChain(pendingListings[0].token.chainId).nativeCurrency
    )
  }, [pendingListings])

  async function confirmListings() {
    setConfirmingListings(true)

    try {
      if (!library) throw new Error('cannot get library')
      if (!sellPaymentToken) throw new Error('cannot get payment token')
      const { nonce } = await fetchAccountOrderNonce(account, chainId, authToken)
      const order: Order = {
        chainId,
        isAsk: true,
        signer: account,
        items: pendingListings.map(listing => ({
          collection: listing.token.contractAddress,
          tokenId: listing.token.tokenId,
          amount: listing.quantity || '1',
          price: parseUnits(listing.price, sellPaymentToken.decimals).toString(),
        })),
        strategy: addresses.strategyFixedPrice[chainId],
        currency: sellPaymentToken.address,
        nonce,
        startTime: DateTime.now().startOf('second').toSeconds().toString(),
        endTime: DateTime.fromJSDate(endTime).startOf('second').toSeconds().toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256(['string'], ['apecoin']),
        params: defaultAbiCoder.encode([], []),
        feeDistType,
      }
      const signedOrder = await signMakerOrder(library.getSigner(), chainId, addresses.exchange[chainId], order)
      await makeOrder(signedOrder)
      back()
    } catch (err) {
      handleError(err, { toast })
    } finally {
      setConfirmingListings(false)
    }
  }

  useEffect(() => {
    setPendingListings(prev => {
      const next = [...prev]

      for (let i = 0; i < selected.length; i++) {
        if (!selected[i]) continue

        next[i] = { ...prev[i], paymentToken: bulkListPaymentToken }
      }

      return next
    })
  }, [bulkListPaymentToken, selected])

  const totalAmount = useMemo(
    () => pendingListings.reduce((acc, pl) => acc + parseFloat(pl.price), 0),
    [pendingListings],
  )

  const totalFees = useMemo(
    () =>
      pendingListings.reduce((acc, pl) => {
        const col: Collection | undefined = collections.find(
          c => c.data && compareAddress(c.data.erc721Address, pl.token.contractAddress),
        )?.data
        const creatorFee = col ? calculateCreatorFee(pl, col) : 0
        return acc + calculateMarketplaceFee(pl) + creatorFee
      }, 0),
    [pendingListings, collections],
  )

  return (
    <Layout>
      <Stack mt={6} spacing={8} h="full">
        <Stack direction="row" align="center" spacing={4}>
          <IconButton
            variant="unstyled"
            icon={<Image src="/assets/icons/ico-back-btn.png" />}
            aria-label="back"
            onClick={back}
          />
          <Heading fontSize="20px">List for Sale</Heading>
        </Stack>
        <Divider />
        <Stack bg="#1E1E1E" px={6} py={4}>
          <Text fontSize="sm">Apply to Selected</Text>
          <Stack direction="row" spacing={8}>
            <RefreshPriceButton
              lastUpdated={externalListingsUpdatedAt}
              isLoading={isLoadingExternalListings || isRefreshingExternalListings}
              onClick={() => refreshExternalListings(account)}
            />
            <Button onClick={applyOpenSeaListedPrice} disabled={externalListings?.length === 0}>
              OpenSea Listed Price
            </Button>
            <Button onClick={applyOpenSeaFloorPrice}>OpenSea Floor Price</Button>
            <InputGroup flexShrink={1} maxW="300px">
              <Input placeholder="Bulk List Price" onChange={e => applyBulkListPrice(e.target.value)} />
              <InputRightElement w={20}>
                <SelectToken chainId={chainId} value={bulkListPaymentToken} onChange={setBulkListPaymentToken} />
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Stack>
        <Stack direction="row">
          <Stack>
            <Text size="xs" color="#898989">
              Listing Duration
            </Text>
            <DatePicker
              dateFormat="yyyy/MM/dd h:mm aa"
              showTimeSelect
              h={10}
              minW="400px"
              onChange={v => v instanceof Date && setEndTime(v)}
              selected={endTime}
              popperContainer={CalendarContainer}
            />
          </Stack>
          <Stack>
            <Text size="xs" color="#898989">
              What should X do with your marketplace fee?
              <Tooltip label="We will burn or donate 100% of the marketplace fee for $APE listings and 50% of the fee for any other listings.">
                <Image display="inline-block" src="/assets/ic/info.png" />
              </Tooltip>
            </Text>
            <SelectFeeDistType value={feeDistType} onChange={setFeeDistType} />
          </Stack>
        </Stack>
        <SimpleTableWithScrollbar
          fields={[
            {
              key: 'checkbox',
              name: (
                <Checkbox
                  isChecked={selectedCount !== 0 && selectedCount === selected.length}
                  isIndeterminate={selectedCount !== 0 && selectedCount !== selected.length}
                  onChange={e => setSelected(prev => prev.map(() => e.target.checked))}
                />
              ),
              render: (_, index) => (
                <Checkbox
                  isChecked={selected[index]}
                  onChange={e =>
                    setSelected(prev => {
                      const next = [...prev]
                      next[index] = e.target.checked
                      return next
                    })
                  }
                />
              ),
            },
            {
              name: 'Item',
              render: item => (
                <Stack direction="row">
                  <Media
                    contentType={item.token.animationUrlContentType || item.token.contentType}
                    mimetype={item.token.animationUrlMimeType}
                    src={item.token.hostedAnimationUrl || item.token.hostedImageUrl || item.token.imageUrl}
                    w={10}
                    h={10}
                  />
                  <Stack>
                    <Text maxW="160px" overflow="hidden" textOverflow="ellipsis">
                      {item.token.name}
                    </Text>
                  </Stack>
                </Stack>
              ),
            },
            {
              name: 'Last Price',
              nameToRight: true,
              render: item => (
                <Stack>
                  <Text>
                    {item.token.lastSalePrice}{' '}
                    {findToken(item.token.lastSalePricePaymentToken, item.token.chainId)?.symbol}
                  </Text>
                  <Text color="#898989">${item.token.lastSalePriceInUSD || '0'}</Text>
                </Stack>
              ),
            },
            {
              name: 'Floor Price',
              nameToRight: true,
              render: item => (
                <WithCollectionData token={item.token}>
                  {(col, isLoading) => (
                    <Stack>
                      <SkeletonText noOfLines={1} isLoaded={!isLoading}>
                        {col?.openseaFloorPriceInNative.toLocaleString()}{' '}
                        {getChain(item.token.chainId).nativeCurrency.symbol}
                      </SkeletonText>
                      <UsdPrice
                        tokenId={getChain(item.token.chainId).nativeCurrency.symbol}
                        chainId={item.token.chainId}
                        prefix="$"
                        color="#898989"
                      >
                        {col?.openseaFloorPriceInNative || 0}
                      </UsdPrice>
                    </Stack>
                  )}
                </WithCollectionData>
              ),
            },
            {
              name: 'List Price',
              render: (item, index) => (
                <InputGroup minW="160px">
                  <Input
                    value={item.price}
                    onChange={e =>
                      setPendingListings(prev => {
                        const next = [...prev]
                        next[index].price = e.target.value
                        return next
                      })
                    }
                  />
                  <InputRightElement w="80px">
                    <SelectToken
                      chainId={item.token.chainId}
                      value={item.paymentToken}
                      onChange={v => setPendingListings(prev => prev.map(pl => ({ ...pl, paymentToken: v })))}
                    />
                  </InputRightElement>
                </InputGroup>
              ),
              nameToRight: true,
            },
            {
              name: 'Marketplace Fee',
              nameToRight: true,
              render: item => {
                const fee = calculateMarketplaceFee(item)
                return (
                  <Stack>
                    <Text>
                      {fee.toLocaleString()} {findToken(item.paymentToken, item.token.chainId)?.symbol}
                    </Text>
                    <UsdPrice prefix="$" color="#898989" tokenId={item.paymentToken} chainId={item.token.chainId}>
                      {fee}
                    </UsdPrice>
                  </Stack>
                )
              },
            },
            {
              name: 'Creator Fee',
              nameToRight: true,
              render: item => (
                <WithCollectionData token={item.token}>
                  {(col, isLoading) => {
                    const fee = col ? calculateCreatorFee(item, col) : 0
                    return (
                      <Stack>
                        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
                          {fee.toLocaleString()} {findToken(item.paymentToken, item.token.chainId)?.symbol}
                        </SkeletonText>
                        <UsdPrice prefix="$" color="#898989" tokenId={item.paymentToken} chainId={item.token.chainId}>
                          {fee}
                        </UsdPrice>
                      </Stack>
                    )
                  }}
                </WithCollectionData>
              ),
            },
            {
              name: 'Delete',
              nameToRight: true,
              render: item => (
                <IconButton
                  variant="ghost"
                  icon={<FaTrash />}
                  aria-label="Delete"
                  onClick={() =>
                    setPendingListings(prev => {
                      const next = [...prev]
                      const index = prev.findIndex(
                        p =>
                          p.token.tokenId === item.token.tokenId &&
                          compareAddress(p.token.contractAddress, item.token.contractAddress),
                      )
                      next.splice(index, 1)
                      return next
                    })
                  }
                />
              ),
            },
          ]}
          data={pendingListings}
        />
        <Stack direction="row" fontSize="sm" justify="flex-end" spacing={6}>
          <Text>Total</Text>
          <Stack align="flex-end">
            <Text>
              {totalAmount.toLocaleString()} {sellPaymentToken?.symbol}
            </Text>
            <UsdPrice chainId={chainId} tokenId={sellPaymentToken?.address} color="#898989" prefix="$">
              {totalAmount}
            </UsdPrice>
          </Stack>
          <Text>-</Text>
          <Stack align="flex-end">
            <Text>
              Fees {totalFees.toLocaleString()} {sellPaymentToken?.symbol}
            </Text>
            <UsdPrice chainId={chainId} tokenId={sellPaymentToken?.address} color="#898989" prefix="$">
              {totalFees}
            </UsdPrice>
          </Stack>
          <Text>=</Text>
          <Stack align="flex-end">
            <Text>
              Earning {(totalAmount - totalFees).toLocaleString()} {sellPaymentToken?.symbol}
            </Text>
            <UsdPrice chainId={chainId} tokenId={sellPaymentToken?.address} color="#898989" prefix="$">
              {totalAmount - totalFees}
            </UsdPrice>
          </Stack>
          <Button onClick={confirmListings} isLoading={isConfirmingListings} disabled={isConfirmingListings}>
            Complete Listing
          </Button>
        </Stack>
      </Stack>
    </Layout>
  )
}

function RefreshPriceButton({ lastUpdated, ...props }: { lastUpdated: number } & ButtonProps) {
  return (
    <Stack direction="row" align="center" spacing={5}>
      <IconButton
        variant="icon"
        icon={<RefreshIcon w={10} h={10} />}
        aria-label="refresh price"
        border="1px solid"
        borderColor="divider"
        {...props}
      />
      <Text color="note" fontSize="sm" whiteSpace="nowrap">
        {lastUpdated === 0 ? (
          'Press refresh to update data'
        ) : (
          <>
            Prices last updated at{' '}
            <Text as="span" color="#text" fontSize="sm">
              {DateTime.fromMillis(lastUpdated).toLocaleString({ timeStyle: 'short', dateStyle: 'long' })}
            </Text>
          </>
        )}
      </Text>
    </Stack>
  )
}

interface WithCollectionDataProps {
  token: NftItem
  children: (collection: Collection | undefined, isLoading: boolean) => React.ReactNode
}

function WithCollectionData({ token, children }: WithCollectionDataProps) {
  const { data, isLoading } = useQuery(['collection', token.chainId, token.contractAddress], fetchCollectionV2)
  return <>{children(data, isLoading)}</>
}

function CalendarContainer({ children }: { children: React.ReactNode }) {
  return <Portal>{children}</Portal>
}
