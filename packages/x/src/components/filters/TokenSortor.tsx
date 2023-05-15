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
import { TokenV2SortOption } from '@x/models'
import { tokensv2, useAppDispatch } from '@x/store'

export interface SortableOption {
  value: TokenV2SortOption
  label: string
}

export const sortableOptions: SortableOption[] = [
  { value: TokenV2SortOption.ListedAtDesc, label: 'Recently Listed' },
  { value: TokenV2SortOption.CreatedAtDesc, label: 'Recently Created' },
  { value: TokenV2SortOption.SoldAtDesc, label: 'Recently Sold' },
  // { value: TokenV2SortOption.AuctionEndingSoon, label: 'Auction Ending Soon' },
  { value: TokenV2SortOption.PriceAsc, label: 'Price: Low to High' },
  { value: TokenV2SortOption.PriceDesc, label: 'Price: High to Low' },
  { value: TokenV2SortOption.LastSalePriceAsc, label: 'Lowest Last Sale' },
  { value: TokenV2SortOption.LastSalePriceDesc, label: 'Highest Last Sale' },
  { value: TokenV2SortOption.ViewedDesc, label: 'Most Viewed' },
  { value: TokenV2SortOption.LikedDesc, label: 'Most Favorited' },
  { value: TokenV2SortOption.CreatedAtAsc, label: 'Oldest' },
]

export interface TokenSortorProps {
  id: string
}

export default function TokenSortor({ id }: TokenSortorProps) {
  const dispatch = useAppDispatch()

  function renderOption({ value, label }: SortableOption, onClose: () => void) {
    return (
      <ListItem key={value} py={1}>
        <Button
          variant="list-item"
          onClick={() => {
            dispatch(tokensv2.actions.setSortBy({ id, data: value }))
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
