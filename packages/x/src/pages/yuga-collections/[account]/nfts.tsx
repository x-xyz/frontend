import Layout from 'components/Layout/v3'
import NftList from 'components/token/v3/NftList'
import NftListHeader from 'components/token/v3/NftList/NftListHeader'
import Header from 'components/yuga-collections/Header'
import Navbar from 'components/yuga-collections/Navbar'
import TopBanner from 'components/yuga-collections/TopBanner'
import { collections } from 'configs/yuga-collections'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Box, Center } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { defaultTokensv2FromQuery, defaultTokensv2ToQuery, useTokensv2 } from '@x/hooks'
import { ChainId } from '@x/models'
import { isAddress } from '@x/utils'

const collectionContractAddresses = collections.map(c => c.contract)

interface Props {
  account: string
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const { account } = ctx.params || {}
  if (typeof account !== 'string') return { notFound: true }
  if (!isAddress(account)) return { notFound: true }
  return { props: { account } }
})

export default function Nfts({ account }: Props) {
  useTokensv2('yuga-collections-my-nfts', {
    fromQuery: query => {
      const filters = defaultTokensv2FromQuery(query)
      filters.chainId = ChainId.Ethereum
      filters.collections = collectionContractAddresses
      filters.ownedBy = account
      return filters
    },
    toQuery: filters => {
      const query = defaultTokensv2ToQuery(filters)
      delete query.chainId
      delete query.collections
      delete query.ownedBy
      return query
    },
    defaultChainId: ChainId.Ethereum,
    defaultCollections: collectionContractAddresses,
    defaultOwnedBy: account,
  })

  const { data: collections } = useCollectionsQuery({})

  return (
    <Layout components={{ Header }}>
      <TopBanner />
      <Box h={10} />
      <Navbar />
      <Center>
        <NftListHeader
          tokenV2Id="yuga-collections-my-nfts"
          hideFilters={['chainId', 'ownedBy']}
          collectionWhitelist={collectionContractAddresses.map(contract => ({ chainId: ChainId.Ethereum, contract }))}
          useSignalCollectionSelector
        />
      </Center>
      <Center>
        <NftList tokenV2Id="yuga-collections-my-nfts" collections={collections?.data} />
      </Center>
    </Layout>
  )
}
