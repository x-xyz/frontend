import Address from 'components/Address'
import { SimpleField } from 'components/SimpleTable'
import SimpleTableWithScrollbar from 'components/SimpleTableWithScrollbar'
import TokenIcon from 'components/token/TokenIcon'
import { reduce } from 'lodash'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'

import { Image } from '@chakra-ui/image'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Box,
  Divider,
  HStack,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react'
import { fetchCollectionV2, fetchTokenActivities } from '@x/apis/dist/fn'
import { findToken } from '@x/constants'
import { Activity, ActivityHistory, NftItem, OrderItem, TokenType } from '@x/models/dist'
import Link from '../Link'
import { getChainNameForUrl } from '@x/constants/dist'
import Media from '../Media'
import { builtInCollections } from '../../configs'
import { formatUnits } from '@ethersproject/units'
import CancelListingButton from '../marketplace/signature-base/CancelListingButton'
import TakeOfferButton from '../marketplace/signature-base/TakeOfferButton'

export interface OfferListingCardProps {
  nft: NftItem
  listings: OrderItem[]
  offers: OrderItem[]
}

const contractToName: Record<string, string> = {}

builtInCollections.forEach(c => (contractToName[c.address] = c.name))

export default function OfferListingCard({ nft, listings, offers }: OfferListingCardProps) {
  const nftUrl = nft && `/asset/${getChainNameForUrl(nft.chainId)}/${nft.contractAddress}/${nft.tokenId}`

  const contentType = nft.animationUrlContentType || nft.contentType

  const mimeType = nft.animationUrlMimeType

  const mediaUrl = nft.hostedAnimationUrl || nft.hostedImageUrl || nft.imageUrl

  const topListing = useMemo(() => {
    if (listings.length === 0) return
    return listings.filter(listing => listing.isValid).sort((a, b) => a.priceInUsd - b.priceInUsd)[0]
  }, [listings])

  const topOffer = useMemo(() => {
    if (offers.length === 0) return
    return offers.filter(offer => offer.isValid).sort((a, b) => a.priceInUsd - b.priceInUsd)[0]
  }, [offers])

  const orderItem = topListing || topOffer

  const orderType = orderItem === topListing ? 'listing' : 'offer'

  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', nft.chainId, nft.contractAddress],
    fetchCollectionV2,
  )

  const floorDifference = useMemo(() => {
    if (!orderItem || !collection) return 0

    return (orderItem.priceInNative - collection.openseaFloorPriceInNative) / collection.openseaFloorPriceInNative
  }, [orderItem, collection])

  function renderPrice(orderItem: OrderItem) {
    const { price, currency, chainId } = orderItem

    const paymentToken = findToken(currency, chainId)

    const type = orderType === 'listing' ? 'Listed' : 'Offer'

    return (
      <Stack>
        <Text variant="body2">{type}</Text>
        <Text variant="body2">
          {formatUnits(price, paymentToken?.decimals)} {paymentToken?.symbol}
        </Text>
      </Stack>
    )
  }

  function renderTime(item: OrderItem) {
    return DateTime.fromISO(item.endTime).toLocaleString(DateTime.DATETIME_SHORT)
  }

  function renderRow(orderItem: OrderItem, orderType: 'listing' | 'offer') {
    return (
      <Stack spacing={4}>
        <HStack alignItems="stretch">
          {/*Price*/}
          <Stack spacing={1} flex="1 0 0">
            <Text variant="caption" color="textSecondary">
              Price
            </Text>
            {renderPrice(orderItem)}
          </Stack>
          {/*USD Price*/}
          <Stack spacing={1} flex="1 0 0">
            <Text variant="caption" color="textSecondary">
              USD Price
            </Text>
            <Text variant="body2">${orderItem.priceInUsd.toLocaleString()}</Text>
          </Stack>
        </HStack>
        <HStack alignItems="stretch">
          {/*Floor Difference*/}
          <Stack spacing={1} flex="1 0 0">
            <Text variant="caption" color="textSecondary">
              Floor Difference
            </Text>
            <SkeletonText
              noOfLines={1}
              isLoaded={!isLoadingCollection}
              color={floorDifference < 0 ? 'danger' : 'success'}
            >
              <Text variant="body2">
                {floorDifference > 0 && '+'}
                {(floorDifference * 100).toFixed(2)}%
              </Text>
            </SkeletonText>
          </Stack>
          {/*Expiration*/}
          <Stack spacing={1} flex="1 0 0">
            <Text variant="caption" color="textSecondary">
              Expiration
            </Text>
            <Text variant="body2">{renderTime(orderItem)}</Text>
          </Stack>
        </HStack>
        <HStack alignItems="stretch">
          {/*Empty space*/}
          <Stack flex="1 0 0"></Stack>
          {/*Action*/}
          <Stack spacing={1} flex="1 0 0">
            {orderType === 'listing' && (
              <CancelListingButton
                variant="outline"
                minW="83px"
                px="6px"
                h="8"
                width="fit-content"
                alignSelf="end"
                orderItem={orderItem}
              >
                Cancel
              </CancelListingButton>
            )}
            {orderType === 'offer' && (
              <TakeOfferButton
                collection={collection}
                nftItem={nft}
                variant="solid"
                h="8"
                offer={orderItem}
                isErc1155={nft.tokenType === TokenType.Erc1155}
              />
            )}
          </Stack>
        </HStack>
      </Stack>
    )
  }

  if (!orderItem) return null

  return (
    <Stack spacing={4}>
      <Stack spacing={4} py={4}>
        <Link href={nftUrl}>
          <Stack direction="row">
            <Box>
              <AspectRatio ratio={1} w={10} h={10} overflow="hidden">
                <Media h="full" w="full" contentType={contentType} mimetype={mimeType} src={mediaUrl} />
              </AspectRatio>
            </Box>
            <Stack spacing={0}>
              <Text fontSize="xs">{contractToName[nft.contractAddress]}</Text>
              <Text fontSize="lg">{nft.name}</Text>
            </Stack>
          </Stack>
        </Link>
        {renderRow(orderItem, 'listing')}
      </Stack>
      {offers.length > 0 && (
        <Accordion allowToggle defaultIndex={[0]}>
          <AccordionItem bg="#1E1E1E" mx={-4}>
            <AccordionButton display="flex" justifyContent="space-between" px={5}>
              {offers.length} Offers
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel py={0}>
              {offers.map(offer => (
                <Box key={offer.orderHash} py={4}>
                  {renderRow(offer, 'offer')}
                </Box>
              ))}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </Stack>
  )
}
