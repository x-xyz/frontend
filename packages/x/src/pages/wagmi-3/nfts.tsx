import Layout from 'components/Layout/v3'
import NftList from 'components/token/v3/NftList'
import NftListHeader from 'components/token/v3/NftList/NftListHeader'
import Header from 'components/wagmi-3/Header'
import Navbar from 'components/wagmi-3/Navbar'
import TopBanner from 'components/wagmi-3/TopBanner'
import { collections } from 'configs/wagmi-3'

import { Box, Center } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { defaultTokensv2FromQuery, defaultTokensv2ToQuery, useTokensv2 } from '@x/hooks'
import { ChainId } from '@x/models'

const collectionContractAddresses = collections.map(c => c.contract)

export default function Nfts() {
  useTokensv2('wagmi-3-all-nfts', {
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
          tokenV2Id="wagmi-3-all-nfts"
          hideFilters={['chainId']}
          collectionWhitelist={collectionContractAddresses.map(contract => ({ chainId: ChainId.Ethereum, contract }))}
          useSignalCollectionSelector
        />
      </Center>
      <Center>
        <NftList tokenV2Id="wagmi-3-all-nfts" collections={collections?.data} />
      </Center>
    </Layout>
  )
}
