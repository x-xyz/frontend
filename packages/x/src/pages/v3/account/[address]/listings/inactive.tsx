import AccountLayout from 'components/account/v3/AccountLayout'
import InactiveListingList from 'components/account/v3/InactiveListingList'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { isFeatureEnabled } from 'flags'
import { useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Container } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account, SearchTokenV2Params, TokenV2SortOption } from '@x/models'
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

export default function AccountListinggsInactive({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: activeAccount } = useActiveWeb3React()
  const [filter, setFilter] = useState<SearchTokenV2Params>({})
  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.CreatedAtDesc)
  const { data, isLoading } = useQuery(
    ['tokens', { ...filter, sortBy, authToken, notBelongsTo: account.address, listingFrom: account.address }],
    fetchTokens,
  )

  return (
    <AccountLayout account={account} pageTitle="Inactive Listings">
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        hideFilters={['status']}
      />
      <Container maxW="container.xl" pb="100px">
        <InactiveListingList
          nftitems={data?.data.items || []}
          isLoading={isLoading}
          viewer={account.address}
          isViewer={compareAddress(account.address, activeAccount)}
          mt={5}
        />
      </Container>
    </AccountLayout>
  )
}
