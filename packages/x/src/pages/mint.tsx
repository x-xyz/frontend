import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(async () => ({
  redirect: { destination: '/create', permanent: false },
}))

export default function Mint() {
  return null
}
