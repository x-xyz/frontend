import AccountLayout from 'components/account/v3/AccountLayout'
import OfferList from 'components/account/v3/OfferList'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { isFeatureEnabled } from 'flags'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Container } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account, SearchTokenV2Params, TokenStatus, TokenV2SortOption } from '@x/models'
import { call, compareAddress, getFirst, isAddress, isErrorResponse } from '@x/utils'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const resp = await call(() => fetchAccount(address), { maxAttempt: 5, timeout: i => i * 300 })
    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
    return { props: { account: resp.data } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountListinggsActive({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: activeAccount } = useActiveWeb3React()
  const [filter, setFilter] = useState<SearchTokenV2Params>({})
  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.PriceDesc)
  const { data: listings, isLoading: isLoadingListings } = useQuery(
    [
      'tokens',
      {
        ...filter,
        sortBy,
        authToken,
        belongsTo: account.address,
        includeOrders: true,
        includeInactiveOrders: true,
        status: [TokenStatus.BuyNow],
      },
    ],
    fetchTokens,
  )
  const { data: auctions, isLoading: isLoadingAuctions } = useQuery(
    [
      'tokens',
      {
        ...filter,
        sortBy,
        authToken,
        belongsTo: account.address,
        includeOrders: true,
        includeInactiveOrders: true,
        status: [TokenStatus.OnAuction],
      },
    ],
    fetchTokens,
  )
  const items = useMemo(() => {
    const listingItems = listings?.data.items || []
    const auctionItems = auctions?.data.items || []
    const dedup: Record<string, boolean> = {}
    return [...listingItems, ...auctionItems]
      .filter(item => {
        const key = `${item.chainId}:${item.contractAddress}:${item.tokenId}`
        if (dedup[key]) return false
        dedup[key] = true
        return true
      })
      .sort((a, b) => {
        const da = a.saleEndsAt ? DateTime.fromISO(a.saleEndsAt) : DateTime.fromMillis(0)
        const db = b.saleEndsAt ? DateTime.fromISO(b.saleEndsAt) : DateTime.fromMillis(0)
        return da.diff(db).valueOf()
      })
  }, [listings, auctions])

  return (
    <AccountLayout account={account} pageTitle="Active Listings">
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        hideFilters={['status']}
      />
      <Container maxW="container.xl" pb="100px">
        <OfferList
          nftitems={items}
          isLoading={isLoadingListings || isLoadingAuctions}
          isOwner={compareAddress(account.address, activeAccount)}
          mt={5}
        />
      </Container>
    </AccountLayout>
  )
}
