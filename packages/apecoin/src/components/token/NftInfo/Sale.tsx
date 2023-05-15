import BuyButton from 'components/marketplace/signature-base/BuyButton'
import CancelListingButton from 'components/marketplace/signature-base/CancelListingButton'
import PlaceOfferButton from 'components/marketplace/signature-base/PlaceOfferButton'
import SellButton from 'components/marketplace/signature-base/SellButton'
import TakeOfferButton from 'components/marketplace/signature-base/TakeOfferButton'
import { maxBy, minBy } from 'lodash'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import { Box, Flex, Stack, Text } from '@chakra-ui/layout'
import { HStack, useBreakpointValue } from '@chakra-ui/react'
import { fetchTokenV2 } from '@x/apis/fn'
import { findToken } from '@x/constants'
import { useActiveWeb3React, useErc1155Balance } from '@x/hooks'
import { NftItem, OrderItem, TokenType } from '@x/models'
import { compareAddress, ensureNumber } from '@x/utils'

import UsdPrice from '../../UsdPrice'
import TransferButton from '../TransferButton'
import LowerPriceButton from 'components/marketplace/signature-base/LowerPriceButton'
import NftStakingInfo from './NftStakingInfo'
import { Collection, ListingStrategy } from '@x/models/dist'
import ResText from '../../ResText'

export interface SaleProps {
  collection: Collection
  nftItem: NftItem
}

