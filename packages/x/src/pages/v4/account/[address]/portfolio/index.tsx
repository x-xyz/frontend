import { getFirst, isAddress } from '@x/utils'
import { isFeatureEnabled } from 'flags'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    return { redirect: { destination: `/account/${address}/portfolio/folders`, permanent: false } }
  },
  { requrieAuth: !isFeatureEnabled('v4.portfolio-page') },
)

export default function AccountIndex() {
  return null
}
