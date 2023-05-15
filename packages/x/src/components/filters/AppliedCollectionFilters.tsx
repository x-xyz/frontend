import { Badge, Button, CloseButton, Spacer, Stack, StackProps } from '@chakra-ui/react'
import { getChain } from '@x/constants'
import { Category, getCategoryName } from '@x/models'
import { collections, useAppDispatch, useAppSelector } from '@x/store'
import { useRouter } from 'next/router'

export default function AppliedCollectionFilters(props: StackProps) {
  const { locale } = useRouter()
  const dispatch = useAppDispatch()
  const chainId = useAppSelector(collections.selectors.chainId)
  const category = useAppSelector(collections.selectors.category)
  const priceCurrency = useAppSelector(collections.selectors.priceCurrency)
  const minPrice = useAppSelector(collections.selectors.minPrice)
  const maxPrice = useAppSelector(collections.selectors.maxPrice)
  const canClearFilters = !!chainId || (category !== void 0 && category !== Category.All) || !!minPrice || !!maxPrice

  const chain = chainId && getChain(chainId)

  return (
    <Stack direction="row" {...props}>
      {chain && (
        <Badge>
          {chain.name}
          <Spacer />
          <CloseButton onClick={() => dispatch(collections.actions.setChainId())} />
        </Badge>
      )}
      {category !== Category.All && category !== void 0 && (
        <Badge>
          {getCategoryName(category)}
          <Spacer />
          <CloseButton onClick={() => dispatch(collections.actions.setCategory())} />
        </Badge>
      )}
      {(minPrice || maxPrice) && (
        <Badge>
          {[
            `(${priceCurrency === 'native' ? chain?.nativeCurrency.symbol : 'USD'})`,
            minPrice ? parseFloat(minPrice).toLocaleString(locale) : '-',
            '-',
            maxPrice ? parseFloat(maxPrice).toLocaleString(locale) : '-',
          ].join(' ')}
          <Spacer />
          <CloseButton
            onClick={() => {
              dispatch(collections.actions.setPriceCurrency())
              dispatch(collections.actions.setMaxPrice())
              dispatch(collections.actions.setMinPrice())
            }}
          />
        </Badge>
      )}
      {canClearFilters && (
        <Button variant="badge" onClick={() => dispatch(collections.actions.clearFilters())}>
          Clear Filters
        </Button>
      )}
    </Stack>
  )
}
