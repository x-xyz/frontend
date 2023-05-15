import Address from 'components/Address'
import CrownIcon from 'components/icons/CrownIcon'
import Link from 'components/Link'
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
import { fetchCollectionV2 } from '@x/apis/fn'
import { findToken, getChainNameForUrl } from '@x/constants/dist'
import { ChainId, NftItem } from '@x/models'
import { compareAddress } from '@x/utils/dist'

export interface OfferListProps extends StackProps {
  nftitems?: NftItem[]
  isLoading?: boolean
  viewer: string
  isViewer?: boolean
}

export default function InactiveListingList({ nftitems = [], isLoading, viewer, isViewer, ...props }: OfferListProps) {
  return (
    <Stack spacing={5} {...props}>
      {nftitems.map(nftitem => (
        <MemoedItem
          key={`${nftitem.chainId}:${nftitem.contractAddress}:${nftitem.tokenId}`}
          nftitem={nftitem}
          viewer={viewer}
          isViewer={isViewer}
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

interface ItemProps {
  nftitem?: NftItem
  viewer?: string
  isViewer?: boolean
}

function Item({ nftitem, viewer, isViewer }: ItemProps) {
  const { locale } = useRouter()

  const listing = useMemo(
    () => nftitem?.listings.find(listing => compareAddress(listing.signer, viewer)),
    [nftitem, viewer],
  )

  const assetUrl = useMemo(
    () => nftitem && `/asset/${getChainNameForUrl(nftitem.chainId)}/${nftitem.contractAddress}/${nftitem.tokenId}`,
    [nftitem],
  )

  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', nftitem?.chainId || ChainId.Ethereum, nftitem?.contractAddress || ''],
    fetchCollectionV2,
    { enabled: !!nftitem },
  )

  const floorDifference = useMemo(() => {
    if (!listing) return '-'
    if (!collection?.usdFloorPrice) return '-'
    const rate = listing.priceInUsd / collection.usdFloorPrice
    if (rate < 1) return `${((1 - rate) * 100).toLocaleString(locale)}% below`
    return `${((rate - 1) * 100).toLocaleString(locale)}% above`
  }, [listing, collection?.usdFloorPrice, locale])

  const sortedOffers = useMemo(
    () => (nftitem?.offers ? [...nftitem.offers].sort((a, b) => b.priceInUsd - a.priceInUsd) : []),
    [nftitem],
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
          <GridItem fontSize="xs">Price (Listed)</GridItem>
          <GridItem fontSize="xs">USD Price</GridItem>
          <GridItem fontSize="xs">Floor Difference</GridItem>
          <GridItem fontSize="xs" colSpan={2}>
            Expiration
          </GridItem>
          <GridItem fontSize="xs">Listed Date</GridItem>
          <GridItem fontSize="sm">
            {listing ? (
              <Stack direction="row" align="center">
                <TokenIcon chainId={nftitem?.chainId} tokenId={listing.currency} w={7} h={7} />
                <Text>
                  {listing.displayPrice} {findToken(listing.currency, nftitem?.chainId)?.symbol}
                </Text>
              </Stack>
            ) : (
              '-'
            )}
          </GridItem>
          <GridItem fontSize="sm">
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {listing ? `$${listing.priceInUsd.toLocaleString(locale)}` : '-'}
            </SkeletonText>
          </GridItem>
          <GridItem fontSize="sm">
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {floorDifference}
            </SkeletonText>
          </GridItem>
          <GridItem fontSize="sm" colSpan={2}>
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {listing
                ? DateTime.fromISO(listing.endTime).toLocaleString(
                    { dateStyle: 'short', timeStyle: 'short' },
                    { locale },
                  )
                : '-'}
            </SkeletonText>
          </GridItem>
          <GridItem fontSize="sm">
            <SkeletonText noOfLines={1} isLoaded={!!nftitem}>
              {listing ? DateTime.fromISO(listing.startTime).toRelative({ locale }) : '-'}
            </SkeletonText>
          </GridItem>
          <GridItem>
            {isViewer && (
              <Link color="primary" href={assetUrl}>
                Cancel Listing
              </Link>
            )}
          </GridItem>
        </Grid>
      </Stack>
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
    </Box>
  )
}

const MemoedItem = memo(Item)
