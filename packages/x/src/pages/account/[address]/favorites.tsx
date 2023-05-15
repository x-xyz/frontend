import Layout from 'components/Layout/v2'
import { useFetchTokens, FetchTokensProvider } from '@x/hooks'
import { getFirst } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import NftCardPage from 'components/token/NftCardPage'

interface Props {
  address: string
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.query.address)

  if (!address) return { redirect: { destination: '/404', permanent: false } }

  return { props: { address } }
})

export default function AccountFavorites({ address }: Props) {
  const fetchTokenParams = useFetchTokens({ defaultValue: { likedBy: address, sortBy: 'createdAt' }, id: 'favorites' })

  return (
    <Layout title="My Favorites">
      <FetchTokensProvider value={fetchTokenParams} id="favorites">
        <NftCardPage />
      </FetchTokensProvider>
    </Layout>
  )
}
