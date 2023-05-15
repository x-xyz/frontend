import AccountLayout from 'components/account/v3/AccountLayout'
import { isFeatureEnabled } from 'flags'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { fetchAccount } from '@x/apis/fn'
import { Account } from '@x/models'
import { call, getFirst, isAddress, isErrorResponse } from '@x/utils'

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

export default function AccountCreated({ account }: Props) {
  return <AccountLayout account={account} pageTitle="Created NFTs"></AccountLayout>
}
