import { useMemo } from 'react'

import { Center } from '@chakra-ui/react'
import { CollectionSortOption } from '@x/models/dist'

import { sortableOptions, SortableOption } from './CollectionSortor'

export interface AppliedCollectionSortorProps {
  sortBy?: CollectionSortOption
  sortableOptions?: SortableOption[]
}

export default function AppliedCollectionSortor({
  sortBy,
  sortableOptions: options = sortableOptions,
}: AppliedCollectionSortorProps) {
  const label = useMemo(() => options.find(o => o.value === sortBy)?.label, [sortBy, options])
  if (!label) return null
  return <Center fontSize="sm">{label}</Center>
}