function Sale({ nftItem: initialData, collection }: SaleProps) {
  const { locale } = useRouter()
  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

  const { account } = useActiveWeb3React()
  // const { chainId, contractAddress, tokenId, bestListing, isMine, myOffer, offers, setOffers, detail } = useNftInfo()
  const { chainId, contractAddress, tokenId } = initialData
  const { data = initialData } = useQuery(['token', chainId, contractAddress, tokenId], fetchTokenV2, { initialData })
  const { offers = [], listings = [], tokenType, owner } = data
  const [balance] = useErc1155Balance(
    chainId,
    contractAddress,
    tokenId,
    tokenType === TokenType.Erc1155 ? account : void 0,
  )
  const owned = tokenType === TokenType.Erc721 ? compareAddress(account, owner) : balance > 0

  function renderPrice(price: number | string, unit: string) {
    return `${price.toLocaleString(locale, { minimumFractionDigits: 3 })} ${unit}`
  }

  function paymentUnit(payment?: OrderItem) {
    if (!payment) return ''
    return findToken(payment.currency || '', chainId)?.symbol.toUpperCase() || ''
  }

  // const oi: OrderItem = {
  //   chainId: 1,
  //   collection: '111',
  //   tokenId: '111',
  //   amount: '1',
  //   price: '2009',
  //   itemIdx: 8844,
  //   orderHash: '111',
  //   orderItemHash: '111',
  //   isAsk: true,
  //   signer: '111', // the address who signed this listing
  //   nonce: '111',
  //   currency: '0x0000000000000000000000000000000000000000',
  //   startTime: '2022-12-27T03:51:11.318Z', // ISO time
  //   endTime: '2024-12-30T03:51:11.318Z', // ISO time
  //   minPercentageToAsk: '111',
  //   marketplace: '111',
  //   strategy: ListingStrategy.FixedPrice,
  //   reservedBuyer: '111',
  //   displayPrice: '1077',
  //   priceInUsd: 123,
  //   priceInNative: 456,
  //   isValid: true,
  //   isUsed: false,
  // }

  const bestOffer = useMemo(() => {
    // return oi
    if (offers.length === 0) return
    return maxBy(offers, o => o.priceInUsd)
  }, [offers])

  const bestListing = useMemo(() => {
    // return oi
    if (listings.length === 0) return
    return minBy(listings, l => l.priceInUsd)
  }, [listings])

  const myOffer = useMemo(() => {
    return offers.find(offer => compareAddress(offer.signer, account))
  }, [offers, account])

  function renderBuyerActions() {
    return (
      <Stack direction={useDesktopView ? 'row' : 'column'} spacing={4} w="full">
        {bestListing && <BuyButton orderItem={bestListing} flex="1 0 auto" />}
        {!myOffer && (
          <PlaceOfferButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            tokenType={tokenType}
            flex="1 0 auto"
            variant="outline"
            nftItem={initialData}
            collection={collection}
          />
        )}
      </Stack>
    )
  }

  function renderNftPrice() {
    return (
      <Stack direction="column" spacing={useDesktopView ? 4 : 2}>
        <Text variant="body2" whiteSpace="nowrap">
          Price
        </Text>
        <HStack alignItems="baseline">
          <Text variant="headline4">
            {bestListing ? renderPrice(bestListing.displayPrice, paymentUnit(bestListing)) : '-'}
          </Text>
          {bestListing && (
            <Text variant="caption" color="textSecondary">
              <UsdPrice chainId={chainId} tokenId={bestListing.currency} prefix="$">
                {ensureNumber(bestListing.displayPrice)}
              </UsdPrice>
            </Text>
          )}
        </HStack>
      </Stack>
    )
  }

  function renderTopOffer() {
    return (
      <Flex direction="column">
        <Text variant="body2" whiteSpace="nowrap">
          Top Offer
        </Text>
        <Text variant="headline6" mt={2}>
          {bestOffer ? renderPrice(bestOffer.displayPrice, paymentUnit(bestOffer)) : '-'}
        </Text>
        {bestOffer && (
          <Text variant="caption" color="textSecondary" mt={1}>
            <UsdPrice chainId={chainId} tokenId={bestOffer.currency} suffix="USD">
              {ensureNumber(bestOffer.displayPrice)}
            </UsdPrice>
          </Text>
        )}
      </Flex>
    )
  }

  return (
    <Box border="1px solid" borderColor="divider">
      {bestListing && (
        <HStack p={useDesktopView ? 6 : 4} borderBottom="1px solid" borderColor="divider">
          <ResText variant={{ base: 'body2', lg: 'body1' }}>
            Sale ends on{' '}
            {DateTime.fromISO(bestListing.endTime).toLocaleString({
              weekday: 'short',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </ResText>
        </HStack>
      )}
      <Stack p={useDesktopView ? 6 : 4} spacing={useDesktopView ? 10 : 6}>
        {renderNftPrice()}
        <Stack direction={useDesktopView ? 'row' : 'column'} spacing={useDesktopView ? '8.25rem' : 6}>
          {renderTopOffer()}
          <NftStakingInfo nft={data} spacing={useDesktopView ? '8.25rem' : 10} />
        </Stack>
        {!owned ? renderBuyerActions() : <SellerActions nftItem={data} collection={collection} />}
      </Stack>
    </Box>
  )
}

function SellerActions({ nftItem: initialData, collection }: SaleProps) {
  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })
  // const { chainId, contractAddress, tokenId, myListing, setOwner, refresh, detail, myOffer } = useNftInfo()
  const { account } = useActiveWeb3React()
  const { chainId, contractAddress, tokenId } = initialData
  const { data = initialData } = useQuery(['token', chainId, contractAddress, tokenId], fetchTokenV2, { initialData })
  const { offers = [], listings = [], tokenType, activeListing } = data
  const myListing = useMemo(
    () => listings.find(listing => compareAddress(listing.signer, account)),
    [account, listings],
  )
  const myOffer = useMemo(() => {
    return offers.find(offer => compareAddress(offer.signer, account))
  }, [offers, account])

  // const myListing: OrderItem = {
  //   chainId: 1,
  //   collection: '111',
  //   tokenId: '111',
  //   amount: '1',
  //   price: '2009',
  //   itemIdx: 8844,
  //   orderHash: '111',
  //   orderItemHash: '111',
  //   isAsk: true,
  //   signer: '0x849cE7dAfb446ca2aA6531F3931a4b83deA37c2f', // the address who signed this listing
  //   nonce: '111',
  //   currency: '0x0000000000000000000000000000000000000000',
  //   startTime: '2022-12-27T03:51:11.318Z', // ISO time
  //   endTime: '2024-12-30T03:51:11.318Z', // ISO time
  //   minPercentageToAsk: '111',
  //   marketplace: '111',
  //   strategy: ListingStrategy.FixedPrice,
  //   reservedBuyer: '111',
  //   displayPrice: '1077',
  //   priceInUsd: 123,
  //   priceInNative: 456,
  //   isValid: true,
  //   isUsed: false,
  // }
  //
  // const activeListing = myListing

  return (
    <Stack direction={useDesktopView ? 'row' : 'column'} spacing={4} w="full">
      {!myListing ? (
        <SellButton
          collection={collection}
          chainId={chainId}
          contractAddress={contractAddress}
          tokenID={tokenId}
          tokenType={tokenType}
          flex="1 0 auto"
        />
      ) : (
        <>
          {activeListing && <LowerPriceButton activeListing={activeListing} flex="1 0 auto" />}
          <CancelListingButton orderItem={myListing} flex="1 0 auto" />
        </>
      )}
      <TransferButton
        chainId={chainId}
        contractAddress={contractAddress}
        tokenId={tokenId}
        tokenSpec={tokenType}
        // onTransferred={address => {
        //   setOwner(address)
        //   refresh()
        // }}
        flex="1 0 auto"
        variant="outline"
      />
      {tokenType === TokenType.Erc1155 && !myOffer && (
        <PlaceOfferButton
          chainId={chainId}
          contractAddress={contractAddress}
          tokenID={tokenId}
          tokenType={tokenType}
          nftItem={initialData}
          collection={collection}
        />
      )}
    </Stack>
  )
}

export default Sale
