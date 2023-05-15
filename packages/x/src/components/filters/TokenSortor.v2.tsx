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
import { TokenV2SortOption } from '@x/models'
import { useRef } from 'react'

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
  { value: TokenV2SortOption.OfferPriceAsc, label: 'Offer Price: Low to High' },
  { value: TokenV2SortOption.OfferPriceDesc, label: 'Offer Price: High to Low' },
  { value: TokenV2SortOption.OfferDeadlineAsc, label: 'Offer Expiring Soon' },
  { value: TokenV2SortOption.OfferCreatedDesc, label: 'Most Recent Offers' },
]

export interface TokenSortorProps {
  value?: TokenV2SortOption
  onValueChange?: (value: TokenV2SortOption) => void
  useSortOptions?: TokenV2SortOption[]
}

export default function TokenSortor({ value, onValueChange, useSortOptions }: TokenSortorProps) {
  const defaultValueRef = useRef(value)

  function renderOption({ value, label }: SortableOption, onClose: () => void) {
    return (
      <ListItem key={value} py={1}>
        <Button
          variant="list-item"
          onClick={() => {
            onValueChange?.(value)
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
              <List variant="ghost">
                {sortableOptions
                  .filter(option => !useSortOptions || useSortOptions.includes(option.value))
                  .map(o => renderOption(o, onClose))}
              </List>
            </PopoverBody>
            {defaultValueRef.current && (
              <PopoverFooter p={5}>
                <Button
                  variant="outline"
                  borderRadius="unset"
                  w="full"
                  onClick={() => {
                    defaultValueRef.current && onValueChange?.(defaultValueRef.current)
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
