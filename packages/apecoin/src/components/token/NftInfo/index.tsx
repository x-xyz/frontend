import RefreshIcon from 'components/icons/RefreshIcon'
import Media from 'components/Media'
import { builtInCollections } from 'configs'
import useAuthToken from 'hooks/useAuthToken'
import useToast from 'hooks/useToast'
import { useRouter } from 'next/router'
import { memo } from 'react'
import { useMutation, useQuery } from 'react-query'

import { Box, Flex, Stack, StackProps, Text } from '@chakra-ui/layout'
import {
  Divider,
  HStack,
  IconButton,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useBreakpointValue,
} from '@chakra-ui/react'
import { fetchTokenV2, refreshTokenMetadata } from '@x/apis/fn'
import { Erc1155Balance } from '@x/components'
import { useActiveWeb3React } from '@x/hooks'
import { Collection, NftItem, TokenType } from '@x/models'
import { compareAddress } from '@x/utils'

import Link from '../../Link'
import ActivityList from './ActivityList'
import Info from './Info'
import Listings from './Listings'
import Offerings from './Offerings'
import ShareButton from './ShareButton'
import Properties from './Properties'
import Sale from './Sale'
import ClickToEnlarge from 'components/ClickToEnlarge'
import Address from '../../Address'
import ListingsCards from './ListingsCards'
import OfferingsCards from './OfferingsCards'
import ActivityCards from './ActivityCards'
import WatchButton from '../WatchButton'

const breakpoint = 'lg'

export interface NftInfoProps extends StackProps {
  collection: Collection
  nftItem: NftItem
}

