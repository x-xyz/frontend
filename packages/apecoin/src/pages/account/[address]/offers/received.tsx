import { Stack } from '@chakra-ui/layout'
import { Radio, RadioGroup } from '@chakra-ui/radio'
import AccountLayout from 'components/account/AccountLayout'
import OfferList from 'components/account/OfferList'
import { isFeatureEnabled } from 'flags'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Grid, GridItem, useBreakpointValue, useCallbackRef } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account, NftItem, TokenStatus } from '@x/models'
import { compareAddress, getFirst, isAddress, isErrorResponse } from '@x/utils'
import TokenFilters from 'components/token/TokenFilters'
import SelectBuiltinCollection from 'components/input/SelectBuiltinCollection'

const breakpoint = 'md'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  const resp = await fetchAccount(address)
  if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
  return { props: { account: resp.data } }
})

export default function AccountOffersReceived({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: activeAccount } = useActiveWeb3React()
  const { data: tokensWithOffer, isLoading: isLoadingTokensWithOffer } = useQuery(
    ['tokens', { authToken, belongsTo: account.address, status: [TokenStatus.HasOffer], includeOrders: true }],
    fetchTokens,
  )

  const [filterCollection, setFilterCollection] = useState<string | null>(null)
  const [tokens, setTokens] = useState<NftItem[]>(tokensWithOffer?.data.items || [])

  useEffect(() => {
    setTokens(tokensWithOffer?.data.items || [])
  }, [tokensWithOffer])

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      if (!filterCollection) return true
      return compareAddress(filterCollection, t.contractAddress)
    })
  }, [filterCollection, tokens])

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
            useSignalCollectionSelector
            components={{
              SelectCollection: SelectBuiltinCollection(filterCollection, setFilterCollection),
              custom: <OfferFilter />,
            }}
            hideTitle={useMobileLayout}
          />
        </GridItem>
        <GridItem>
          <OfferList
            nftitems={filteredTokens}
            isLoading={isLoadingTokensWithOffer}
            isOwner={compareAddress(account.address, activeAccount)}
            onListingCanceled={removeListing}
            onOfferAccepted={removeNftItem}
          />
        </GridItem>
      </Grid>
    </AccountLayout>
  )
}

const matchNftitem = (a: NftItem) => (b: NftItem) =>
  a.chainId === b.chainId && compareAddress(a.contractAddress, b.contractAddress) && a.tokenId === b.tokenId

function OfferFilter() {
  const { query, push } = useRouter()

  return (
    <RadioGroup
      defaultValue="2"
      onChange={v => {
        if (v === '1') push(`/account/${query.address}/offers/placed`)
      }}
    >
      <Stack>
        <Radio value="1">Offers Made</Radio>
        <Radio value="2">Offers Received</Radio>
      </Stack>
    </RadioGroup>
  )
}
