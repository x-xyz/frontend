import RefreshIcon from 'components/icons/RefreshIcon'
import VerifiedIcon from 'components/icons/VerifiedIcon'
import Media from 'components/Media'
import { useNftInfo } from 'components/token/NftInfoProvider'
import useToast from 'hooks/useToast'
import { useRouter } from 'next/router'
import { memo } from 'react'
import { useMutation } from 'react-query'

import { Box, Flex, Stack, StackProps, Text } from '@chakra-ui/layout'
import { HStack, IconButton, Skeleton, useBreakpointValue } from '@chakra-ui/react'
import { refreshTokenMetadata } from '@x/apis/fn'
import { Erc1155Balance } from '@x/components'
import { getChainNameForUrl } from '@x/constants'
import { useActiveWeb3React, useAuthToken, useIpfsImage, useViewCount } from '@x/hooks'
import { TokenType } from '@x/models'

import AccountCard from '../../../AccountCard'
import ChainCleanIcon from '../../../ChainCleanIcon'
import Link from '../../../Link'
import WatchButton from '../WatchButton'
import WatchCount from '../WatchCount'
import AboutAccordion from './AboutAccordion'
import ActivityAccordion from './ActivityAccordion'
import ActivityList from './ActivityList'
import Auction from './Auction'
import DescriptionAccordion from './DescriptionAccordion'
import HyypeAccordion from './HyypeAccordion'
import Info from './Info'
import ListingAccordion from './ListingAccordion'
import OfferingAccordion from './OfferingAccordion'
import Options from './Options'
import PropertyAccordion from './PropertyAccordion'
import Sale from './Sale'

const breakpoint = 'lg'

