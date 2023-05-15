import { isFeatureEnabled } from 'flags'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(
  async () => ({ redirect: { destination: '/wagmi/bayc', permanent: false } }),
  { requrieAuth: isFeatureEnabled('promotion-page') },
)

export default function Index() {
  return null
}
