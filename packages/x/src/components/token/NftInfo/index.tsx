import { fetchAccountV2 } from '@x/apis/dist/fn'
import { orderItemExpired } from '@x/models/dist'
import Image from 'next/image'
import { Box, Center, Grid, GridItem, Stack, StackProps, Text } from '@chakra-ui/layout'
import Media from 'components/Media'
import LikeButton from 'components/token/LikeButton'
import { SkeletonText } from '@chakra-ui/skeleton'
import Address from 'components/Address'
import { getChainName } from '@x/constants'
import { useNftInfo } from 'components/token/NftInfoProvider'
import PlaceOfferButton from 'components/marketplace/PlaceOfferButton'
import BuyButton from 'components/marketplace/BuyButton'
import CollectionLinks from 'components/token/CollectionLinks'
import { memo } from 'react'
import { useQuery } from 'react-query'
import CollectionName from './CollectionName'
import Properties from './Properties'
import Attributes from './Attributes'
import BestListing from './BestListing'
import { useIpfsImage, useViewCount } from '@x/hooks'
import RunningAuction from './RunningAuction'
import { useActiveWeb3React } from '@x/hooks'
import { adminWhitelist } from '@x/constants'
import BanNftItemButton from 'components/admin/BanNftItemButton'
import { isFeatureEnabled } from 'flags'

