import { memo, useMemo } from 'react'
import { AspectRatio, Box, Grid, GridItem, Stack, StackProps, Text } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import TokenIcon from 'components/token/TokenIcon'
import LikeButton from 'components/token/LikeButton'
import { useIpfsImage } from '@x/hooks'
import { Collection } from '@x/models'
import { NftItem } from '@x/models'
import { ChainId, getChainName } from '@x/constants'
import ChainIcon from 'components/ChainIcon'
import { compareAddress } from '@x/utils'
import NftOwner from './NftOwner'
import UsdPrice from 'components/UsdPrice'
import { findToken } from '@x/constants'
import Card from 'components/Card'
import Media from 'components/Media'

export interface NftCardProps extends StackProps {
  token?: NftItem
  loading?: boolean
  collections?: Collection[]
  dark?: boolean
}

function NftCard({ token, loading, collections = [], dark, ...props }: NftCardProps) {
  const {
    // name = '',
    imageUrl = '',
    contentType,
    price,
    priceInUsd,
    paymentToken,
    liked,
    contractAddress,
    tokenId: tokenID,
    chainId = ChainId.Fantom,
    isLiked,
    hostedImageUrl,
    owner,
    animationUrlContentType,
    animationUrlMimeType,
    animationUrl,
    hostedAnimationUrl,
  } = token || {}

  const collection = useMemo(
    () => collections.find(c => c.chainId === chainId && compareAddress(c.erc721Address, contractAddress)),
    [collections, chainId, contractAddress],
  )

  const [imageData, isLoadingImageData] = useIpfsImage(
    !hostedImageUrl && imageUrl && /^ipfs:\/\//.test(imageUrl) ? imageUrl.replace(/^ipfs:\/\//, '') : undefined,
  )

  function renderCollectionName() {
    if (!collection) return

    return (
      <Stack direction="row" alignItems="center">
        <Text fontSize="xs" fontWeight="bold" color="currentcolor" isTruncated>
          {collection.collectionName}
        </Text>
      </Stack>
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

  function renderAsset() {
    return (
      <Skeleton isLoaded={!loading} borderRadius="20px" overflow="hidden">
        <AspectRatio ratio={1} width="100%">
          <Box
            // backgroundImage={`url(${imageData || hostedImageUrl || imageUrl})`}
            // backgroundSize="cover"
            // backgroundPosition="center center"
            width="100%"
            height="100%"
            position="relative"
          >
            <Media
              contentType={animationUrlContentType || contentType}
              mimetype={animationUrlMimeType}
              src={hostedAnimationUrl || animationUrl || imageData || hostedImageUrl || imageUrl}
              isLoading={isLoadingImageData}
            />
            {renderChain()}
            <LikeButton
              position="absolute"
              top={2}
              right={2}
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
    )
  }

  function renderContent() {
    return (
      <>
        {renderAsset()}
        <Grid pt={5} templateColumns="45% 55%" columnGap={1}>
          <GridItem>{renderCollectionName()}</GridItem>
          <GridItem textAlign="right" display="flex" alignItems="center" justifyContent="flex-end" whiteSpace="nowrap">
            {priceInUsd
              ? priceInUsd.toLocaleString()
              : !!price && (
                  <UsdPrice chainId={chainId} tokenId={paymentToken} fontSize="xs" suffix="USD">
                    {price}
                  </UsdPrice>
                )}
          </GridItem>
          <GridItem>{owner && <NftOwner owner={owner} />}</GridItem>
          <GridItem textAlign="right" display="flex" alignItems="center" justifyContent="flex-end" whiteSpace="nowrap">
            {!!price && (
              <>
                {paymentToken && <TokenIcon chainId={chainId} tokenId={paymentToken} w="1.2rem" h="1.2rem" mr={1} />}
                {price}
                <Text color="currentcolor" fontSize="xs">
                  {paymentToken && findToken(paymentToken, chainId)?.symbol}
                </Text>
              </>
            )}
          </GridItem>
        </Grid>
      </>
    )
  }

  return (
    <Card dark={dark} {...props}>
      <Stack w="100%" h="100%">
        {renderContent()}
      </Stack>
    </Card>
  )
}

export default memo(NftCard)
