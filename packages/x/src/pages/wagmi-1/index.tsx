import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(
  async () => ({ redirect: { destination: '/wagmi/bayc', permanent: false } }),
  { requrieAuth: true },
)

export default function Index() {
  return null
}
