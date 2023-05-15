import { TokenType } from '@x/models/dist'
import ChainIcon from 'components/ChainIcon'
import Link from 'components/Link'
import Media from 'components/Media'
import Price from 'components/v3/Price'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

import {
  AspectRatio,
  Center,
  Divider,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import { fetchCollectionV2 } from '@x/apis/fn'
import { findToken, getChainNameForUrl } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { Collection, NftItem, PriceSource } from '@x/models'
import { compareAddress } from '@x/utils'

import AuctionCountdown from './AuctionCountdown'
import LikeButton from './LikeButton'
import { AddressZero } from '@ethersproject/constants'

export interface NftCardProps extends StackProps {
  nft?: NftItem
  collection?: Collection
}

const priceSourceToLabel: Record<PriceSource, string> = {
  [PriceSource.AuctionBid]: 'Highest Bid',
  [PriceSource.AuctionReserve]: 'Highest Bid',
  [PriceSource.Listing]: 'Price',
  [PriceSource.Offer]: 'Price',
}

const priceSourceToActionLabel: Record<PriceSource, string> = {
  [PriceSource.AuctionBid]: 'Bid',
  [PriceSource.AuctionReserve]: 'Bid',
  [PriceSource.Listing]: 'Buy',
  [PriceSource.Offer]: 'Offer',
}

export default function NftCard({ nft, collection: initialCollection, ...props }: NftCardProps) {
  const { account } = useActiveWeb3React()

  const isOwner = useMemo(() => {
    if (nft?.owner) return compareAddress(account, nft.owner)
    if (nft?.balance) return nft?.balance > 0
    return false
  }, [account, nft])

  const { data: collection = initialCollection, isLoading: isLoadingCollection } = useQuery(
    ['collection', nft?.chainId || 0, nft?.contractAddress || ''],
    fetchCollectionV2,
    {
      enabled: !!nft,
      initialData: initialCollection,
    },
  )

  const {
    imageUrl,
    hostedImageUrl,
    name,
    chainId,
    contractAddress,
    tokenId,
    priceInUsd,
    liked,
    isLiked,
    lastSalePrice,
    lastSalePricePaymentToken,
    contentType,
    animationUrl,
    animationUrlContentType,
    animationUrlMimeType,
    hostedAnimationUrl,
    auction,
    balance,
  } = nft || {}

  let { priceSource, price, paymentToken } = nft || {}

  if (auction && auction.startTime && auction.endTime) {
    const now = DateTime.now()
    if (DateTime.fromISO(auction.startTime) < now && now < DateTime.fromISO(auction.endTime)) {
      priceSource = PriceSource.AuctionReserve
      price = Number(auction.displayPrice)
      paymentToken = auction.payToken
    }
  } else if (priceSource === PriceSource.Listing && nft?.activeListing?.reservedBuyer) {
    const canSeePrivateListing =
      compareAddress(nft?.activeListing?.reservedBuyer, account) || compareAddress(nft.activeListing?.signer, account)

    if (!canSeePrivateListing) {
      priceSource = void 0
      price = void 0
      paymentToken = void 0
    }
  }

  const nftUrl = nft && `/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${tokenId}`

  return (
    <Stack w="260px" h="460px" border="1px solid" borderColor="divider" spacing={0} {...props}>
      <Link href={nftUrl}>
        <AspectRatio ratio={1} borderBottom="1px solid" borderColor="divider">
          <Media
            contentType={animationUrlContentType || contentType}
            mimetype={animationUrlMimeType}
            src={hostedAnimationUrl || animationUrl || hostedImageUrl || imageUrl}
            isLoading={!nft}
            w="full"
            h="full"
          />
        </AspectRatio>
      </Link>
      <Stack px={5} py={4} spacing={1}>
        <Stack direction="row" w="full">
          <Stack flexGrow={1} overflow="hidden">
            <Link href={`/collection/${getChainNameForUrl(collection?.chainId)}/${collection?.erc721Address}`}>
              <SkeletonText fontSize="sm" fontWeight="bold" isLoaded={!isLoadingCollection} noOfLines={1} isTruncated>
                {collection?.collectionName}
              </SkeletonText>
            </Link>
            <Stack spacing={0}>
              <SkeletonText isLoaded={!!nft}>
                <Link href={nftUrl} color="note">
                  <Text color="note" fontSize="xs" fontWeight="bold" noOfLines={1} isTruncated>
                    {name}
                  </Text>
                </Link>
              </SkeletonText>
              <SkeletonText fontSize="xs" fontWeight="bold" color="value" isLoaded={!!nft} noOfLines={1} h="1rem">
                {balance && `Owns: ${balance}`}
              </SkeletonText>
            </Stack>
          </Stack>
          <LikeButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            count={liked}
            defaultIsLiked={isLiked}
            isLoading={!tokenId}
          />
        </Stack>
        <Stack direction="row" spacing={0} align="center">
          <SkeletonCircle
            as={Center}
            w="30px"
            h="30px"
            borderRadius="15px"
            overflow="hidden"
            bg="reaction"
            flexShrink={0}
            isLoaded={!!chainId}
          >
            {chainId && <ChainIcon chainId={chainId} />}
          </SkeletonCircle>
          <Divider />
          {priceSource === PriceSource.AuctionReserve && auction?.endTime && (
            <AuctionCountdown saleEndsAt={auction.endTime} flexShrink={0} />
          )}
        </Stack>
        <Stack direction="row" align="center">
          <Stack spacing={0}>
            <Price
              label={priceSourceToLabel[priceSource || PriceSource.Listing]}
              price={price}
              priceInUsd={priceInUsd}
              unit={paymentToken && findToken(paymentToken, chainId)?.symbol}
              isLoading={!nft}
              sx={{ 'dd:first-of-type': { fontSize: 'md' } }}
            />
            {lastSalePricePaymentToken && (
              <Text fontSize="xs" fontWeight="bold" color="value">
                Last Sale: {lastSalePrice} {findToken(lastSalePricePaymentToken, chainId)?.symbol}
              </Text>
            )}
          </Stack>
          <Spacer />
          <Link color="primary" href={nftUrl} pb={3}>
            {isOwner ? 'View' : priceSource ? priceSourceToActionLabel[priceSource] : 'Offer'}
          </Link>
        </Stack>
      </Stack>
    </Stack>
  )
}
