import Address from 'components/Address'
import CancelAuctionButton from 'components/auction/v3/CancelAuctionButton'
import ConcludeAuctionButton from 'components/auction/v3/ConcludeAuctionButton'
import WithdrawBidButton from 'components/auction/v3/WithdrawBidButton'
import CrownIcon from 'components/icons/CrownIcon'
import Link from 'components/Link'
import CancelListingButton from 'components/marketplace/v3/CancelListingButton'
import TakeOfferButton from 'components/marketplace/v3/TakeOfferButton'
import Media from 'components/Media'
import SimpleTable from 'components/SimpleTable'
import TokenIcon from 'components/token/TokenIcon'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React, { memo, useMemo } from 'react'
import { useQuery } from 'react-query'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Box,
  Divider,
  Grid,
  GridItem,
  SkeletonText,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import { formatUnits } from '@ethersproject/units'
import { fetchCollectionV2 } from '@x/apis/fn'
import { findToken, getChainNameForUrl } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { ChainId, NftItem, PriceSource, TokenBid, TokenType } from '@x/models'
import { OrderItem } from '@x/models/dist'
import { compareAddress } from '@x/utils'
import { AddressZero } from '@ethersproject/constants'

interface EventCallbackProps {
  onAuctionCanceled?: (nftitem: NftItem) => void
  onAuctionConcluded?: (nftitem: NftItem) => void
  onBidWithdrawed?: (nftitem: NftItem) => void
  onListingCanceled?: (nftitem: NftItem) => void
  onOfferAccepted?: (nftitem: NftItem, offer: OrderItem) => void
  onOfferCanceled?: (nftitem: NftItem, offer: OrderItem) => void
}

export interface OfferListProps extends StackProps, EventCallbackProps {
  nftitems?: NftItem[]
  isLoading?: boolean
  isOwner?: boolean
}

export default function OfferList({
  nftitems = [],
  isLoading,
  isOwner,
  onAuctionCanceled,
  onAuctionConcluded,
  onBidWithdrawed,
  onListingCanceled,
  onOfferAccepted,
  onOfferCanceled,
  ...props
}: OfferListProps) {
  return (
    <Stack spacing={5} {...props}>
      {nftitems.map(nftitem => (
        <MemoedItem
          key={`${nftitem.chainId}:${nftitem.contractAddress}:${nftitem.tokenId}`}
          nftitem={nftitem}
          isOwner={isOwner}
          onAuctionCanceled={onAuctionCanceled}
          onAuctionConcluded={onAuctionConcluded}
          onBidWithdrawed={onBidWithdrawed}
          onListingCanceled={onListingCanceled}
          onOfferAccepted={onOfferAccepted}
          onOfferCanceled={onOfferCanceled}
        />
      ))}
      {isLoading && (
        <>
          <MemoedItem />
          <MemoedItem />
          <MemoedItem />
        </>
      )}
    </Stack>
  )
}

interface ItemProps extends EventCallbackProps {
  nftitem?: NftItem
  isOwner?: boolean
}

const priceSourceToPriceTitle: Record<PriceSource, string> = {
  [PriceSource.Listing]: 'Price(Listed)',
  [PriceSource.Offer]: 'Price',
  [PriceSource.AuctionReserve]: 'Reserved Price',
  [PriceSource.AuctionBid]: 'Bid Price',
}

const priceSourceToPrice: Record<PriceSource, (nftitem: NftItem, locale?: string) => React.ReactNode> = {
  [PriceSource.Listing]: item => (
    <Stack direction="row" align="center">
      <TokenIcon chainId={item.chainId} tokenId={item.paymentToken} w={7} h={7} />
      <Text>
        {item.price} {findToken(item.paymentToken, item.chainId)?.symbol}
      </Text>
    </Stack>
  ),
  [PriceSource.Offer]: () => '-',
  [PriceSource.AuctionReserve]: item => (
    <Stack direction="row" align="center">
      <TokenIcon chainId={item.chainId} tokenId={item.paymentToken} w={7} h={7} />
      <Text>
        {item.price} {findToken(item.paymentToken, item.chainId)?.symbol}
      </Text>
    </Stack>
  ),
  [PriceSource.AuctionBid]: item => (
    <Stack direction="row" align="center">
      <TokenIcon chainId={item.chainId} tokenId={item.paymentToken} w={7} h={7} />
      <Text>
        {item.price} {findToken(item.paymentToken, item.chainId)?.symbol}
      </Text>
    </Stack>
  ),
}

