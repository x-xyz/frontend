import { OrderItem } from '@x/models/dist'
import AccountLayout from 'components/account/v3/AccountLayout'
import OfferList from 'components/account/v3/OfferList'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { isFeatureEnabled } from 'flags'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Container, useCallbackRef } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useAuthToken } from '@x/hooks'
import { Account, NftItem, SearchTokenV2Params, TokenStatus, TokenV2SortOption } from '@x/models'
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

export default function AccountOffersPlaced({ account }: Props) {
  const [authToken] = useAuthToken()
  const [filter, setFilter] = useState<SearchTokenV2Params>({})
  const [sortBy, setSortBy] = useState(TokenV2SortOption.PriceDesc)
  const notBelongsTo = account.address
  const { data: tokensWithOffer, isLoading: isLoadingTokensWithOffer } = useQuery(
    [
      'tokens',
      {
        ...filter,
        sortBy,
        authToken,
        notBelongsTo,
        status: [TokenStatus.HasOffer],
        offerOwners: [account.address],
        includeOrders: true,
      },
    ],
    fetchTokens,
  )

  const { data: tokensWithBid, isLoading: isLoadingTokensWithBid } = useQuery(
    [
      'tokens',
      {
        ...filter,
        sortBy,
        authToken,
        notBelongsTo,
        status: [TokenStatus.HasBid],
        bidOwner: account.address,
        includeOrders: true,
      },
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

  const removeBid = useCallbackRef((nftitem: NftItem) => {
    setTokens(prev => {
      const index = prev.findIndex(matchNftitem(nftitem))
      if (index === -1) return prev
      return [...prev.slice(0, index), { ...prev[index], highestBid: void 0 }, ...prev.slice(index + 1)]
    })
  }, [])

  const removeOffer = useCallbackRef((nftitem: NftItem, offer: OrderItem) => {
    setTokens(prev => {
      const index = prev.findIndex(matchNftitem(nftitem))
      if (index === -1) return prev
      const offerIndex = prev[index].offers.findIndex(matchOffer(offer))
      if (offerIndex === -1) return prev
      return [
        ...prev.slice(0, index),
        {
          ...prev[index],
          offers: [...prev[index].offers.slice(0, offerIndex), ...prev[index].offers.slice(offerIndex + 1)],
        },
        ...prev.slice(index + 1),
      ]
    })
  }, [])

  return (
    <AccountLayout account={account} pageTitle="Offers Placed">
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
          isLoading={isLoadingTokensWithBid || isLoadingTokensWithOffer}
          mt={5}
          onBidWithdrawed={removeBid}
          onOfferCanceled={removeOffer}
        />
      </Container>
    </AccountLayout>
  )
}

const matchNftitem = (a: NftItem) => (b: NftItem) =>
  a.chainId === b.chainId && compareAddress(a.contractAddress, b.contractAddress) && a.tokenId === b.tokenId

const matchOffer = (a: OrderItem) => (b: OrderItem) => compareAddress(a.orderItemHash, b.orderItemHash)
