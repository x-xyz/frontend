import { Box, Button, Center, Container, Divider, Heading, Stack, useBreakpointValue } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { Collection } from '@x/models'
import Link from 'components/Link'
import { useMemo } from 'react'
import CollectionCard from 'components/collection/v3/CollectionCard'

const breakpoint = 'lg'

export default function LatestCollections() {
  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  /**
   * @todo refactor sortBy
   */
  const { data, isLoading } = useCollectionsQuery({ sortBy: 'created_at_high_to_low' as any })

  const collections = useMemo(() => data?.data?.slice(0, 3) || [], [data])

  function renderSeeAllButton() {
    return (
      <Button>
        <Link href="/collections">X-plore</Link>
      </Button>
    )
  }

  function renderCollection(collection: Collection) {
    return <CollectionCard key={`${collection.chainId}-${collection.erc721Address}`} collection={collection} />
  }

  return (
    <Center flexDir="column">
      <Container maxW="container.xl">
        <Stack direction="row" justify={{ base: 'center', [breakpoint]: 'space-between' }} align="center">
          <Heading>Latest Collections</Heading>
          {useDesktopView && renderSeeAllButton()}
        </Stack>
      </Container>
      <Divider bg="divider" mt={4} mb={10} />
      <Container maxW="container.xl">
        <Box overflowX={{ base: 'auto', [breakpoint]: 'hidden' }} pb={5}>
          <Stack direction="row" spacing={10} w="fit-content">
            {collections.map(renderCollection)}
            {isLoading && (
              <>
                <CollectionCard />
                <CollectionCard />
                <CollectionCard />
              </>
            )}
          </Stack>
        </Box>
      </Container>
      {!useDesktopView && <Box mt={10}>{renderSeeAllButton()}</Box>}
    </Center>
  )
}