const priceSourceToUsdPrice: Record<PriceSource, (nftitem: NftItem, locale?: string) => React.ReactNode> = {
  [PriceSource.Listing]: (item, locale) => item.priceInUsd.toLocaleString(locale),
  [PriceSource.Offer]: () => '-',
  [PriceSource.AuctionReserve]: (item, locale) => item.priceInUsd.toLocaleString(locale),
  [PriceSource.AuctionBid]: (item, locale) => item.priceInUsd.toLocaleString(locale),
}

const priceSourceToListedDate: Record<PriceSource, (nftitem: NftItem, locale?: string) => React.ReactNode> = {
  [PriceSource.Listing]: (item, locale) =>
    item.activeListing ? DateTime.fromISO(item.activeListing.startTime).toRelative({ locale }) : '-',
  [PriceSource.Offer]: () => '-',
  [PriceSource.AuctionReserve]: (item, locale) =>
    item.auction.startTime ? DateTime.fromISO(item.auction.startTime).toRelative({ locale }) : '-',
  [PriceSource.AuctionBid]: (item, locale) =>
    item.auction.startTime ? DateTime.fromISO(item.auction.startTime).toRelative({ locale }) : '-',
}

const priceSourceToActionButton: Record<
  PriceSource,
  (nftitem: NftItem, eventCallback: EventCallbackProps) => React.ReactNode
> = {
  [PriceSource.Listing]: (nftitem, { onListingCanceled }) => {
    if (!nftitem.activeListing) return null
    return (
      <CancelListingButton
        variant="ghost"
        p={0}
        h="unset"
        color="primary"
        chainId={nftitem.chainId}
        orderItem={nftitem.activeListing}
        onListingCanceled={() => onListingCanceled?.(nftitem)}
      />
    )
  },
  [PriceSource.Offer]: () => null,
  [PriceSource.AuctionReserve]: (nftitem, { onAuctionCanceled, onAuctionConcluded }) => {
    if (!nftitem.auction.endTime) return null
    if (DateTime.fromISO(nftitem.auction.endTime).diffNow().valueOf() > 0)
      return (
        <CancelAuctionButton
          variant="ghost"
          p={0}
          h="unset"
          color="primary"
          chainId={nftitem.chainId}
          contractAddress={nftitem.contractAddress}
          tokenID={nftitem.tokenId}
          onAuctionCanceled={() => onAuctionCanceled?.(nftitem)}
        />
      )

    return (
      <ConcludeAuctionButton
        variant="ghost"
        p={0}
        h="unset"
        color="primary"
        chainId={nftitem.chainId}
        contractAddress={nftitem.contractAddress}
        tokenID={nftitem.tokenId}
        onConcluded={() => onAuctionConcluded?.(nftitem)}
      />
    )
  },
  [PriceSource.AuctionBid]: (nftitem, { onAuctionCanceled, onAuctionConcluded }) => {
    if (!nftitem.auction.endTime) return null
    if (DateTime.fromISO(nftitem.auction.endTime).diffNow().valueOf() > 0)
      return (
        <CancelAuctionButton
          variant="ghost"
          p={0}
          h="unset"
          color="primary"
          chainId={nftitem.chainId}
          contractAddress={nftitem.contractAddress}
          tokenID={nftitem.tokenId}
          onAuctionCanceled={() => onAuctionCanceled?.(nftitem)}
        />
      )

    return (
      <ConcludeAuctionButton
        variant="ghost"
        p={0}
        h="unset"
        color="primary"
        chainId={nftitem.chainId}
        contractAddress={nftitem.contractAddress}
        tokenID={nftitem.tokenId}
        onConcluded={() => onAuctionConcluded?.(nftitem)}
      />
    )
  },
}

