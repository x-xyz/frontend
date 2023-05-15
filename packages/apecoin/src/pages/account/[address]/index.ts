import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(async ctx => {
  const address = ctx.params?.address
  return { redirect: { destination: `/account/${address}/nfts`, permanent: true } }
})

export default function Index() {
  return null
}
