import AppliedCollectionSortor from 'components/filters/AppliedCollectionSortor'
import CollectionSortor, { SortableOption } from 'components/filters/CollectionSortor'
import { useEffect, useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useQuery } from 'react-query'

import { Divider, Input, InputGroup, InputRightElement, Stack, Text } from '@chakra-ui/react'
import { fetchCollections } from '@x/apis/fn'
import { Collection, CollectionSortOption } from '@x/models'

import CollectionCard from './CollectionCard'
import { builtInCollections } from 'configs'
import { compareAddress } from '@x/utils/dist'

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
    let collections: Collection[] = collectionData.items.filter(c =>
      builtInCollections.some(bc => c.chainId === bc.chainId && compareAddress(c.erc721Address, bc.address)),
    )

    if (filterCollectionNameBy) {
      collections = collections.filter(c =>
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
    <Stack spacing={5}>
      <Text color="note">
        To begin listing, you will first need to approve the collection(s). There will be a one-time gas fee for each
        approved collection.
      </Text>
      <Stack direction="row" align="center" spacing={5}>
        <CollectionSortor
          sortableOptions={sortableOptions}
          value={collectionSortBy}
          onValueChange={setCollectionSortBy}
        />
        <AppliedCollectionSortor sortBy={collectionSortBy} sortableOptions={sortableOptions} />
      </Stack>
      <InputGroup>
        <Input
          bg="reaction"
          placeholder="Search Collection"
          value={filterCollectionNameBy}
          onChange={e => setFilterCollectionNameBy(e.target.value)}
        />
        <InputRightElement>
          <FiSearch color="#A2A6B8" />
        </InputRightElement>
      </InputGroup>
      <Divider />
      <Stack spacing="10px">
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
  )
}
