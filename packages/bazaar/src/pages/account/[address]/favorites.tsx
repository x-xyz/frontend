import AccountLayout from 'components/account/AccountLayout'
import Layout from 'components/Layout'
import { useFetchTokens, FetchTokensProvider } from '@x/hooks'
import { getFirst, isErrorResponse } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import NftCardPage from 'components/token/NftCardPage'
import { defaultNetwork } from '@x/constants'
import { fetchAccount } from '@x/apis/fn'
import { Account } from '@x/models'
import HeadMeta from 'components/HeadMeta'

interface Props {
  address: string
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.query.address)

    if (!address) return { notFound: true }

    const resp = await fetchAccount(address)

    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }

    return { props: { address, account: resp.data } }
  },
  { requrieAuth: true },
)

export default function AccountFavorites({ address, account: pageAccount }: Props) {
  const fetchTokenParams = useFetchTokens({
    defaultValue: { likedBy: address, sortBy: 'createdAt', chainId: defaultNetwork },
    id: 'favorites',
  })

  return (
    <Layout>
      <HeadMeta subtitle={pageAccount.alias || address} description={pageAccount.bio} />
      <AccountLayout address={address}>
        <FetchTokensProvider value={fetchTokenParams} id="favorites">
          <NftCardPage />
        </FetchTokensProvider>
      </AccountLayout>
    </Layout>
  )
}
