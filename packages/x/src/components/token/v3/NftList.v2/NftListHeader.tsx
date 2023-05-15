import AppliedTokenFilters from 'components/filters/AppliedTokenFilters.v2'
import AppliedTokenSortor from 'components/filters/AppliedTokenSortor.v2'
import TokenFilters, { TokenFiltersProps } from 'components/filters/TokenFilters.v2'
import TokenSortor from 'components/filters/TokenSortor.v2'
import { useRouter } from 'next/router'

import { Badge, Container, Flex, Input, SkeletonText, Stack } from '@chakra-ui/react'
import { Collection, SearchTokenV2Params, TokenV2SortOption } from '@x/models'
import { useDebouncedValue, useSyncRef } from '@x/hooks'
import { useEffect, useState } from 'react'

export interface NftListHeaderProps {
  collection?: Collection
  hideFilters?: (keyof SearchTokenV2Params)[]
  collectionWhitelist?: TokenFiltersProps['collectionWhitelist']
  useSignalCollectionSelector?: TokenFiltersProps['useSignalCollectionSelector']
  totalCount?: number
  isLoading?: boolean
  filter?: SearchTokenV2Params
  onFilterChange?: (value: SearchTokenV2Params) => void
  defaultFilter?: SearchTokenV2Params
  sortBy?: TokenV2SortOption
  onSortByChange?: (sortBy: TokenV2SortOption) => void
  appendChildren?: React.ReactNode
  useSortOptions?: TokenV2SortOption[]
  useOfferPrice?: boolean
}

export default function NftListHeader({
  collection,
  hideFilters,
  collectionWhitelist,
  useSignalCollectionSelector,
  totalCount = 0,
  isLoading,
  filter,
  onFilterChange,
  defaultFilter,
  sortBy,
  onSortByChange,
  appendChildren,
  useSortOptions,
  useOfferPrice,
}: NftListHeaderProps) {
  const { locale } = useRouter()
  const [filterName, setFilterName] = useState(filter?.name)
  const filterRef = useSyncRef(filter)
  const debouncedFilterName = useDebouncedValue(filterName, 500)
  useEffect(() => {
    if (debouncedFilterName?.length) {
      onFilterChange?.({ ...filterRef.current, name: debouncedFilterName })
    } else {
      onFilterChange?.({ ...filterRef.current, name: void 0 })
    }
  }, [filterRef, debouncedFilterName, onFilterChange])

  return (
    <Container maxW="container.xl">
      <Flex
        direction="row"
        py={5}
        wrap="wrap"
        justify={{ base: 'center', md: 'flex-start' }}
        align="center"
        sx={{ '&>*': { mx: 2.5, mb: 5 } }}
      >
        {appendChildren}
        <TokenFilters
          collection={collection}
          hideFilters={hideFilters}
          collectionWhitelist={collectionWhitelist}
          useSignalCollectionSelector={useSignalCollectionSelector}
          defaultValues={defaultFilter}
          onValueChange={onFilterChange}
          useOfferPrice={useOfferPrice}
        />
        <TokenSortor value={sortBy} onValueChange={onSortByChange} useSortOptions={useSortOptions} />
        <AppliedTokenSortor sortBy={sortBy} />
        <Input
          minW="300px"
          w="initial"
          flexGrow={1}
          bg="reaction"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
        />
        <Badge>
          <SkeletonText mr={1} noOfLines={1} isLoaded={!isLoading}>
            {totalCount.toLocaleString(locale)}
          </SkeletonText>
          Results
        </Badge>
      </Flex>
      <Stack direction="row" pb={10}>
        <AppliedTokenFilters
          hideFilters={hideFilters}
          collectionWhitelist={collectionWhitelist}
          value={filter}
          onValueChange={onFilterChange}
        />
      </Stack>
    </Container>
  )
}
