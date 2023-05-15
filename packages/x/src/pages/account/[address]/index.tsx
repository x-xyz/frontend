import { getFirst } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(async ctx => {
  const address = getFirst(ctx.query.address)

  if (!address) return { redirect: { destination: '/404', permanent: false } }

  return { redirect: { destination: `/account/${address}/collections`, permanent: false } }
})

export default function Account() {
  return null
}
