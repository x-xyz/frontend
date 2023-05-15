import AccountLayout from 'components/account/AccountLayout'
import OfferList from 'components/account/OfferList'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Box, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account, TokenStatus } from '@x/models'
import { call, compareAddress, getFirst, isAddress, isErrorResponse } from '@x/utils'
import SelectBuiltinCollection from 'components/input/SelectBuiltinCollection'
import TokenFilters from 'components/token/TokenFilters'

const breakpoint = 'md'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  const resp = await call(() => fetchAccount(address), { maxAttempt: 5, timeout: i => i * 300 })
  if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
  return { props: { account: resp.data } }
})

export default function AccountListingsActive({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: activeAccount } = useActiveWeb3React()
  const { data: listings, isLoading: isLoadingListings } = useQuery(
    [
      'tokens',
      {
        authToken,
        belongsTo: account.address,
        includeOrders: true,
        includeInactiveOrders: true,
        status: [TokenStatus.BuyNow],
      },
    ],
    fetchTokens,
  )

  const [filterCollection, setFilterCollection] = useState<string | null>(null)

  const items = useMemo(() => {
    const listingItems = listings?.data.items || []

    return [...listingItems]
      .sort((a, b) => {
        const da = a.saleEndsAt ? DateTime.fromISO(a.saleEndsAt) : DateTime.fromMillis(0)
        const db = b.saleEndsAt ? DateTime.fromISO(b.saleEndsAt) : DateTime.fromMillis(0)
        return da.diff(db).valueOf()
      })
      .filter(item => {
        if (!filterCollection) return true
        return compareAddress(filterCollection, item.contractAddress)
      })
  }, [filterCollection, listings?.data.items])

  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })

  return (
    <AccountLayout account={account}>
      <Grid
        templateColumns={{ base: '1fr', [breakpoint]: 'auto 1fr' }}
        templateRows={{ base: 'auto 1fr', [breakpoint]: '1fr' }}
        columnGap="30px"
        rowGap="30px"
        mt={15}
      >
        <GridItem>
          <TokenFilters
            w={useMobileLayout ? 'full' : void 0}
            hideFilters={['name', 'status', 'priceGTE', 'attrFilters']}
            components={{ SelectCollection: SelectBuiltinCollection(filterCollection, setFilterCollection) }}
            useSignalCollectionSelector
            hideTitle={useMobileLayout}
          />
        </GridItem>
        <GridItem overflowX="auto">
          <Box w="fit-content" minW="960px">
            <OfferList
              nftitems={items}
              isLoading={isLoadingListings}
              isOwner={compareAddress(account.address, activeAccount)}
            />
          </Box>
        </GridItem>
      </Grid>
    </AccountLayout>
  )
}
