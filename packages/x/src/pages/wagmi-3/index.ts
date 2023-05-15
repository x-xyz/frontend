import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(async () => ({
  redirect: { destination: '/wagmi-3/collections', permanent: true },
}))

export default function Index() {
  return null
}
