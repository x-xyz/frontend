import { Center } from '@chakra-ui/react'
import { collections, useAppSelector } from '@x/store'
import { useMemo } from 'react'
import { sortableOptions } from './CollectionSortor'

export default function AppliedCollectionSortor() {
  const sortBy = useAppSelector(collections.selectors.sortBy)
  const label = useMemo(() => sortableOptions.find(o => o.value === sortBy)?.label, [sortBy])
  if (!label) return null
  return (
    <Center fontSize="sm" fontWeight="bold">
      {label}
    </Center>
  )
}
