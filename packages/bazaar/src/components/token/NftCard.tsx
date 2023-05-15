import { DateTime } from 'luxon'
import { memo, useMemo } from 'react'
import Icon from '@chakra-ui/icon'
import { CheckIcon } from '@chakra-ui/icons'
import { AspectRatio, Box, Center, Stack, StackProps, Text } from '@chakra-ui/layout'
import { Skeleton, SkeletonText } from '@chakra-ui/skeleton'
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat'
import TokenIcon from 'components/token/TokenIcon'
import LikeButton from 'components/token/LikeButton'
import { useUsdPrice } from '@x/hooks'
import { useIpfsImage } from '@x/hooks'
import { Collection } from '@x/models'
import { NftItem } from '@x/models'
import { defaultNetwork, getChainName } from '@x/constants'
import ChainIcon from 'components/ChainIcon'
import { compareAddress } from '@x/utils'

export interface NftCardProps extends StackProps {
  token?: NftItem
  loading?: boolean
  collections?: Collection[]
}

function NftCard({ token, loading, collections = [], ...props }: NftCardProps) {
  const {
    name = '',
    imageUrl = '',
    price,
    priceInUsd,
    paymentToken,
    lastSalePrice,
    lastSalePriceInUSD,
    lastSalePricePaymentToken,
    saleEndsAt,
    liked,
    contractAddress,
    tokenId: tokenID,
    chainId = defaultNetwork,
    isLiked,
    hostedImageUrl,
  } = token || {}

  const collection = useMemo(
    () => collections.find(c => c.chainId === chainId && compareAddress(c.erc721Address, contractAddress)),
    [collections, chainId, contractAddress],
  )

  const [imageData] = useIpfsImage(
    (!hostedImageUrl || !imageUrl) && /^ipfs:\/\//.test(imageUrl) ? imageUrl.replace(/^ipfs:\/\//, '') : undefined,
  )

  const [usdPrice] = useUsdPrice(paymentToken)

  const auctionEndAt = useMemo(() => {
    if (!saleEndsAt) return
    const datetime = DateTime.fromISO(saleEndsAt)
    if (datetime.diffNow().valueOf() < 0) return
    return datetime
  }, [saleEndsAt])

  function renderPrice(label: string, price: number, paymentToken: string, inUSD?: number) {
    return (
      <Stat textAlign="right">
        <StatLabel fontSize="xs" color="inactive">
          {label}
        </StatLabel>
        <Stack as={StatNumber} direction="row" justifyContent="flex-end" alignItems="center">
          <TokenIcon chainId={chainId} tokenId={paymentToken} w={4} h={4} />
          <Text fontSize="sm" color="currentcolor">
            {price.toFixed(2)}
          </Text>
        </Stack>
      </Stat>
    )
  }

  function renderCollectionName() {
    if (!collection) return

    return (
      <Stack direction="row" alignItems="center">
        <Text fontSize="sm" isTruncated color="inactive">
          {collection.collectionName}
        </Text>
        {collection.isVerified && (
          <Center bg="green.400" w="16px" h="16px" borderRadius="16px">
            <Icon as={CheckIcon} color="white" w="10px" h="10px" />
          </Center>
        )}
      </Stack>
    )
  }

  function renderSaleEndAt(datetime: DateTime) {
    if (datetime.diffNow().valueOf() < 0) return

    return (
      <Stat>
        <StatLabel fontSize="sm">End in</StatLabel>
        <StatNumber fontSize="md">{datetime.toRelative({ unit: ['days', 'hours', 'minutes'] })}</StatNumber>
      </Stat>
    )
  }

  function renderChain() {
    return (
      <Stack
        direction="row"
        alignItems="center"
        p={2}
        position="absolute"
        top={0}
        left={0}
        borderBottomRightRadius="10px"
        background="rgba(0, 0, 0, 0.4)"
      >
        <ChainIcon chainId={chainId} h="18px" />
        <Text isTruncated>{getChainName(chainId)}</Text>
      </Stack>
    )
  }

  return (
    <Stack
      background="background"
      color="primary"
      spacing={0}
      borderRadius="10px"
      border="1px solid"
      borderColor="primary"
      overflow="hidden"
      {...props}
    >
      <Skeleton isLoaded={!loading}>
        <AspectRatio ratio={1} width="100%">
          <Box
            backgroundImage={`url(${imageData || hostedImageUrl || imageUrl})`}
            backgroundSize="contain"
            backgroundPosition="center center"
            bgRepeat="no-repeat"
            width="100%"
            height="100%"
            position="relative"
          >
            <LikeButton
              position="absolute"
              top={1}
              right={1}
              chainId={chainId}
              contractAddress={contractAddress}
              tokenID={tokenID}
              count={liked}
              isLoading={loading}
              defaultIsLiked={isLiked}
            />
          </Box>
        </AspectRatio>
      </Skeleton>
      <Stack padding={3} spacing={0}>
        {renderCollectionName()}
        <SkeletonText isLoaded={!loading}>
          <Text fontWeight="bold" color="primary" height="1.5em" isTruncated>
            {name}
          </Text>
        </SkeletonText>
        <Stack direction="row">
          {auctionEndAt && renderSaleEndAt(auctionEndAt)}
          {!!price &&
            !!paymentToken &&
            renderPrice(auctionEndAt ? 'Auction' : 'Price', price, paymentToken, priceInUsd || price * usdPrice)}
          {!!lastSalePrice &&
            !!lastSalePricePaymentToken &&
            renderPrice(
              'Last Price',
              lastSalePrice,
              lastSalePricePaymentToken,
              lastSalePriceInUSD || lastSalePrice * usdPrice,
            )}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default memo(NftCard)
