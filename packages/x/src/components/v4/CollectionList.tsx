import { Box, Button, Center, Grid, GridItem, SkeletonCircle, SkeletonText, Stack, StackProps } from '@chakra-ui/react'
import { CollectionWithTradingVolume } from '@x/models'
import { useMemo, useState } from 'react'
import { times } from 'lodash'
import Media from 'components/Media'

export interface CollectionListProps extends StackProps {
  collections?: CollectionWithTradingVolume[]
  isLoading?: boolean
  countPerPage?: number
}

export default function CollectionList({
  collections = [],
  isLoading,
  countPerPage = 5,
  children,
  ...props
}: CollectionListProps) {
  const [page, setPage] = useState(0)
  const maxPage = useMemo(() => collections.length / countPerPage, [collections, countPerPage])
  const pageItems = useMemo(() => {
    const start = page * countPerPage
    const end = start + countPerPage
    return collections.slice(start, end)
  }, [collections, page, countPerPage])

  return (
    <Stack {...props}>
      <Stack direction="row" spacing={4} alignItems="center">
        {children}
      </Stack>
      {isLoading ? (
        <>
          <CollectionItem isLoading index={0} />
          <CollectionItem isLoading index={1} />
          <CollectionItem isLoading index={2} />
          <CollectionItem isLoading index={3} />
          <CollectionItem isLoading index={4} />
        </>
      ) : (
        pageItems.map((collection, index) => (
          <CollectionItem key={collection.erc721Address} collection={collection} index={index + page * countPerPage} />
        ))
      )}
      <Center h="60px">
        {times(maxPage).map(i => (
          <Button
            key={i}
            w={6}
            h="full"
            variant="unstyled"
            onClick={() => setPage(i)}
            _active={{ outline: 'none' }}
            _focus={{ outline: 'none' }}
          >
            <Center w="full" h="full">
              <Box
                w={page === i ? 3 : 2}
                h={page === i ? 3 : 2}
                bg={page === i ? 'primary' : 'value'}
                borderRadius="full"
              />
            </Center>
          </Button>
        ))}
      </Center>
    </Stack>
  )
}

interface CollectionItemProps extends StackProps {
  index?: number
  collection?: CollectionWithTradingVolume
  isLoading?: boolean
}

function CollectionItem({ index = 0, collection, isLoading }: CollectionItemProps) {
  return (
    <Grid
      w="full"
      h="60px"
      p={2.5}
      templateRows="auto 1fr"
      templateColumns="auto auto repeat(6, 1fr)"
      columnGap={2}
      bg={collection?.eligibleForPromo ? 'linear-gradient(to bottom, #2f677b, #3c2b49)' : '#000'}
      borderWidth={collection?.eligibleForPromo ? 1 : 0}
      borderColor={collection?.eligibleForPromo ? 'primary' : 'unset'}
    >
      <GridItem rowSpan={2}>
        <Center w={9} h="full">
          {index + 1}
        </Center>
      </GridItem>
      <GridItem rowSpan={2}>
        <SkeletonCircle w={10} h={10} isLoaded={!isLoading}>
          <Media w="full" h="full" src={collection?.logoImageUrl} contentType="image" />
        </SkeletonCircle>
      </GridItem>
      <GridItem rowSpan={2}>
        <Center h="full">
          <SkeletonText w="full" noOfLines={1} isLoaded={!isLoading}>
            {collection?.collectionName}
          </SkeletonText>
        </Center>
      </GridItem>
      <GridItem fontSize="xs" color="note">
        Volume
      </GridItem>
      <GridItem fontSize="xs" color="note">
        Index
      </GridItem>
      <GridItem fontSize="xs" color="note">
        Floor Price
      </GridItem>
      <GridItem fontSize="xs" color="note">
        Owners
      </GridItem>
      <GridItem fontSize="xs" color="note">
        Items
      </GridItem>
      <GridItem>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          {collection?.volume}
        </SkeletonText>
      </GridItem>
      <GridItem>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          -
        </SkeletonText>
      </GridItem>
      <GridItem>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          {collection?.openseaFloorPriceInNative}
        </SkeletonText>
      </GridItem>
      <GridItem>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          {collection?.numOwners || '-'}
        </SkeletonText>
      </GridItem>
      <GridItem>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          {collection?.supply || '-'}
        </SkeletonText>
      </GridItem>
    </Grid>
  )
}
