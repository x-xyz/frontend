import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  Button,
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CollectionSortOption } from '@x/models'
import { collections, useAppDispatch } from '@x/store'

export interface SortableOption {
  value: CollectionSortOption
  label: string
}

export const sortableOptions: SortableOption[] = [
  { value: CollectionSortOption.ListedAtDesc, label: 'Recently Listed' },
  { value: CollectionSortOption.CreatedAtDesc, label: 'Recently Created' },
  { value: CollectionSortOption.SoldAtDesc, label: 'Recently Sold' },
  { value: CollectionSortOption.FloorPriceAsc, label: 'Price: Low to High' },
  { value: CollectionSortOption.FloorPriceDesc, label: 'Price: High to Low' },
  { value: CollectionSortOption.ViewedDesc, label: 'Most Viewed' },
  { value: CollectionSortOption.LikedDesc, label: 'Most Favorited' },
  { value: CollectionSortOption.CreatedAtAsc, label: 'Oldest' },
]

export default function CollectionSortor() {
  const dispatch = useAppDispatch()

  function renderOption({ value, label }: SortableOption, onClose: () => void) {
    return (
      <ListItem key={value} py={1}>
        <Button
          variant="list-item"
          onClick={() => {
            dispatch(collections.actions.setSortBy(value))
            onClose()
          }}
        >
          {label}
        </Button>
      </ListItem>
    )
  }

  return (
    <Popover placement="bottom-start">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button>
              Sorting
              <TriangleDownIcon pos="relative" left={4} w={2} color="primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent w="90vw" maxW="380px">
            <PopoverHeader h="60px">
              <Stack direction="row" h="full" align="center">
                <Text fontSize="lg" variant="emphasis">
                  Sort by
                </Text>
                <Spacer />
                <PopoverCloseButton pos="unset" />
              </Stack>
            </PopoverHeader>
            <PopoverBody>
              <List variant="ghost">{sortableOptions.map(o => renderOption(o, onClose))}</List>
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
