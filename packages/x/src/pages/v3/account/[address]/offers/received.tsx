import AccountLayout from 'components/account/v3/AccountLayout'
import OfferList from 'components/account/v3/OfferList'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { isFeatureEnabled } from 'flags'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Container, useCallbackRef } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import {
  Account,
  NftItem,
  noopTokenAuction,
  SearchTokenV2Params,
  TokenOffer,
  TokenStatus,
  TokenV2SortOption,
} from '@x/models'
import { compareAddress, getFirst, isAddress, isErrorResponse } from '@x/utils'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const resp = await fetchAccount(address)
    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
    return { props: { account: resp.data } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountOffersReceived({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: activeAccount } = useActiveWeb3React()
  const [filter, setFilter] = useState<SearchTokenV2Params>({})
  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.OfferDeadlineAsc)
  const { data: tokensWithOffer, isLoading: isLoadingTokensWithOffer } = useQuery(
    [
      'tokens',
      { ...filter, sortBy, authToken, belongsTo: account.address, status: [TokenStatus.HasOffer], includeOrders: true },
    ],
    fetchTokens,
  )
  const { data: tokensWithBid, isLoading: isLoadingTokensWithBid } = useQuery(
    [
      'tokens',
      { ...filter, sortBy, authToken, belongsTo: account.address, status: [TokenStatus.HasBid], includeOrders: true },
    ],
    fetchTokens,
  )
  const [tokens, setTokens] = useState<NftItem[]>([])

  useEffect(() => {
    const map: Record<string, boolean> = {}
    const result: NftItem[] = []
    if (tokensWithBid?.data.items) {
      for (const token of tokensWithBid.data.items) {
        const key = `${token.chainId}:${token.contractAddress}:${token.tokenId}`
        if (map[key]) continue
        map[key] = true
        result.push(token)
      }
    }
    if (tokensWithOffer?.data.items) {
      for (const token of tokensWithOffer.data.items) {
        const key = `${token.chainId}:${token.contractAddress}:${token.tokenId}`
        if (map[key]) continue
        map[key] = true
        result.push(token)
      }
    }
    setTokens(result)
  }, [tokensWithBid, tokensWithOffer])

  const removeAuction = useCallbackRef((nftitem: NftItem) => {
    setTokens(prev => {
      const index = prev.findIndex(matchNftitem(nftitem))
      if (index === -1) return prev
      return [
        ...prev.slice(0, index),
        { ...prev[index], auction: noopTokenAuction, highestBid: void 0 },
        ...prev.slice(index + 1),
      ]
    })
  }, [])

  const removeListing = useCallbackRef((nftitem: NftItem) => {
    setTokens(prev => {
      const index = prev.findIndex(matchNftitem(nftitem))
      if (index === -1) return prev
      return [...prev.slice(0, index), { ...prev[index], activeListing: void 0 }, ...prev.slice(index + 1)]
    })
  }, [])

  const removeNftItem = useCallbackRef((nftitem: NftItem) => {
    setTokens(prev => {
      const index = prev.findIndex(matchNftitem(nftitem))
      if (index === -1) return prev
      return [...prev.slice(0, index), ...prev.slice(index + 1)]
    })
  }, [])

  return (
    <AccountLayout account={account} pageTitle="Offers Received">
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        hideFilters={['status']}
        useSortOptions={[
          TokenV2SortOption.ViewedDesc,
          TokenV2SortOption.LikedDesc,
          TokenV2SortOption.CreatedAtAsc,
          TokenV2SortOption.OfferCreatedDesc,
          TokenV2SortOption.OfferDeadlineAsc,
          TokenV2SortOption.OfferPriceAsc,
          TokenV2SortOption.OfferPriceDesc,
        ]}
        useOfferPrice
      />
      <Container maxW="container.xl" pb="100px">
        <OfferList
          nftitems={tokens}
          isLoading={isLoadingTokensWithOffer || isLoadingTokensWithBid}
          isOwner={compareAddress(account.address, activeAccount)}
          mt={5}
          onAuctionCanceled={removeAuction}
          onListingCanceled={removeListing}
          // after traded, nftitem should be removed from list
          onOfferAccepted={removeNftItem}
          onAuctionConcluded={removeNftItem}
        />
      </Container>
    </AccountLayout>
  )
}

const matchNftitem = (a: NftItem) => (b: NftItem) =>
  a.chainId === b.chainId && compareAddress(a.contractAddress, b.contractAddress) && a.tokenId === b.tokenId
