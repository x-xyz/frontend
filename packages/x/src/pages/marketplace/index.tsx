import Layout from 'components/Layout/v2'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { useRouter } from 'next/router'
import {
  useFetchTokens,
  FetchTokensProvider,
  parseFetchTokensParamsFromQuery,
  useFetchTokensParamsQuery,
} from '@x/hooks'
import NftCardPage from 'components/token/NftCardPage'

export const getServerSideProps = createServerSidePropsGetter()

export default function Marketplace() {
  const { query } = useRouter()

  const fetchTokensParams = useFetchTokens({
    defaultValue: { sortBy: 'viewed', ...parseFetchTokensParamsFromQuery(query) },
    id: 'marketplace',
  })

  useFetchTokensParamsQuery(fetchTokensParams)

  return (
    <Layout title="Marketplace">
      <FetchTokensProvider value={fetchTokensParams} id="marketplace">
        <NftCardPage />
      </FetchTokensProvider>
    </Layout>
  )
}
