import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(async () => ({
  redirect: { destination: '/yuga-collections/collections', permanent: true },
}))

export default function Index() {
  return null
}