function NftInfo({ collection, nftItem: initialData, ...props }: NftInfoProps) {
  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const toast = useToast()

  const refreshMetadata = useMutation(refreshTokenMetadata, {
    onSuccess: () => {
      toast({
        status: 'success',
        title: 'Refresh Metadata',
        description: "We've queued this item for an update! Check back in a few minutes...",
      })
    },
  })

  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const { chainId, contractAddress, tokenId } = initialData

  const {
    data = initialData,
    isRefetching,
    isLoading,
  } = useQuery(['token', chainId, contractAddress, tokenId, { authToken }], fetchTokenV2, { initialData })

  const isUpdating = isRefetching || isLoading

  const {
    tokenType,
    imageUrl,
    contentType,
    animationUrlContentType,
    animationUrlMimeType,
    animationUrl = imageUrl,
    hostedAnimationUrl = animationUrl,
    hostedImageUrl = imageUrl,
    numOwners = 0,
    owner,
    liked,
    supply,
    auction,
    offers = [],
    listings = [],
    name,
    isLiked,
  } = data

  const showQuantity = true

  const hasMultipleOwner = tokenType === TokenType.Erc1155

  const collectionUrl = `/collection/${builtInCollections.find(c => compareAddress(c.address, contractAddress))?.alias}`

  function renderNftImage() {
    return (
      <Flex justifyContent="center">
        <ClickToEnlarge>
          <Media
            contentType={animationUrlContentType || contentType}
            src={hostedAnimationUrl || hostedImageUrl}
            mimetype={animationUrlMimeType}
            width={{ base: '343px', [breakpoint]: 'full' }}
            height="full"
          />
        </ClickToEnlarge>
      </Flex>
    )
  }

  function renderOwnedBy() {
    return hasMultipleOwner ? (
      <>
        <Stack>
          <Text>You Own:</Text>
          <Erc1155Balance chainId={chainId} contract={contractAddress} tokenId={`${tokenId}`} owner={account} />
        </Stack>
        <Stack>
          <Text>Owners:</Text>
          <Text>{numOwners.toLocaleString(locale)}</Text>
        </Stack>
      </>
    ) : (
      <HStack>
        <Text variant="body2">Owned by:</Text>
        <Address variant="body2" type="account" color="primary">
          {owner}
        </Address>
      </HStack>
    )
  }

  function renderFavorite() {
    return (
      <WatchButton
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenId}
        count={liked}
        isLoading={isLoading}
        defaultIsWatched={isLiked}
      />
    )
  }

  function renderActions() {
    return (
      <HStack spacing={10} alignItems="flex-start">
        <IconButton
          variant="icon"
          w={10}
          h={10}
          p={0}
          border="1px solid"
          borderColor="divider"
          borderRadius="20px"
          overflow="hidden"
          icon={<RefreshIcon w={6} h={6} color="white" />}
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
        <ShareButton collection={collection} />
      </HStack>
    )
  }

  function renderHead() {
    return useDesktopView ? (
      <HStack justifyContent="space-between">
        <Stack justify="space-between" spacing={4}>
          <Link href={collectionUrl}>
            <Skeleton fontWeight="bold" minW="40%" isLoaded={!!collection} fontSize="xl">
              <Text variant="headline6">{collection.collectionName}</Text>
            </Skeleton>
          </Link>
          <Text variant="headline3">{name || '-'}</Text>
          {renderOwnedBy()}
        </Stack>
        <Stack justifyContent="space-between" alignItems="flex-end" h="full">
          {renderActions()}
          {renderFavorite()}
        </Stack>
      </HStack>
    ) : (
      <Stack>
        <Link href={collectionUrl}>
          <Skeleton fontWeight="bold" minW="40%" isLoaded={!!collection} fontSize="xl">
            <Text variant="subtitle1">{collection.collectionName}</Text>
          </Skeleton>
        </Link>
        <HStack justify="space-between" spacing={4}>
          <Text variant="headline3">{name || '-'}</Text>
          {renderActions()}
        </HStack>
        <HStack justifyContent="space-between">
          {renderOwnedBy()}
          {renderFavorite()}
        </HStack>
      </Stack>
    )
  }

  function renderInfo() {
    return (
      <Info
        collection={collection}
        chainId={chainId}
        tokenId={tokenId}
        contractAddress={contractAddress}
        tokenType={tokenType}
      />
    )
  }

  function renderTabs() {
    return (
      <Tabs size={useDesktopView ? 'lg' : 'base'}>
        <TabList>
          {!useDesktopView && <Tab>Info</Tab>}
          <Tab>Bids</Tab>
          <Tab>Listings</Tab>
          <Tab>Activity</Tab>
        </TabList>
        <TabPanels>
          {!useDesktopView && <TabPanel>{renderInfo()}</TabPanel>}
          <TabPanel>
            {useDesktopView ? (
              <Offerings
                nftItem={data}
                collection={collection}
                offers={offers}
                isLoading={isUpdating}
                showQuantity={showQuantity}
                isOwner={compareAddress(owner, account)}
              />
            ) : (
              <OfferingsCards
                nftItem={data}
                collection={collection}
                offers={offers}
                isLoading={isUpdating}
                showQuantity={showQuantity}
                isOwner={compareAddress(owner, account)}
              />
            )}
          </TabPanel>
          <TabPanel>
            {useDesktopView ? (
              <Listings
                contract={contractAddress}
                tokenId={tokenId.toString()}
                listings={listings}
                showQuantity={showQuantity}
              />
            ) : (
              <ListingsCards
                contract={contractAddress}
                tokenId={tokenId.toString()}
                listings={listings}
                showQuantity={showQuantity}
              />
            )}
          </TabPanel>
          <TabPanel>
            {useDesktopView ? (
              <ActivityList
                chainId={chainId}
                contract={contractAddress}
                tokenId={tokenId.toString()}
                showQuantity={showQuantity}
              />
            ) : (
              <ActivityCards
                chainId={chainId}
                contract={contractAddress}
                tokenId={tokenId.toString()}
                showQuantity={showQuantity}
              />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  }

  if (useDesktopView) {
    return (
      <Stack spacing={20}>
        <HStack spacing={10} alignItems="stretch">
          <Stack w="24rem" spacing={10}>
            {renderNftImage()}
            <Stack spacing={4}>
              <Text variant="headline6">Properties</Text>
              <Properties collection={collection} detail={data} />
            </Stack>
          </Stack>
          <Stack spacing={10} flexGrow={1}>
            {renderHead()}
            <Sale nftItem={data} collection={collection} />
            <Stack spacing={4}>
              <Text variant="headline6">Info</Text>
              {renderInfo()}
            </Stack>
          </Stack>
        </HStack>
        <Stack spacing={5}>{renderTabs()}</Stack>
      </Stack>
    )
  } else {
    return (
      <Stack spacing={5} {...props}>
        {renderHead()}
        {renderNftImage()}
        <Sale nftItem={data} collection={collection} />
        <Stack mt={10} spacing={5}>
          <Properties collection={collection} detail={data} />
        </Stack>
        <Stack pt={4}>{renderTabs()}</Stack>
      </Stack>
    )
  }
}

export default memo(NftInfo)
