import Dropdown from 'components/Dropdown'

import { TriangleDownIcon } from '@chakra-ui/icons'
import { Button, ButtonProps, List } from '@chakra-ui/react'
import { TokenV2SortOption } from '@x/models'

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

export interface TokenSortorProps extends ButtonProps {
  value?: TokenV2SortOption
  onValueChange?: (value: TokenV2SortOption) => void
  buttonLabel?: React.ReactNode
}

export default function TokenSortor({ value: selectedValue, onValueChange, buttonLabel, ...props }: TokenSortorProps) {
  function renderOption({ value, label }: SortableOption, onClose: () => void) {
    return (
      <Dropdown.Item key={value} py={1}>
        <Button
          variant="list-item"
          w="full"
          justifyContent="flex-start"
          fontWeight="normal"
          onClick={() => {
            onValueChange?.(value)
            onClose()
          }}
          color={selectedValue === value ? 'primary' : 'white'}
        >
          {label}
        </Button>
      </Dropdown.Item>
    )
  }

  return (
    <Dropdown.List
      triggerElem={
        <Button variant="dropdown" fontWeight="normal" justifyContent="space-between" h="40px" px={3} {...props}>
          {buttonLabel ? (
            buttonLabel
          ) : (
            <>
              {sortableOptions.find(o => o.value === selectedValue)?.label || 'Sort By'}
              <TriangleDownIcon ml={2} w="10px" />
            </>
          )}
        </Button>
      }
      placement="bottom-end"
    >
      {({ onClose }) => sortableOptions.map(o => renderOption(o, onClose))}
    </Dropdown.List>
  )

  // return (
  //   <Popover placement="bottom-start">
  //     {({ onClose }) => (
  //       <>
  //         <PopoverTrigger></PopoverTrigger>
  //         <PopoverContent w="90vw" maxW="380px">
  //           <PopoverHeader h={8}>
  //             <Stack direction="row" h="full" align="center">
  //               <Text fontSize="xs">SORT BY</Text>
  //               <Spacer />
  //               <PopoverCloseButton pos="unset" />
  //             </Stack>
  //           </PopoverHeader>
  //           <PopoverBody>
  //             <List variant="ghost">{sortableOptions.map(o => renderOption(o, onClose))}</List>
  //           </PopoverBody>
  //           <PopoverFooter px={9} py={10}>
  //             <Button
  //               variant="outline"
  //               w="full"
  //               onClick={() => {
  //                 onValueChange?.(TokenV2SortOption.CreatedAtDesc)
  //                 onClose()
  //               }}
  //             >
  //               RESET
  //             </Button>
  //           </PopoverFooter>
  //         </PopoverContent>
  //       </>
  //     )}
  //   </Popover>
  // )
}
