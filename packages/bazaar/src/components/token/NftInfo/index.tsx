import AccountNameWithAvatar from 'components/account/AccountNameWithAvatar'
import Address from 'components/Address'
import BanNftItemButton from 'components/admin/BanNftItemButton'
import CancelAuctionButton from 'components/auction/CancelAuctionButton'
import PlaceBidButton from 'components/auction/PlaceBidButton'
import WithdrawBidButton from 'components/auction/WithdrawBidButton'
import CollectionNameWithAvatar from 'components/collection/CollectionNameWithAvatar'
import { ListingsIcon, OffersIcon } from 'components/icons'
import ListingList from 'components/info/ListingList'
import OfferList from 'components/info/OfferList'
import TokenActivityList from 'components/info/TokenActivityList'
import Link from 'components/Link'
import BuyButton from 'components/marketplace/BuyButton'
import CancelListingButton from 'components/marketplace/CancelListingButton'
import CancelOfferButton from 'components/marketplace/CancelOfferButton'
import PlaceOfferButton from 'components/marketplace/PlaceOfferButton'
import Media from 'components/Media'
import Price from 'components/Price'
import CollectionLinks from 'components/token/CollectionLinks'
import LikeButton from 'components/token/LikeButton'
import { useNftInfo } from 'components/token/NftInfoProvider'
import { DateTime } from 'luxon'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { cloneElement, memo } from 'react'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Badge,
  Box,
  ButtonProps,
  Divider,
  Flex,
  Grid,
  GridItem,
  SkeletonText,
  Spacer,
  Stack,
  StackProps,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useAccountQuery } from '@x/apis'
import { adminWhitelist, findToken, getChainName } from '@x/constants'
import { FetchTokensProvider, useActiveWeb3React, useFetchTokens, useFetchTokensContext, useViewCount } from '@x/hooks'
import { getDaysBetweenDates, getTimePeriodFromDays, TimePeriod } from '@x/models'
import { compareAddress } from '@x/utils'

import ListForSaleButton from '../ListForSaleButton'
import NftCard from '../NftCard'
import TransferButton from '../TransferButton'
import Countdown from 'components/auction/Countdown'