function NftInfo(props: StackProps) {
  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const toast = useToast()

  const refreshMetadata = useMutation(refreshTokenMetadata)

  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const {
    chainId,
    contractAddress,
    tokenId,
    collection,
    isLoadingMetadata,
    metadata,
    isLoadingDetail,
    detail,
    isMine,
    isLiked,
    owner,
    listings,
    offers,
    isLoadingOffers,
    runningAuction: { auction },
    tokenSpec,
  } = useNftInfo()

  const showQuantity = tokenSpec === TokenType.Erc1155

  const hasMultipleOwner = tokenSpec === TokenType.Erc1155

  const [viewCount, isLoadingViewCount] = useViewCount(chainId, contractAddress, tokenId)

  const [imageData, isLoadingImageData] = useIpfsImage(
    !detail?.hostedImageUrl && detail?.imageUrl && /^ipfs:\/\//.test(detail.imageUrl)
      ? detail.imageUrl.replace(/^ipfs:\/\//, '')
      : undefined,
  )

  const collectionUrl =
    collection && `/collection/${getChainNameForUrl(collection.chainId)}/${collection.erc721Address}`

  function renderNftImage() {
    return (
      <Flex justifyContent="center">
        <Media
          contentType={detail?.contentType}
          src={detail?.hostedImageUrl || imageData || detail?.imageUrl || metadata?.image}
          isLoading={isLoadingDetail || isLoadingMetadata || isLoadingImageData}
          width="full"
        />
      </Flex>
    )
  }

  function renderHead() {
    return (
      <Box>
        <Flex justify="space-between">
          <Flex border="1px solid" borderColor="divider">
            <Box borderRight="1px solid" borderRightColor="divider" w={10} h={10} p={2}>
              <ChainCleanIcon chainId={chainId} />
            </Box>
            <WatchCount count={viewCount} borderRight="1px solid" borderRightColor="divider" />
            <WatchButton
              chainId={chainId}
              contractAddress={contractAddress}
              tokenID={tokenId}
              count={detail?.liked}
              isLoading={isLoadingDetail}
              defaultIsWatched={isLiked}
            />
          </Flex>
          <HStack space={5}>
            <IconButton
              variant="icon"
              w={10}
              h={10}
              p={0}
              border="1px solid"
              borderColor="divider"
              borderRadius="20px"
              overflow="hidden"
              icon={<RefreshIcon w="full" h="full" color="primary" />}
              aria-label="Refresh Icon"
              isLoading={refreshMetadata.isLoading}
              disabled={refreshMetadata.isLoading}
              onClick={() =>
                refreshMetadata
                  .mutateAsync({ queryKey: [authToken, chainId, contractAddress, `${tokenId}`], meta: {} })
                  .then(() =>
                    toast({
                      status: 'success',
                      title: 'Refresh Metadata',
                      description: "We've queued this item for an update! Check back in a few minutes...",
                    }),
                  )
              }
            />
            <Options collection={collection} />
          </HStack>
        </Flex>
        <Box mt={12}>
          <HStack>
            <Link href={collectionUrl}>
              <Skeleton fontWeight="bold" minW="40%" h="1rem" isLoaded={!!collection}>
                {collection?.collectionName}
              </Skeleton>
            </Link>
            {collection?.isVerified && <VerifiedIcon w={4} h={4} />}
          </HStack>
          <Text fontSize="4xl" fontWeight="bold">
            {metadata?.name || detail?.name || '-'}
          </Text>
        </Box>

        {hasMultipleOwner ? (
          <Flex mt={10} wrap="wrap" sx={{ '&>*': { mr: 10, mb: 2 } }} fontSize="sm" fontWeight="bold">
            <Stack spacing={0}>
              <Text color="note">You Own:</Text>
              <Erc1155Balance chainId={chainId} contract={contractAddress} tokenId={`${tokenId}`} owner={account} />
            </Stack>
            <Stack spacing={0}>
              <Text color="note">Owners:</Text>
              <Text>{detail?.numOwners?.toLocaleString(locale) || '0'}</Text>
            </Stack>
            <Stack spacing={0}>
              <Text color="note">Total Editions</Text>
              <Text>{detail?.supply.toLocaleString(locale) || '0'}</Text>
            </Stack>
          </Flex>
        ) : (
          <AccountCard account={owner || ''} chainId={chainId} title="Owner" mt={10} />
        )}
      </Box>
    )
  }

  if (useDesktopView) {
    return (
      <Stack direction="row" spacing={0} {...props} mx={-6}>
        <Flex w="58.3333%" flexDir="column" px={6}>
          {renderHead()}
          <Stack mt={10} spacing={5}>
            {!auction ? <Sale /> : <Auction />}
            <PropertyAccordion collection={collection} detail={detail} />
            <OfferingAccordion
              chainId={chainId}
              collection={collection}
              offers={offers}
              isLoading={isLoadingOffers}
              contractAddress={contractAddress}
              tokenId={tokenId}
              isOwner={isMine}
              showQuantity={showQuantity}
            />
            <ListingAccordion
              chainId={chainId}
              contract={contractAddress}
              tokenId={`${tokenId}`}
              listings={listings}
              showQuantity={showQuantity}
            />
            <ActivityAccordion>
              <ActivityList
                chainId={chainId}
                contract={contractAddress}
                tokenId={tokenId.toString()}
                showQuantity={showQuantity}
              />
            </ActivityAccordion>
            {/*<SaleHistoryAccordion />*/}
          </Stack>
        </Flex>
        <Flex w="41.6667%" flexDir="column" px={6}>
          <Stack spacing={5}>
            {renderNftImage()}
            <Info
              collection={collection}
              chainId={chainId}
              tokenId={tokenId}
              contractAddress={contractAddress}
              tokenType={detail?.tokenType}
            />
            <DescriptionAccordion metadata={metadata} />
            <AboutAccordion collection={collection} />
            <HyypeAccordion chainId={chainId} contractAddress={contractAddress} tokenId={tokenId} />
          </Stack>
        </Flex>
      </Stack>
    )
  } else {
    return (
      <Stack {...props}>
        <Stack spacing={6}>
          {renderNftImage()}
          {renderHead()}
        </Stack>
        <Stack mt={10} spacing={5}>
          {!auction ? <Sale /> : <Auction />}
          <Info
            collection={collection}
            chainId={chainId}
            tokenId={tokenId}
            contractAddress={contractAddress}
            tokenType={detail?.tokenType}
          />
          <PropertyAccordion collection={collection} detail={detail} />
          <OfferingAccordion
            chainId={chainId}
            collection={collection}
            offers={offers}
            isLoading={isLoadingOffers}
            contractAddress={contractAddress}
            tokenId={tokenId}
            isOwner={isMine}
            showQuantity={showQuantity}
            isErc1155={tokenSpec === TokenType.Erc1155}
          />
          <ListingAccordion
            chainId={chainId}
            contract={contractAddress}
            tokenId={`${tokenId}`}
            listings={listings}
            showQuantity={showQuantity}
          />
          <ActivityAccordion>
            <ActivityList
              chainId={chainId}
              contract={contractAddress}
              tokenId={tokenId.toString()}
              showQuantity={showQuantity}
            />
          </ActivityAccordion>
          {/*<SaleHistoryAccordion />*/}
          <DescriptionAccordion metadata={metadata} />
          <AboutAccordion collection={collection} />
          <HyypeAccordion chainId={chainId} contractAddress={contractAddress} tokenId={tokenId} />
        </Stack>
      </Stack>
    )
  }
}

export default memo(NftInfo)
