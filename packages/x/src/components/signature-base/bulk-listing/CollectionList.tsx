import { InputLeftElement } from '@chakra-ui/input'
import AppliedCollectionSortor from 'components/filters/AppliedCollectionSortor.v2'
import CollectionSortor, { SortableOption } from 'components/filters/CollectionSortor.v2'
import { useEffect, useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useQuery } from 'react-query'

import { Box, Divider, Input, InputGroup, Stack, Text } from '@chakra-ui/react'
import { fetchCollections } from '@x/apis/fn'
import { Collection, CollectionSortOption } from '@x/models'

import CollectionCard from './CollectionCard'

const sortableOptions: SortableOption[] = [
  { value: CollectionSortOption.HoldingDesc, label: 'Most NFTs' },
  { value: CollectionSortOption.HoldingAsc, label: 'Least NFTs' },
  { value: CollectionSortOption.FloorPriceDesc, label: 'Highest Floor Price' },
  { value: CollectionSortOption.FloorPriceAsc, label: 'Lowest Floor Price' },
  { value: CollectionSortOption.NameAsc, label: 'Alphabetical Order' },
]

export interface CollectionListProps {
  account: string
  onCollectionSelected?: (collection?: Collection) => void
}

export default function CollectionList({ account, onCollectionSelected }: CollectionListProps) {
  const [collectionSortBy, setCollectionSortBy] = useState(CollectionSortOption.HoldingDesc)
  const [filterCollectionNameBy, setFilterCollectionNameBy] = useState('')
  const { data: collectionData = { items: [], count: 0 } } = useQuery(
    ['collections', { sortBy: collectionSortBy, holder: account }],
    fetchCollections,
  )
  const filteredCollections = useMemo(() => {
    let collections: Collection[]

    if (!filterCollectionNameBy) {
      collections = collectionData.items
    } else {
      collections = collectionData.items.filter(c =>
        c.collectionName.toLowerCase().includes(filterCollectionNameBy.toLowerCase()),
      )
    }

    return collections.filter(collection => collection.tokenType === 721)
  }, [filterCollectionNameBy, collectionData])
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(0)

  useEffect(() => {
    onCollectionSelected?.(filteredCollections[selectedCollectionIndex])
  }, [filteredCollections, selectedCollectionIndex, onCollectionSelected])

  return (
    <Stack spacing={0} bgColor="black" borderRadius="6px">
      <Text borderBottom="1px solid" borderColor="divider" fontWeight="bold" p={4}>
        Collection Approval
      </Text>
      <Stack spacing={6} p={4}>
        <Stack direction="row" align="center" spacing={5}>
          <CollectionSortor
            sortableOptions={sortableOptions}
            value={collectionSortBy}
            onValueChange={setCollectionSortBy}
          />
          <AppliedCollectionSortor sortBy={collectionSortBy} sortableOptions={sortableOptions} />
        </Stack>
        <InputGroup>
          <InputLeftElement>
            <FiSearch color="#A2A6B8" />
          </InputLeftElement>
          <Input
            bg="reaction"
            placeholder="Search Collection"
            value={filterCollectionNameBy}
            onChange={e => setFilterCollectionNameBy(e.target.value)}
          />
        </InputGroup>
        <Stack spacing="10px" divider={<Divider w="full" />}>
          {filteredCollections.map((collection, index) => (
            <CollectionCard
              key={`${collection.chainId}:${collection.erc721Address}`}
              collection={collection}
              owner={`${account}`}
              selected={selectedCollectionIndex === index}
              onClick={() => setSelectedCollectionIndex(index)}
              cursor="pointer"
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
