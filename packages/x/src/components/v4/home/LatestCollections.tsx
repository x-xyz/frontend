import CollectionCard from 'components/v4/collection/CollectionCard'
import { useMemo } from 'react'

import { Flex, Heading, Stack } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { Collection } from '@x/models'

export default function LatestCollections() {
  /**
   * @todo refactor sortBy
   */
  const { data, isLoading } = useCollectionsQuery({ sortBy: 'created_at_high_to_low' as any })

  const collections = useMemo(() => data?.data?.slice(0, 5) || [], [data])

  function renderCollection(collection: Collection) {
    return <CollectionCard key={`${collection.chainId}-${collection.erc721Address}`} collection={collection} />
  }

  return (
    <Stack spacing={8}>
      <Heading as="h4" fontSize="20px">
        Latest Collections
      </Heading>
      <Flex justify="space-between">
        {collections.map(renderCollection)}
        {isLoading && (
          <>
            <CollectionCard />
            <CollectionCard />
            <CollectionCard />
            <CollectionCard />
            <CollectionCard />
          </>
        )}
      </Flex>
    </Stack>
  )
}
