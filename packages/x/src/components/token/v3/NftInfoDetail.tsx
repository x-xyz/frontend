import { Box, BoxProps, Text } from '@chakra-ui/layout'
import { Button, HStack } from '@chakra-ui/react'
import { useFetchTokens, FetchTokensProvider, useFetchTokensContext } from '@x/hooks'
import { Collection } from '@x/models'
import { getFirst } from '@x/utils/dist'
import { useRouter } from 'next/router'
import Link from '../../Link'
import NftCardList from './NftCardList'
import { useNftInfo } from '../NftInfoProvider'

export default function NftInfoDetail(props: BoxProps) {
  const { contractAddress, collection } = useNftInfo()

  const router = useRouter()

  const fetchTokensParams = useFetchTokens({
    defaultValue: { collections: [contractAddress], sortBy: 'viewed' },
    id: 'nft-detail',
  })

  const chainName = getFirst(router.query.chainName)

  const collectionUrl = `/collection/${chainName}/${contractAddress}`

  return (
    <Box mt="270px" {...props}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold" fontSize="5xl" fontFamily="heading">
          More from Collection
        </Text>
        <Link href={collectionUrl}>
          <Button>View More</Button>
        </Link>
      </HStack>
      <Box h="px" mt="4" mb="10" backgroundColor="divider" />
      <FetchTokensProvider value={fetchTokensParams} id="nft-detail">
        <NftCardListWithContext collection={collection} />
      </FetchTokensProvider>
    </Box>
  )
}

interface NftCardListWithContext {
  collection?: Collection
}

function NftCardListWithContext({ collection }: NftCardListWithContext) {
  const { tokens } = useFetchTokensContext()
  const firstFourTokens = tokens.slice(0, 4)

  return <NftCardList items={firstFourTokens} collection={collection} />
}