function NftInfo(props: StackProps) {
  const { locale } = useRouter()

  const verticalLayout = useBreakpointValue({ base: true, md: false })

  const { account } = useActiveWeb3React()

  const isAdmin = account && adminWhitelist.includes(account)

  const { data } = useAccountQuery({ address: `${account}` }, { skip: !account })

  const isModerator = !!data?.data?.isModerator

  const {
    chainId,
    contractAddress,
    tokenId,
    isLoadingCollection,
    collection,
    isLoadingMetadata,
    metadata,
    isLoadingDetial,
    detail,
    bestListing,
    isMine,
    myOffer,
    isLiked,
    owner,
    isLoadingOwner,
    myListing,
    setOwner,
    refresh,
    listings,
    isLoadingListings,
    offers,
    isLoadingOffers,
    setOffers,
    runningAuction: { auction, auctionHighestBidder, auctionHasEnded },
  } = useNftInfo()

  const [viewCount, isLoadingViewCount] = useViewCount(chainId, contractAddress, tokenId)

  const fetchTokensParams = useFetchTokens({
    defaultValue: { chainId, collections: [contractAddress], sortBy: 'soldAt' },
    id: 'more-nft',
  })

  function renderMedia() {
    return (
      <AspectRatio ratio={1} w="full" maxW="600px">
        <Media
          borderRadius="10px"
          overflow="hidden"
          contentType={detail?.contentType}
          src={detail?.hostedImageUrl || detail?.imageUrl || metadata?.image}
          isLoading={isLoadingDetial || isLoadingMetadata}
          w="full"
          h="full"
        />
      </AspectRatio>
    )
  }

  function renderFunctionBar() {
    return (
      <Stack direction="row">
        <LikeButton
          chainId={chainId}
          contractAddress={contractAddress}
          tokenID={tokenId}
          count={detail?.liked}
          isLoading={isLoadingDetial}
          defaultIsLiked={isLiked}
        />
        {renderViewCount()}
      </Stack>
    )
  }

  function renderStaticInfo() {
    return (
      <Accordion allowToggle allowMultiple defaultIndex={0}>
        <AccordionItem>
          <AccordionButton>
            <Image src="/assets/icons/details.png" width="14px" height="18px" />
            <Box w={2} />
            Details
            <Spacer />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Grid templateColumns="auto 1fr" columnGap={3} rowGap={5} fontSize="sm">
              <GridItem color="inactive">Contract</GridItem>
              <GridItem>
                <Address chainId={chainId} type="address">
                  {contractAddress}
                </Address>
              </GridItem>
              <GridItem color="inactive">Token ID</GridItem>
              <GridItem>{tokenId}</GridItem>
              {/* <GridItem color="inactive">Edition</GridItem>
                  <GridItem>1/1</GridItem> */}
              <GridItem color="inactive">Blockchain</GridItem>
              <GridItem>{getChainName(chainId)}</GridItem>
              <GridItem color="inactive">Token Standard</GridItem>
              <GridItem>BEP-721</GridItem>
              <GridItem color="inactive">Royalty(%)</GridItem>
              <GridItem>{collection?.royalty || '--'}%</GridItem>
            </Grid>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Image src="/assets/icons/about.png" width="18px" height="18px" />
            <Box w={2} />
            About
            <SkeletonText ml={2} isLoaded={!isLoadingCollection} noOfLines={1}>
              {collection?.collectionName}
            </SkeletonText>
            <Spacer />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SkeletonText fontSize="sm" isLoaded={!isLoadingCollection}>
              {collection?.description}
            </SkeletonText>
            <CollectionLinks mt={6} collection={collection} isLoading={isLoadingCollection} />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  function renderName() {
    return (
      <SkeletonText fontSize="4xl" fontWeight="bold" color="primary" isLoaded={!isLoadingDetial} noOfLines={1}>
        {detail?.name}
      </SkeletonText>
    )
  }

  function renderOwnerAndCollection() {
    return (
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 2, md: 12 }}>
        <Link href={`/account/${owner}`}>
          <AccountNameWithAvatar account={owner} isLoading={isLoadingOwner} label="Owned by" />
        </Link>
        <Link href={`/collection/${contractAddress}`}>
          <CollectionNameWithAvatar chainId={chainId} contract={contractAddress} label="Collection" />
        </Link>
      </Stack>
    )
  }

  function renderSaleStatus() {
    const topOffer = offers.sort((a, b) => b.priceInUsd - a.priceInUsd)[0]
    const {
      price,
      priceSource,
      paymentToken,
      priceInUsd,
      lastSalePrice,
      lastSalePriceInUSD,
      lastSalePricePaymentToken,
    } = detail || {}

    if (!price || !priceSource) return null

    return (
      <Stack borderRadius="10px" borderWidth="1px" borderColor="divider" bg="panel" p={6} divider={<Divider />}>
        <Stack>
          <Stack direction="row">
            <Text color="primary" fontWeight="bold" textTransform="capitalize">
              {priceSource}
            </Text>
            <Spacer />
            {auction && !auctionHasEnded && !auctionHighestBidder && <Text>No bid yet</Text>}
            {auction &&
              !auctionHasEnded &&
              auctionHighestBidder &&
              auction.reservePrice.gte(auctionHighestBidder.bid) && <Text>Reserved price not meet</Text>}
            {auction && !auctionHasEnded && auctionHighestBidder && auction.reservePrice.lt(auctionHighestBidder.bid) && (
              <Text>
                Min Bid{' '}
                <Price>
                  {
                    /**
                     * @todo ask min bid step from contract
                     */
                    formatUnits(auctionHighestBidder.bid.add(parseUnits('0.05', auction.payToken)), auction.payToken)
                  }
                </Price>
              </Text>
            )}
          </Stack>
          <Price chainId={chainId} tokenId={paymentToken} usdPrice={priceInUsd} priceProps={{ fontSize: '4xl' }}>
            {price}
          </Price>
          <Stack direction="row">
            {topOffer && (
              <Text>
                Top Offer{' '}
                <Price chainId={chainId} tokenId={topOffer.paymentToken} usdPrice={topOffer.priceInUsd}>
                  {topOffer.pricePerItem}
                </Price>
              </Text>
            )}
            <Spacer />
            {lastSalePrice && (
              <Stack direction="row" align="center">
                <Text color="inactive">Last</Text>
                <Price chainId={chainId} tokenId={lastSalePricePaymentToken} usdPrice={lastSalePriceInUSD}>
                  {lastSalePrice}
                </Price>
              </Stack>
            )}
          </Stack>
        </Stack>
        {auction && (
          <Stack>
            <Text color="primary" fontWeight="bold">
              Sale ends at{' '}
              {DateTime.fromSeconds(auction.endTime.toNumber()).toLocaleString(
                { dateStyle: 'long', timeStyle: 'long' },
                { locale },
              )}
            </Text>
            <Countdown
              startTime={DateTime.fromSeconds(auction.startTime.toNumber())}
              endTime={DateTime.fromSeconds(auction.endTime.toNumber())}
              units={['days', 'hours', 'minutes', 'seconds']}
              concluded={auction.resulted}
            />
          </Stack>
        )}
      </Stack>
    )
  }

  function renderActionButtons() {
    const buttons: React.ReactElement<ButtonProps>[] = []

    if (isMine) {
      if (!auction && !myListing) {
        buttons.push(
          <ListForSaleButton mode="create" chainId={chainId} contract={contractAddress} tokenId={tokenId.toString()} />,
        )
      }

      if (myListing) {
        buttons.push(
          <ListForSaleButton
            mode="update"
            chainId={chainId}
            contract={contractAddress}
            tokenId={tokenId.toString()}
            defaultValues={{
              type: 'list',
              paymentToken: myListing.paymentToken,
              price: myListing.price.toString(),
              startTime: DateTime.fromISO(myListing.startTime).toJSDate(),
              duration: getTimePeriodFromDays(
                getDaysBetweenDates(
                  DateTime.fromISO(myListing.startTime).toJSDate(),
                  DateTime.fromISO(myListing.deadline).toJSDate(),
                ),
              ),
            }}
          >
            Update Listing
          </ListForSaleButton>,
          <CancelListingButton
            key="cancel-listing"
            variant="outline"
            contractAddress={contractAddress}
            tokenID={tokenId}
          />,
        )
      }

      if (auction) {
        const token = findToken(auction.payToken, chainId)
        buttons.push(
          <ListForSaleButton
            mode="update"
            chainId={chainId}
            contract={contractAddress}
            tokenId={tokenId.toString()}
            defaultValues={{
              type: 'auction',
              paymentToken: auction.payToken,
              price: formatUnits(auction.reservePrice, token?.decimals),
              startTime: DateTime.fromSeconds(auction.startTime.toNumber()).toJSDate(),
              duration:
                getTimePeriodFromDays(
                  getDaysBetweenDates(
                    DateTime.fromSeconds(auction.startTime.toNumber()).toJSDate(),
                    DateTime.fromSeconds(auction.endTime.toNumber()).toJSDate(),
                  ),
                ) || TimePeriod.Week,
            }}
          >
            Update Auction
          </ListForSaleButton>,
          <CancelAuctionButton
            key="cancel"
            variant="ghost"
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
          />,
        )
      }

      buttons.push(
        <TransferButton
          key="transfer"
          chainId={chainId}
          contractAddress={contractAddress}
          tokenId={tokenId}
          tokenSpec={721}
          onTransferred={address => {
            setOwner(address)
            refresh()
          }}
        />,
      )
    } else {
      if (auction && !auctionHasEnded) {
        buttons.push(
          <PlaceBidButton
            key="place-bid"
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            auction={auction}
            highestBidder={auctionHighestBidder}
          />,
        )
      }

      if (auction && auctionHasEnded && compareAddress(auctionHighestBidder?.bidder, account)) {
        buttons.push(
          <WithdrawBidButton
            key="withdraw-bid"
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            auction={auction}
          />,
        )
      }

      if (!auction && bestListing) {
        buttons.push(
          <BuyButton
            key="buy"
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            seller={bestListing.owner}
            price={bestListing.price}
            paymentToken={bestListing.paymentToken}
          />,
        )
      }

      if (!auction && !myOffer) {
        buttons.push(
          <PlaceOfferButton key="place-offer" chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} />,
        )
      }

      if (myOffer) {
        buttons.push(
          <CancelOfferButton
            key="cancel-offer"
            variant="outline"
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            onOfferCanceled={() => setOffers(prev => prev.filter(offer => !compareAddress(offer.creator, account)))}
          />,
        )
      }
    }

    for (let i = 0; i < buttons.length; i++) {
      if (!buttons[i].props.variant) {
        buttons[i] = cloneElement(buttons[i], { variant: i === 0 ? 'solid' : 'ghost' })
      }
    }

    return (
      <Flex
        direction="row"
        w="full"
        wrap={{ base: 'wrap', md: 'nowrap' }}
        sx={{
          '& > *': {
            flexGrow: 1,
            ':not(:last-child)': {
              mr: { base: 2, md: 6 },
              mb: { base: 2, md: 0 },
            },
          },
        }}
      >
        {buttons}
      </Flex>
    )
  }

  function renderAttributes() {
    return (
      <Accordion allowMultiple allowToggle defaultIndex={0}>
        <AccordionItem>
          <AccordionButton>
            <Image src="/assets/icons/attribute.png" width="18px" height="12px" />
            <Box w={2} />
            Attribute
            <Spacer />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Flex wrap="wrap">
              {detail?.attributes?.map(attr => {
                const count = collection?.attributes?.[attr.trait_type][attr.value]
                const supply = collection?.supply
                return (
                  <Stack
                    key={attr.trait_type}
                    w="120px"
                    m={1}
                    p={3}
                    overflow="hidden"
                    spacing={0}
                    borderWidth="1px"
                    borderColor="divider"
                    borderRadius="10px"
                  >
                    <Text fontWeight="bold">{attr.trait_type}</Text>
                    <Text color="primary" fontSize="sm" fontWeight="medium" isTruncated noOfLines={1}>
                      {attr.value.replace(/"/g, '')}
                    </Text>
                    <Text color="primary" fontSize="sm" fontWeight="medium">
                      {count && supply ? `${((count / supply) * 100).toFixed(1)}%` : '-'}
                    </Text>
                  </Stack>
                )
              })}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  function renderTradeInfo() {
    return (
      <Tabs variant="accordion" isLazy>
        <TabList>
          <Tab>
            <ListingsIcon w="18px" h="18px" mr={2} />
            Listings
          </Tab>
          <Tab>
            <OffersIcon w="15px" h="18px" mr={2} />
            Offers
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ListingList listings={listings} isLoading={isLoadingListings} owner={isMine} />
          </TabPanel>
          <TabPanel>
            <OfferList
              offers={offers}
              isLoading={isLoadingOffers}
              onOfferTook={({ creator }) => setOffers(prev => prev.filter(o => !compareAddress(o.creator, creator)))}
              onOfferCanceled={({ creator }) =>
                setOffers(prev => prev.filter(o => !compareAddress(o.creator, creator)))
              }
              owner={isMine}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  }

  function renderActivityAndMoreNfts() {
    return (
      <Accordion allowMultiple allowToggle defaultIndex={1}>
        <AccordionItem>
          <AccordionButton>
            <Image src="/assets/icons/activity.png" width="18px" height="17px" />
            <Box w={2} />
            Activity
            <Spacer />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <TokenActivityList chainId={chainId} contract={contractAddress} tokenId={tokenId.toString()} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Image src="/assets/icons/more-nfts.png" width="18px" height="14px" />
            <Box w={2} />
            More From This Collection
            <Spacer />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <FetchTokensProvider value={fetchTokensParams} id="more-nft">
              <MoreNftFromThisCollection />
            </FetchTokensProvider>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  function renderViewCount() {
    return (
      <Badge>
        <Image src="/assets/eye.svg" width="14px" height="14px" />
        <SkeletonText fontSize="sm" isLoaded={!isLoadingViewCount} ml={1} noOfLines={1}>
          {viewCount || 0}
        </SkeletonText>
      </Badge>
    )
  }

  if (verticalLayout) {
    return (
      <Stack spacing={6} {...props}>
        {renderMedia()}
        {renderFunctionBar()}
        {renderName()}
        {renderOwnerAndCollection()}
        {renderSaleStatus()}
        {renderActionButtons()}
        {renderStaticInfo()}
        {renderAttributes()}
        {renderTradeInfo()}
        {renderActivityAndMoreNfts()}
      </Stack>
    )
  }

  return (
    <Stack spacing={6} {...props}>
      <Stack w="full" direction="row" spacing={{ base: '40px', lg: '120px' }}>
        <Stack w="full">
          {renderMedia()}
          {renderFunctionBar()}
          {renderStaticInfo()}
        </Stack>
        <Stack w="full" spacing={6}>
          {renderName()}
          {renderOwnerAndCollection()}
          {renderSaleStatus()}
          {renderActionButtons()}
          {renderAttributes()}
          {renderTradeInfo()}
        </Stack>
      </Stack>
      {renderActivityAndMoreNfts()}
    </Stack>
  )
}

export default memo(NftInfo)

function MoreNftFromThisCollection() {
  const { tokens, isLoading } = useFetchTokensContext()

  return (
    <Stack direction="row" w="full" overflowX="auto">
      {tokens?.map(token => (
        <Link key={token.tokenId} href={`/marketplace/${token.contractAddress}/${token.tokenId}`}>
          <NftCard w="228px" h="332px" flexShrink={0} token={token} />
        </Link>
      ))}
    </Stack>
  )
}
