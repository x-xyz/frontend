import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { getFirst, isAddress } from '@x/utils'

export const getServerSideProps = createServerSidePropsGetter(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  return { redirect: { destination: `/account/${address}/listings/active`, permanent: false } }
})

export default function AccountListingsIndex() {
  return null
}
