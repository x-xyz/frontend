import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { builtInCollections } from 'configs'

export const getServerSideProps = createServerSidePropsGetter(async () => {
  return { redirect: { destination: `/collection/${builtInCollections[0].alias}`, permanent: false } }
})

export default function Collection() {
  return null
}
