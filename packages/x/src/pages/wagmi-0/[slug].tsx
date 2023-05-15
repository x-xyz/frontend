import { FetchTokensProvider, useFetchTokens } from '@x/hooks'
import Layout from 'components/Layout/wagmi'
import NftCardPage from 'components/token/NftCardPage'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import projects from 'components/Layout/wagmi/wagmi-0'
import { getFirst } from '@x/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const getServerSideProps = createServerSidePropsGetter()

export default function Bakc() {
  const { query, replace } = useRouter()

  const slug = getFirst(query.slug)

  const project = slug ? projects.find(p => p.name.toLowerCase().replace(/\s/g, '-') === slug) : void 0

  if (!project) {
    replace('/404')
    return null
  }

  return <Content address={project.address} />
}

function Content({ address }: { address: string }) {
  const fetchTokeParams = useFetchTokens({
    defaultValue: {
      collections: [address],
      sortBy: 'createdAt',
    },
  })

  const { setCollections, setAddress } = fetchTokeParams

  useEffect(() => {
    setCollections([address])
    setAddress(void 0)
  }, [address, setCollections, setAddress])

  return (
    <Layout title="Special Promotion" assetsFolder="/assets/wagmi-0" projects={projects}>
      <FetchTokensProvider value={fetchTokeParams}>
        <NftCardPage strewn={false} hidePanels={['collections', 'category', 'chain']} />
      </FetchTokensProvider>
    </Layout>
  )
}
