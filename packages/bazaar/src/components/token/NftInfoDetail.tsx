import { Avatar } from '@chakra-ui/avatar'
import { Flex, Grid, GridItem, Stack, StackProps, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import AuctionButton from 'components/auction/AuctionButton'
import CancelAuctionButton from 'components/auction/CancelAuctionButton'
import ConcludeAuctionButton from 'components/auction/ConcludeAuctionButton'
import Image from 'components/Image'
import HistoryList from 'components/info/HistoryList'
import ListingList from 'components/info/ListingList'
import OfferList from 'components/info/OfferList'
import UnlockableContent from 'components/info/UnlockableContent'
import CancelListingButton from 'components/marketplace/CancelListingButton'
import CancelOfferButton from 'components/marketplace/CancelOfferButton'
import SellButton from 'components/marketplace/SellButton'
import { useActiveWeb3React } from '@x/hooks'
import { useFetchTokens, FetchTokensProvider, useFetchTokensContext } from '@x/hooks'
import { compareAddress } from '@x/utils'
import NftCardList from './NftCardList'
import { useNftInfo } from './NftInfoProvider'
import TransferButton from './TransferButton'
import { defaultNetwork } from '@x/constants'

export default function NftInfoDetail(props: StackProps) {
  const { account } = useActiveWeb3React()

  const {
    chainId,
    contractAddress,
    tokenId,
    detail,
    isMine,
    metadata,
    collection,
    myOffer,
    myListing,
    histories,
    offers,
    listings,
    runningAuction: { auction, auctionHasEnded, refreshAuction },
    isLoadingDetial,
    isLoadingHistories,
    isLoadingOffers,
    isLoadingListings,
    isLoadingMetadata,
    isLoadingCollection,
    setOwner,
    setOffers,
    refresh,
  } = useNftInfo()

  const fetchTokensParams = useFetchTokens({
    defaultValue: { collections: [contractAddress], sortBy: 'viewed', chainId: defaultNetwork },
    id: 'nft-detail',
  })

  function renderDescription() {
    if (isLoadingMetadata) return <SkeletonText noOfLines={3} />

    if (!metadata?.description) return <Text>-</Text>

    // description of starshark is an object
    return (
      <Text>
        {typeof metadata?.description === 'string' ? metadata?.description : JSON.stringify(metadata?.description)}
      </Text>
    )
  }

  function renderCollectionTitle() {
    if (isLoadingCollection) return <SkeletonText noOfLines={3} />

    if (!collection) return

    return `About ${collection.collectionName}`
  }

  function renderCollectionDetail() {
    if (isLoadingCollection) return <SkeletonText noOfLines={3} />

    if (!collection) return

    return (
      <Grid templateColumns="auto 1fr" columnGap={5}>
        <GridItem>
          <Image as={Avatar} src={collection.logoImageUrl || collection.logoImageHash} width={12} height={12} />
        </GridItem>
        <GridItem>{collection.description}</GridItem>
      </Grid>
    )
  }

  return (
    <Stack spacing={12} {...props}>
      <Flex
        wrap="wrap"
        marginTop={8}
        justifyContent="center"
        sx={{ '& > *': { m: 2, w: { base: '100%', sm: 'initial' } } }}
      >
        {!!myOffer && (
          <CancelOfferButton
            variant="outline"
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            onOfferCanceled={() => setOffers(prev => prev.filter(offer => !compareAddress(offer.creator, account)))}
          />
        )}
        {isMine && (
          <>
            <TransferButton
              variant="outline"
              chainId={chainId}
              contractAddress={contractAddress}
              tokenId={tokenId}
              tokenSpec={721}
              onTransferred={address => {
                setOwner(address)
                refresh()
              }}
              disabled={!!myListing || !!auction}
            />
            <SellButton
              variant="outline"
              chainId={chainId}
              contractAddress={contractAddress}
              tokenID={tokenId}
              hasListed={!!myListing}
              defaultValues={{ paymentToken: myListing?.paymentToken, price: myListing?.price.toString() }}
              disabled={!!auction}
            />
            {!!myListing && (
              <CancelListingButton
                variant="outline"
                chainId={chainId}
                contractAddress={contractAddress}
                tokenID={tokenId}
              />
            )}
            <AuctionButton
              variant="outline"
              chainId={chainId}
              contractAddress={contractAddress}
              tokenID={tokenId}
              auction={auction}
              disabled={auctionHasEnded || !!myListing}
            />
            {!!auction && !auction.resulted && (
              <>
                <CancelAuctionButton
                  variant="outline"
                  chainId={chainId}
                  contractAddress={contractAddress}
                  tokenID={tokenId}
                />
                {auctionHasEnded && (
                  <ConcludeAuctionButton
                    variant="outline"
                    chainId={chainId}
                    contractAddress={contractAddress}
                    tokenID={tokenId}
                    onConcluded={refreshAuction}
                  />
                )}
              </>
            )}
          </>
        )}
      </Flex>
      {detail?.hasUnlockable && (
        <UnlockableContent chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} isOwner={isMine} />
      )}
      {/* <Grid templateColumns={{ md: '1fr 1fr' }} width="100%" rowGap={2} columnGap={8}>
        <GridItem as="h3" fontWeight="bold" fontSize="xl">
          Description
        </GridItem>
        <GridItem as="h3" fontWeight="bold" fontSize="xl">
          {renderCollectionTitle()}
        </GridItem>
        <GridItem>{renderDescription()}</GridItem>
        <GridItem>{renderCollectionDetail()}</GridItem>
      </Grid> */}
      <Stack>
        <Text as="h3" fontWeight="bold" fontSize="xl">
          Trade History
        </Text>
        <HistoryList histories={histories} isLoading={isLoadingHistories} />
      </Stack>
      <Stack>
        <Text as="h3" fontWeight="bold" fontSize="xl">
          Listings
        </Text>
        <ListingList listings={listings} isLoading={isLoadingListings} owner={isMine} />
      </Stack>
      <Stack>
        <Text as="h3" fontWeight="bold" fontSize="xl">
          Offers
        </Text>
        <OfferList
          offers={offers}
          isLoading={isLoadingOffers}
          onOfferTook={({ creator }) => setOffers(prev => prev.filter(offer => compareAddress(offer.creator, creator)))}
          owner={isMine}
        />
      </Stack>
      <Text as="h3" fontWeight="bold" fontSize="xl">
        More from this collection
      </Text>
      <FetchTokensProvider value={fetchTokensParams} id="nft-detail">
        <NftCardListWithContext />
      </FetchTokensProvider>
    </Stack>
  )
}

function NftCardListWithContext() {
  const { tokens, isLoading, hasMore, from, batchSize, setFrom } = useFetchTokensContext()

  return (
    <NftCardList
      items={tokens}
      isLoading={isLoading}
      hasMore={hasMore}
      // prevent fetch repeatly
      onMore={() => from + batchSize === tokens.length && setFrom(prev => prev + batchSize)}
      layout="large"
    />
  )
}
