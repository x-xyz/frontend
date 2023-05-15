import AccountNavBar from 'components/account/AccountNavBar'
import BuyAndSellBanner from 'components/BuyAndSellBanner'
import Layout from 'components/Layout/v2'
import NftCardPage from 'components/token/NftCardPage'
import { useFetchTokens, FetchTokensProvider } from '@x/hooks'
import { useEffect } from 'react'
import { getFirst } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

interface Props {
  address: string
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.query.address)

  if (!address) return { redirect: { destination: '/404', permanent: false } }

  return { props: { address } }
})

export default function MyCollections({ address }: Props) {
  return (
    <Layout title="Dashboard">
      <BuyAndSellBanner />
      <AccountNavBar account={address} />
      <MyCreations account={address} />
    </Layout>
  )
}

interface MyCreationsProps {
  account: string
}

function MyCreations({ account }: MyCreationsProps) {
  const fetchTokensParams = useFetchTokens({
    defaultValue: { address: account, sortBy: 'createdAt' },
    id: 'my-collections',
  })

  const { setAddress } = fetchTokensParams

  useEffect(() => {
    setAddress(account)
  }, [setAddress, account])

  return (
    <FetchTokensProvider value={fetchTokensParams} id="my-collections">
      <NftCardPage />
    </FetchTokensProvider>
  )
}
