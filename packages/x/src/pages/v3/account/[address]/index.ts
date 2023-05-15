import { getFirst, isAddress } from '@x/utils'
import { isFeatureEnabled } from 'flags'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    return { redirect: { destination: `/account/${address}/portfolio`, permanent: false } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountIndex() {
  return null
}