function Item({ nftitem, isOwner, ...eventCallback }: ItemProps) {
  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  const assetUrl = useMemo(
    () => nftitem && `/asset/${getChainNameForUrl(nftitem.chainId)}/${nftitem.contractAddress}/${nftitem.tokenId}`,
    [nftitem],
  )

  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', nftitem?.chainId || ChainId.Ethereum, nftitem?.contractAddress || ''],
    fetchCollectionV2,
    { enabled: !!nftitem },
  )

  const [priceTitle, price] = useMemo(() => {
    if (!nftitem || !nftitem.priceSource || !nftitem.price) return ['Price', '-']
    return [priceSourceToPriceTitle[nftitem.priceSource], priceSourceToPrice[nftitem.priceSource](nftitem)]
  }, [nftitem])

  const floorDifference = useMemo(() => {
    if (!nftitem || !nftitem.priceInUsd || nftitem.priceSource === PriceSource.Offer) return '-'
    if (!collection?.usdFloorPrice) return '-'
    const rate = nftitem.priceInUsd / collection.usdFloorPrice
    if (rate < 1) return `${((1 - rate) * 100).toLocaleString(locale)}% below`
    return `${((rate - 1) * 100).toLocaleString(locale)}% above`
  }, [nftitem, collection?.usdFloorPrice, locale])

  const listedDate = useMemo(() => {
    if (!nftitem || !nftitem.priceSource) return '-'
    return priceSourceToListedDate[nftitem.priceSource](nftitem, locale)
  }, [nftitem, locale])

  function listingExpiration() {
    if (!nftitem || !nftitem.activeListing) return '-'

    const { endTime } = nftitem.activeListing
    if (!endTime || DateTime.fromISO(endTime).equals(DateTime.fromSeconds(0))) return '-'

    return DateTime.fromISO(nftitem.activeListing.endTime).toLocaleString(
      { dateStyle: 'short', timeStyle: 'short' },
      { locale },
    )
  }

  const sortedOffers = useMemo(
    () => (nftitem?.offers ? [...nftitem.offers].sort((a, b) => b.priceInUsd - a.priceInUsd) : []),
    [nftitem],
  )

  const sortedListings = useMemo(
    () =>
      nftitem?.listings
        // private listings are only visible to signer or reserved buyer
        ?.filter(listing => {
          if (!listing.reservedBuyer) return true
          return compareAddress(account, listing.signer) || compareAddress(account, listing.reservedBuyer)
        })
        .sort((a, b) => a.priceInUsd - b.priceInUsd) || [],
    [nftitem, account],
  )

  function renderMedia() {
    return (
      <AspectRatio ratio={1} w={20} h={20} flexShrink={0}>
        <Media
          contentType={nftitem?.contentType}
          mimetype={nftitem?.animationUrlMimeType}
          src={nftitem?.hostedAnimationUrl || nftitem?.animationUrl || nftitem?.hostedImageUrl || nftitem?.imageUrl}
          isLoading={!nftitem}
        />
      </AspectRatio>
    )
  }

  function renderListings() {
    return (
      <Accordion allowToggle m="-1px">
        <AccordionItem>
          <AccordionButton>
            <Text flex={1} textAlign="left" fontSize="sm" fontWeight="bold">
              All Listings
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel p={0}>
            <SimpleTable
              data={sortedListings}
              isLoading={!nftitem}
              fields={[
                {
                  key: 'action',
                  name: null,
                  render: item => {
                    if (!nftitem) return null

                    if (compareAddress(account, nftitem.owner) || compareAddress(account, item.signer)) {
                      return (
                        <CancelListingButton
                          chainId={item.chainId}
                          orderItem={item}
                          onListingCanceled={() => eventCallback.onListingCanceled?.(nftitem)}
                        />
                      )
                    }
                  },
                },
                {
                  key: 'price',
                  name: 'Price(Listed)',
                  render: item => (
                    <Stack direction="row" align="center">
                      <TokenIcon chainId={item.chainId} tokenId={item.currency} w={7} h={7} />
                      <Text>
                        {item.displayPrice} {findToken(item.currency, item.chainId)?.symbol}
                      </Text>
                    </Stack>
                  ),
                },
                { key: 'usd-price', name: 'USD Price', render: item => `$${item.priceInUsd}` },
                {
                  key: 'floor-difference',
                  name: 'Floor Difference',
                  render: item => {
                    if (!collection?.usdFloorPrice) return '-'
                    const rate = item.priceInUsd / collection.usdFloorPrice
                    if (rate < 1) return `${((1 - rate) * 100).toLocaleString(locale)}% below`
                    return `${((rate - 1) * 100).toLocaleString(locale)}% above`
                  },
                },
                {
                  key: 'expiration',
                  name: 'Expiration',
                  render: item => {
                    const datetime = DateTime.fromISO(item.endTime)
                    if (datetime.diffNow().valueOf() < 0) return <Text color="danger">Expired</Text>
                    return datetime.toRelative({ locale })
                  },
                },
                {
                  key: 'listed-at',
                  name: 'Listed Date',
                  render: item => DateTime.fromISO(item.startTime).toRelative({ locale }),
                },
              ]}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  function renderOffers() {
    return (
      <Accordion allowToggle m="-1px">
        <AccordionItem>
          <AccordionButton>
            <Text flex={1} textAlign="left" fontSize="sm" fontWeight="bold">
              All Offers
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel p={0}>
            <SimpleTable
              data={sortedOffers}
              isLoading={!nftitem}
              fields={[
                {
                  key: 'action',
                  name: null,
                  render: offer => {
                    if (!nftitem) return null

                    if (compareAddress(account, nftitem.owner)) {
                      return (
                        <TakeOfferButton
                          variant="ghost"
                          p={0}
                          h="unset"
                          color="primary"
                          chainId={nftitem.chainId}
                          contractAddress={nftitem.contractAddress}
                          tokenId={nftitem.tokenId}
                          offer={offer}
                          onOfferTook={() => eventCallback.onOfferAccepted?.(nftitem, offer)}
                          isErc1155={nftitem.tokenType === TokenType.Erc1155}
                        />
                      )
                    }

                    if (compareAddress(account, offer.signer)) {
                      return (
                        // <CancelOfferButton
                        //   chainId={nftitem.chainId}
                        //   contractAddress={nftitem.contractAddress}
                        //   tokenID={nftitem.tokenId}
                        //   onOfferCanceled={() => eventCallback.onOfferCanceled?.(nftitem, offer)}
                        // />
                        <CancelListingButton
                          chainId={offer.chainId}
                          orderItem={offer}
                          onListingCanceled={() => eventCallback.onOfferCanceled?.(nftitem, offer)}
                        />
                      )
                    }
                  },
                },
                {
                  key: 'is-best',
                  name: null,
                  render: offer => (
                    <Box w={4} h={4}>
                      {offer.priceInUsd === sortedOffers[0].priceInUsd && <CrownIcon />}
                    </Box>
                  ),
                },
                {
                  key: 'price',
                  name: 'Offers',
                  render: item => (
                    <Stack direction="row" align="center">
                      <TokenIcon chainId={nftitem?.chainId} tokenId={item.currency} w={7} h={7} />
                      <Text>
                        {item.displayPrice} {findToken(item.currency, nftitem?.chainId)?.symbol}
                      </Text>
                    </Stack>
                  ),
                },
                { key: 'usd-price', name: 'USD Price', render: item => `$${item.priceInUsd}` },
                {
                  key: 'floor-difference',
                  name: 'Floor Difference',
                  render: item => {
                    if (!collection?.usdFloorPrice) return '-'
                    const rate = item.priceInUsd / collection.usdFloorPrice
                    if (rate < 1) return `${((1 - rate) * 100).toLocaleString(locale)}% below`
                    return `${((rate - 1) * 100).toLocaleString(locale)}% above`
                  },
                },
                {
                  key: 'from',
                  name: 'From',
                  render: item => (
                    <Address type="account" color="primary">
                      {item.signer}
                    </Address>
                  ),
                },
                {
                  key: 'expiration',
                  name: 'Expiration',
                  render: item => {
                    const datetime = DateTime.fromISO(item.endTime)
                    if (datetime.diffNow().valueOf() < 0) return <Text color="danger">Expired</Text>
                    return datetime.toRelative({ locale })
                  },
                },
              ]}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  function renderBid(bid: TokenBid) {
    return (
      <Accordion allowToggle m="-1px">
        <AccordionItem>
          <AccordionButton>
            <Text flex={1} textAlign="left" fontSize="sm" fontWeight="bold">
              Bid
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel p={0}>
            <SimpleTable
              data={[bid]}
              isLoading={!nftitem}
              fields={[
                {
                  key: 'action',
                  name: null,
                  render: bid => {
                    if (!nftitem) return null

                    if (compareAddress(account, bid.owner)) {
                      return (
                        <Box pos="relative">
                          <WithdrawBidButton
                            variant="ghost"
                            p={0}
                            h="unset"
                            color="primary"
                            chainId={nftitem.chainId}
                            contractAddress={nftitem.contractAddress}
                            tokenID={nftitem.tokenId}
                            auction={nftitem.auction}
                            onBidWithdrawd={() => eventCallback.onBidWithdrawed?.(nftitem)}
                          />
                        </Box>
                      )
                    }
                  },
                },
                {
                  key: 'is-best',
                  name: null,
                  render: (_, index) => (
                    <Box w={4} h={4}>
                      {index === 0 && <CrownIcon />}
                    </Box>
                  ),
                },
                {
                  key: 'price',
                  name: 'Offers',
                  render: item => {
                    const payToken = findToken(item.payToken, nftitem?.chainId)
                    return (
                      <Stack direction="row" align="center">
                        <TokenIcon chainId={nftitem?.chainId} tokenId={item.payToken} w={7} h={7} />
                        <Text>
                          {formatUnits(item.bid, payToken?.decimals)} {payToken?.symbol}
                        </Text>
                      </Stack>
                    )
                  },
                },
                { key: 'usd-price', name: 'USD Price', render: item => `$${item.priceInUsd}` },
                {
                  key: 'floor-difference',
                  name: 'Floor Difference',
                  render: item => {
                    if (!collection?.usdFloorPrice) return '-'
                    const rate = item.priceInUsd / collection.usdFloorPrice
                    if (rate < 1) return `${((1 - rate) * 100).toLocaleString(locale)}% below`
                    return `${((rate - 1) * 100).toLocaleString(locale)}% above`
                  },
                },
                {
                  key: 'from',
                  name: 'From',
                  render: item => (
                    <Address type="account" color="primary">
                      {item.owner}
                    </Address>
                  ),
                },
                {
                  key: 'received',
                  name: 'Received',
                  render: item => DateTime.fromISO(item.bidTime).toRelative({ locale }),
                },
              ]}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Box border="1px solid" borderColor="divider">
      <Stack h="100px" direction="row" divider={<Divider orientation="vertical" />} bg="#272b2c" p={2.5}>
        <Link href={assetUrl}>
          <Stack direction="row">
            {renderMedia()}
            <Stack w="150px" py={1} fontWeight="bold">
              <SkeletonText noOfLines={2} isLoaded={!isLoadingCollection}>
                <Text fontSize="sm" lineHeight={1} isTruncated noOfLines={2} whiteSpace="break-spaces">
                  {collection?.collectionName}
                </Text>
              </SkeletonText>
              <SkeletonText noOfLines={2} isLoaded={!!nftitem}>
                <Text fontSize="xs" color="note" lineHeight={1} isTruncated noOfLines={2} whiteSpace="break-spaces">
                  {nftitem?.name}
                </Text>
              </SkeletonText>
            </Stack>
          </Stack>
        </Link>
        <Grid
          w="full"
          fontWeight="bold"
          templateColumns="repeat(6, 1fr)"
          templateRows="repeat(3, 1fr)"
          columnGap={1}
          rowGap={1}
        >
          <GridItem fontSize="xs">{priceTitle}</GridItem>
          <GridItem fontSize="xs">USD Price</GridItem>
          <GridItem fontSize="xs">Floor Difference</GridItem>
          <GridItem fontSize="xs" colSpan={2}>
            Expiration
          </GridItem>
          <GridItem fontSize="xs">Listed Date</GridItem>
          <GridItem fontSize="sm">{price}</GridItem>
          <GridItem fontSize="sm">
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {nftitem && nftitem.priceSource ? priceSourceToUsdPrice[nftitem.priceSource](nftitem, locale) : '-'}
            </SkeletonText>
          </GridItem>
          <GridItem fontSize="sm">
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {floorDifference}
            </SkeletonText>
          </GridItem>
          <GridItem fontSize="sm" colSpan={2}>
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {listingExpiration()}
            </SkeletonText>
          </GridItem>
          <GridItem fontSize="sm">
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {listedDate}
            </SkeletonText>
          </GridItem>
          <GridItem>
            {isOwner && nftitem?.priceSource && priceSourceToActionButton[nftitem.priceSource](nftitem, eventCallback)}
          </GridItem>
        </Grid>
      </Stack>
      {sortedListings.length > 0 && renderListings()}
      {sortedOffers.length > 0 && renderOffers()}
      {nftitem?.highestBid?.bidTime && renderBid(nftitem.highestBid)}
    </Box>
  )
}

const MemoedItem = memo(Item)
