import { Stack, Text } from '@chakra-ui/react'
import { TokenV2SortOption } from '@x/models'
import { useMemo } from 'react'
import { sortableOptions } from './TokenSortor.v2'

const optionsShouldShowWarning = [
  TokenV2SortOption.ListedAtDesc,
  TokenV2SortOption.SoldAtDesc,
  TokenV2SortOption.AuctionEndingSoon,
  TokenV2SortOption.PriceAsc,
  TokenV2SortOption.PriceDesc,
  TokenV2SortOption.LastSalePriceAsc,
  TokenV2SortOption.LastSalePriceDesc,
]

export interface AppliedTokenSortorProps {
  sortBy?: TokenV2SortOption
}

export default function AppliedTokenSortor({ sortBy }: AppliedTokenSortorProps) {
  const option = useMemo(() => sortableOptions.find(o => o.value === sortBy), [sortBy])
  const showWarning = useMemo(() => option && optionsShouldShowWarning.includes(option.value), [option])
  if (!option) return null
  return (
    <Stack justify="center" align={{ base: 'center', md: 'flex-start' }} fontSize="sm" fontWeight="bold" spacing={0}>
      <Text>{option.label}</Text>
      {showWarning && (
        <Text fontSize="sm" color="note">
          Sort results only show NFTs with a listed price on X Marketplace
        </Text>
      )}
    </Stack>
  )
}
