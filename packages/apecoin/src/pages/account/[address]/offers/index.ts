import { getFirst, isAddress } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  return { redirect: { destination: `/account/${address}/offers/placed`, permanent: false } }
})

export default function AccountOffersIndex() {
  return null
}
