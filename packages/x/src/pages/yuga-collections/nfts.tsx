import Layout from 'components/Layout/v3'
import NftList from 'components/token/v3/NftList'
import NftListHeader from 'components/token/v3/NftList/NftListHeader'
import Header from 'components/yuga-collections/Header'
import Navbar from 'components/yuga-collections/Navbar'
import TopBanner from 'components/yuga-collections/TopBanner'
import { collections } from 'configs/yuga-collections'

import { Box, Center } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { defaultTokensv2FromQuery, defaultTokensv2ToQuery, useTokensv2 } from '@x/hooks'
import { ChainId } from '@x/models'

const collectionContractAddresses = collections.map(c => c.contract)

export default function Nfts() {
  useTokensv2('yuga-collections-all-nfts', {
    fromQuery: query => {
      const filters = defaultTokensv2FromQuery(query)
      filters.chainId = ChainId.Ethereum
      filters.collections = collectionContractAddresses
      return filters
    },
    toQuery: filters => {
      const query = defaultTokensv2ToQuery(filters)
      delete query.chainId
      delete query.collections
      return query
    },
    defaultChainId: ChainId.Ethereum,
    defaultCollections: collectionContractAddresses,
  })

  const { data: collections } = useCollectionsQuery({})

  return (
    <Layout components={{ Header }}>
      <TopBanner />
      <Box h={10} />
      <Navbar />
      <Center>
        <NftListHeader
          tokenV2Id="yuga-collections-all-nfts"
          hideFilters={['chainId']}
          collectionWhitelist={collectionContractAddresses.map(contract => ({ chainId: ChainId.Ethereum, contract }))}
          useSignalCollectionSelector
        />
      </Center>
      <Center>
        <NftList tokenV2Id="yuga-collections-all-nfts" collections={collections?.data} />
      </Center>
    </Layout>
  )
}
