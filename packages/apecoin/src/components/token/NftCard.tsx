import Link from 'components/Link'
import Media from 'components/Media'
import Price from 'components/Price'
import { DateTime } from 'luxon'

import { AspectRatio, SkeletonText, Spacer, Stack, StackProps, Text } from '@chakra-ui/react'
import { findToken, getChainNameForUrl } from '@x/constants'
import { NftItem, PriceSource, TokenType } from '@x/models'

import AuctionCountdown from './AuctionCountdown'
import LikeButton from './LikeButton'
import { useActiveWeb3React } from '@x/hooks'
import { compareAddress } from '@x/utils/dist'

export interface NftCardProps extends StackProps {
  nft?: NftItem
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

export default function NftCard({ nft, ...props }: NftCardProps) {
  const { account } = useActiveWeb3React()

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
    owner,
    balance = 0,
    tokenType,
  } = nft || {}

  const isOwned = tokenType === TokenType.Erc1155 ? balance > 0 : compareAddress(owner, account)

  let { priceSource, price, paymentToken } = nft || {}

  if (auction && auction.startTime && auction.endTime) {
    const now = DateTime.now()
    if (DateTime.fromISO(auction.startTime) < now && now < DateTime.fromISO(auction.endTime)) {
      priceSource = PriceSource.AuctionReserve
      price = Number(auction.displayPrice)
      paymentToken = auction.payToken
    }
  }

  const nftUrl = nft && `/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${tokenId}`

  return (
    <Stack w="232px" h="372px" p="10px" bg="panel" _hover={{ bg: 'panel-hover' }} {...props}>
      <Link pos="relative" href={nftUrl}>
        <AspectRatio ratio={1}>
          <Media
            contentType={animationUrlContentType || contentType}
            mimetype={animationUrlMimeType}
            src={hostedAnimationUrl || animationUrl || hostedImageUrl || imageUrl}
            isLoading={!nft}
            w="full"
            h="full"
          />
        </AspectRatio>
        {priceSource === PriceSource.AuctionReserve && auction?.endTime && (
          <AuctionCountdown saleEndsAt={auction.endTime} flexShrink={0} pos="absolute" bottom={0} bg="panel" />
        )}
      </Link>
      <Stack spacing={4} flexGrow={1}>
        <Link href={nftUrl} color="note">
          <SkeletonText isLoaded={!!nft} noOfLines={2} isTruncated fontSize="sm" whiteSpace="pre-wrap">
            {name}
          </SkeletonText>
        </Link>

        <Stack spacing={0} flexGrow={1}>
          {priceSource && priceSource !== PriceSource.Offer ? (
            <Price
              label={priceSourceToLabel[priceSource || PriceSource.Listing]}
              price={price}
              priceInUsd={priceInUsd}
              unit={paymentToken && findToken(paymentToken, chainId)?.symbol}
              isLoading={!nft}
              sx={{ dd: { fontSize: 'xs', minH: '1rem' } }}
              fontSize="xs"
              lineHeight={1}
            />
          ) : (
            <Spacer />
          )}
          {lastSalePricePaymentToken && lastSalePrice ? (
            <Text fontSize="xs" lineHeight={1}>
              Last Sale: {lastSalePrice} {findToken(lastSalePricePaymentToken, chainId)?.symbol}
            </Text>
          ) : (
            <Text fontSize="xs" lineHeight={1}>
              Last Sale: 0
            </Text>
          )}
        </Stack>

        <Stack direction="row" align="center">
          <LikeButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            count={liked}
            defaultIsLiked={isLiked}
            isLoading={!tokenId}
          />
          <Spacer />
          {!!nft && (
            <Link href={nftUrl}>
              {isOwned ? 'View' : priceSource ? priceSourceToActionLabel[priceSource] : 'Offer'}
            </Link>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
