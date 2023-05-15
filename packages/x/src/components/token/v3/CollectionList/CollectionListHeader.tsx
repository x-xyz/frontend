import { Badge, Container, Flex, SkeletonText, Stack } from '@chakra-ui/react'
import CollectionFilters from 'components/filters/CollectionFilters.v2'
import CollectionSortor from 'components/filters/CollectionSortor.v2'
import AppliedCollectionFilters from 'components/filters/AppliedCollectionFilters.v2'
import AppliedCollectionSortor from 'components/filters/AppliedCollectionSortor.v2'
import { CollectionSortOption, SearchCollectionParams } from '@x/models/dist'
import { isFeatureEnabled } from 'flags'

export interface CollectionListHeaderProps {
  filter?: SearchCollectionParams
  onFilterChange?: (filter: SearchCollectionParams) => void
  sortBy?: CollectionSortOption
  onSortByChange?: (sortBy: CollectionSortOption) => void
  isLoading?: boolean
  totalCount?: number
  hideFilters?: (keyof SearchCollectionParams)[]
  hideAllFilters?: boolean
  hideTotalCount?: boolean
}

export default function CollectionListHeader({
  filter,
  onFilterChange,
  sortBy,
  onSortByChange,
  isLoading,
  totalCount = 0,
  hideFilters,
  hideAllFilters,
  hideTotalCount,
}: CollectionListHeaderProps) {
  return (
    <Container maxW="container.xl">
      <Flex direction="row" py={5} wrap="wrap" justify="center" sx={{ '&>*': { mx: 2.5, mb: 5 } }}>
        {!hideAllFilters && (
          <CollectionFilters defaultValues={filter} onValueChange={onFilterChange} hideFilters={hideFilters} />
        )}
        {isFeatureEnabled('collections-sortor') && (
          <>
            <CollectionSortor value={sortBy} onValueChange={onSortByChange} />
            <AppliedCollectionSortor sortBy={sortBy} />
          </>
        )}
        {!hideTotalCount && (
          <Badge>
            <SkeletonText mr={1} noOfLines={1} isLoaded={!isLoading}>
              {totalCount}
            </SkeletonText>
            Results
          </Badge>
        )}
      </Flex>
      {!hideAllFilters && (
        <Stack direction="row" pb={10}>
          <AppliedCollectionFilters value={filter} onValueChange={onFilterChange} />
        </Stack>
      )}
    </Container>
  )
}