function NftInfo(props: StackProps) {
  const { account } = useActiveWeb3React()

  const isAdmin = account && adminWhitelist.includes(account)

  const { data } = useQuery(['account', account || ''], fetchAccountV2, { enabled: !!account })

  const isModerator = !!data?.isModerator

  const {
    chainId,
    contractAddress,
    tokenId,
    isLoadingCollection,
    collection,
    isLoadingMetadata,
    metadata,
    isLoadingDetail,
    detail,
    bestListing,
    isMine,
    myOffer,
    isLiked,
    owner,
    isLoadingOwner,
    runningAuction: { auction },
  } = useNftInfo()

  const [viewCount, isLoadingViewCount] = useViewCount(chainId, contractAddress, tokenId)

  const [imageData, isLoadingImageData] = useIpfsImage(
    !detail?.hostedImageUrl && detail?.imageUrl && /^ipfs:\/\//.test(detail.imageUrl)
      ? detail.imageUrl.replace(/^ipfs:\/\//, '')
      : undefined,
  )

  function renderViewCount() {
    if (isLoadingViewCount) return <SkeletonText width="24px" noOfLines={1} />

    return <Text fontSize="sm">{viewCount || 0}</Text>
  }

  function renderBestListing() {
    if (isLoadingDetail) return <SkeletonText />

    return (
      <Stack>
        {bestListing && <BestListing chainId={chainId} listing={bestListing} />}
        <Stack direction="row">
          {!isMine && !myOffer && !auction && (
            <PlaceOfferButton chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} />
          )}
          {!isMine && bestListing && (
            <BuyButton
              variant="outline"
              chainId={chainId}
              contractAddress={contractAddress}
              tokenID={tokenId}
              seller={bestListing.signer}
              price={bestListing.displayPrice}
              paymentToken={bestListing.currency}
              expired={orderItemExpired(bestListing)}
            >
              Buy Now
            </BuyButton>
          )}
        </Stack>
      </Stack>
    )
  }

  function renderMetadata() {
    if (!isFeatureEnabled('trait-rarity') || !detail?.attributes) {
      return (
        <>
          <Properties chainId={chainId} metadata={metadata} isLoading={isLoadingMetadata} />
          <Attributes chainId={chainId} metadata={metadata} isLoading={isLoadingMetadata} />
        </>
      )
    }

    return (
      <>
        <GridItem colSpan={2} h={6} />
        <GridItem colSpan={2} fontSize="md" fontWeight="bold">
          Properties
        </GridItem>
        {detail.attributes.map(({ trait_type, value }) => [
          <GridItem key={`attribute_${trait_type}_label`} textTransform="capitalize" whiteSpace="pre-wrap" isTruncated>
            {trait_type}
          </GridItem>,
          <GridItem key={`attribute_${trait_type}_value`} textTransform="capitalize">
            <Stack direction="row">
              <Text whiteSpace="pre-wrap" isTruncated>
                {value.replace(/"/g, '').replace(/-/g, ' ') || '-'}
              </Text>
              <Text>({renderTraitRarity(trait_type, value)})</Text>
            </Stack>
          </GridItem>,
        ])}
      </>
    )
  }

  function renderTraitRarity(traitType: string, traitValue: string) {
    const { attributes, supply = 0 } = collection || {}
    if (!attributes) return '-'
    const count = attributes[traitType]?.[traitValue] || 0
    const rarity = count / supply
    if (isNaN(rarity)) return '-'
    return `${(rarity * 100).toFixed(2)}%`
  }

  return (
    <Stack
      direction={{ base: 'column', sm: 'row' }}
      alignItems={{ base: 'center', sm: 'flex-start' }}
      spacing={12}
      {...props}
    >
      <Stack spacing={8}>
        <Center flexDirection="column" minH="400px">
          <Box borderRadius="10px" overflow="hidden">
            <Media
              contentType={detail?.animationUrlContentType || detail?.contentType}
              mimetype={detail?.animationUrlMimeType}
              src={
                detail?.hostedAnimationUrl ||
                detail?.animationUrl ||
                detail?.hostedImageUrl ||
                imageData ||
                detail?.imageUrl ||
                metadata?.image
              }
              isLoading={isLoadingDetail || isLoadingMetadata || isLoadingImageData}
              width={{ base: '300px', sm: '380px' }}
            />
          </Box>
        </Center>
        {(isAdmin || isModerator) && (
          <BanNftItemButton
            colorScheme="orange"
            mode="ban"
            chainId={chainId}
            contract={contractAddress}
            tokenId={tokenId.toString()}
          />
        )}
      </Stack>
      <Stack w="100%" h="fit-content" spacing={0}>
        <Stack>
          <CollectionName collection={collection} isLoading={isLoadingCollection} />
          <SkeletonText noOfLines={2} isLoaded={!isLoadingMetadata}>
            <Text as="h2" fontSize="4xl" fontWeight="bold">
              {metadata?.name || detail?.name || '-'}
            </Text>
          </SkeletonText>
          <Stack direction="row" width="100%">
            <Stack direction="row" alignItems="center">
              {renderViewCount()}
              <Box />
              <Image src="/assets/eye.svg" width="14px" height="14px" />
            </Stack>
            <LikeButton
              chainId={chainId}
              contractAddress={contractAddress}
              tokenID={tokenId}
              count={detail?.liked}
              isLoading={isLoadingDetail}
              defaultIsLiked={isLiked}
            />
          </Stack>
          <CollectionLinks collection={collection} isLoading={isLoadingCollection} />
          <Grid width="100%" templateColumns="auto 1fr" autoRows="min-content" columnGap={4} rowGap={1} fontSize="xs">
            <GridItem colSpan={2} fontSize="md" fontWeight="bold">
              Detail
            </GridItem>
            <GridItem>Owner</GridItem>
            <GridItem>
              <Stack justifyContent="center" height="100%">
                <SkeletonText isLoaded={!isLoadingOwner} noOfLines={1}>
                  {owner ? (
                    <Address type="account" chainId={chainId}>
                      {owner}
                    </Address>
                  ) : (
                    <Text>-</Text>
                  )}
                </SkeletonText>
              </Stack>
            </GridItem>
            <GridItem>Collection</GridItem>
            <GridItem>
              <Address type="address" chainId={chainId}>
                {contractAddress}
              </Address>
            </GridItem>
            <GridItem>Network</GridItem>
            <GridItem>{getChainName(chainId)}</GridItem>
            <GridItem>Chain ID</GridItem>
            <GridItem>{chainId}</GridItem>
            {renderMetadata()}
          </Grid>
        </Stack>
        <Stack px={{ base: 0, sm: 4 }} py={4} width={{ md: '50%' }} spacing={8}>
          <RunningAuction chainId={chainId} contractAddress={contractAddress} tokenId={tokenId} />
          {renderBestListing()}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default memo(NftInfo)
