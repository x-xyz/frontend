import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  Button,
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CollectionSortOption } from '@x/models'
import { useRef } from 'react'

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

export interface CollectionSortorProps {
  value?: CollectionSortOption
  onValueChange?: (value: CollectionSortOption) => void
  sortableOptions?: SortableOption[]
}

export default function CollectionSortor({
  onValueChange = () => void 0,
  value,
  sortableOptions: options = sortableOptions,
}: CollectionSortorProps) {
  const defaultValueRef = useRef(value)

  function renderOption({ value, label }: SortableOption, onClose: () => void) {
    return (
      <ListItem key={value} py={1}>
        <Button
          variant="list-item"
          onClick={() => {
            onValueChange(value)
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
            <Button variant="outline" color="primary">
              Sorting
              <TriangleDownIcon pos="relative" left={2} w={2} color="primary" />
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
              <List variant="ghost">{options.map(o => renderOption(o, onClose))}</List>
            </PopoverBody>
            {defaultValueRef.current && (
              <PopoverFooter p={5}>
                <Button
                  variant="outline"
                  borderRadius="unset"
                  w="full"
                  onClick={() => {
                    defaultValueRef.current && onValueChange(defaultValueRef.current)
                    onClose()
                  }}
                >
                  RESET
                </Button>
              </PopoverFooter>
            )}
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
