import Layout from 'components/Layout'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { useRouter } from 'next/router'
import { useFetchTokens, FetchTokensProvider, parseFetchTokensParamsFromQuery } from '@x/hooks'
import NftCardPage from 'components/token/NftCardPage'
import MarketNav from 'components/marketplace/MarketNav'
import { defaultNetwork } from '@x/constants'
import HeadMeta from 'components/HeadMeta'

export const getServerSideProps = createServerSidePropsGetter(void 0, { requrieAuth: true })

export default function Marketplace() {
  const { query } = useRouter()

  const fetchTokensParams = useFetchTokens({
    defaultValue: { sortBy: 'viewed', ...parseFetchTokensParamsFromQuery(query), chainId: defaultNetwork },
    id: 'marketplace',
  })

  // useFetchTokensParamsQuery(fetchTokensParams, { ignores: ['chainId'] })

  return (
    <Layout>
      <HeadMeta subtitle="Browse NFTs" description="Buy NFTs with Bazaar's high reward and BNB Chain’s low gas fee." />
      <MarketNav />
      <FetchTokensProvider value={fetchTokensParams} id="marketplace">
        <NftCardPage />
      </FetchTokensProvider>
    </Layout>
  )
}
