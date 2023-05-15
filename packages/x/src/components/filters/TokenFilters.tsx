import {
  Button,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Spacer,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  CheckboxGroup,
  Checkbox,
} from '@chakra-ui/react'
import { TriangleDownIcon } from '@chakra-ui/icons'
import InputPriceRange, { PriceRange } from 'components/input/InputPriceRange'
import SelectChainId from 'components/input/SelectChainId'
import SelectCategory from 'components/input/SelectCategory'
import { useAppDispatch, tokensv2, useAppSelector } from '@x/store'
import { Category, ChainId, Collection, TokenSaleType, TokenStatus } from '@x/models'
import { useForm } from 'react-hook-form'
import SelectTokenStatus from 'components/input/SelectTokenStatus'
import SelectCollections from 'components/input/SelectCollections'
import { keys } from 'lodash'
import { useMemo, useRef } from 'react'
import SelectCollection from 'components/input/SelectCollection'

export interface TokenFiltersProps {
  id: string
  collection?: Collection
  hideFilters?: (keyof typeof tokensv2.selectors)[]
  collectionWhitelist?: { chainId: ChainId; contract: string }[]
  useSignalCollectionSelector?: boolean
}

interface FormData {
  chainId?: ChainId
  saleType?: TokenSaleType
  collections?: string[]
  tokenStatus?: TokenStatus[]
  category?: Category
  // traitType -> traitValue[]
  attrFilters?: Record<string, string[]>
  priceRange?: PriceRange
}

export default function TokenFilters(props: TokenFiltersProps) {
  return (
    <Popover placement="bottom-start" isLazy lazyBehavior="unmount">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button>
              Filters
              <TriangleDownIcon pos="relative" left={4} w={2} color="primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent w="90vw" maxW="380px">
            <PopoverHeader h="60px">
              <Stack direction="row" h="full" align="center">
                <Text fontSize="lg" variant="emphasis">
                  Filters
                </Text>
                <Spacer />
                <PopoverCloseButton pos="unset" />
              </Stack>
            </PopoverHeader>
            <Form onClose={onClose} {...props} />
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

interface FormProps extends TokenFiltersProps {
  onClose: () => void
}

function Form({
  id,
  onClose,
  collection,
  hideFilters = [],
  collectionWhitelist,
  useSignalCollectionSelector,
}: FormProps) {
  const dispatch = useAppDispatch()

  const defaultChainId = useAppSelector(tokensv2.selectors.chainId(id))
  const defaultSaleType = useAppSelector(tokensv2.selectors.type(id))
  const defaultCollections = useAppSelector(tokensv2.selectors.collections(id))
  const defaultTokenStatus = useAppSelector(tokensv2.selectors.filterBy(id))
  const defaultCategory = useAppSelector(tokensv2.selectors.category(id))
  const defaultAttrFilters = useAppSelector(tokensv2.selectors.attrFilters(id))
  const defaultPriceGTE = useAppSelector(tokensv2.selectors.priceGTE(id))
  const defaultPriceLTE = useAppSelector(tokensv2.selectors.priceLTE(id))
  const defaultPriceInUsdGTE = useAppSelector(tokensv2.selectors.priceInUsdGTE(id))
  const defaultPriceInUsdLTE = useAppSelector(tokensv2.selectors.priceInUsdLTE(id))
  const defaultPriceCurrency = typeof defaultPriceInUsdGTE === 'number' ? 'usd' : 'native'

  const { watch, setValue, reset, handleSubmit } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      chainId: defaultChainId,
      saleType: defaultSaleType,
      collections: defaultCollections,
      tokenStatus: defaultTokenStatus,
      category: defaultCategory,
      attrFilters: defaultAttrFilters.reduce(
        (acc, curr) => ({ ...acc, [curr.name]: curr.values }),
        {} as FormData['attrFilters'],
      ),
      priceRange: {
        priceCurrency: defaultPriceCurrency,
        maxPrice: defaultPriceCurrency === 'native' ? defaultPriceLTE?.toString() : defaultPriceInUsdLTE?.toString(),
        minPrice: defaultPriceCurrency === 'native' ? defaultPriceGTE?.toString() : defaultPriceInUsdGTE?.toString(),
      },
    },
  })

  const currentChainId = watch('chainId')
  const currentCollections = watch('collections')

  const resetValues = useMemo<FormData>(
    () => ({
      chainId: hideFilters.includes('chainId') ? defaultChainId : void 0,
      saleType: hideFilters.includes('type') ? defaultSaleType : void 0,
      collections: hideFilters.includes('collections') ? defaultCollections : void 0,
      tokenStatus: hideFilters.includes('filterBy') ? defaultTokenStatus : void 0,
      category: hideFilters.includes('category') ? defaultCategory : void 0,
      attrFilters: hideFilters.includes('attrFilters')
        ? defaultAttrFilters.reduce(
            (acc, curr) => ({ ...acc, [curr.name]: curr.values }),
            {} as FormData['attrFilters'],
          )
        : void 0,
      priceRange: { priceCurrency: 'usd' },
    }),
    [
      hideFilters,
      defaultChainId,
      defaultSaleType,
      defaultCollections,
      defaultTokenStatus,
      defaultCategory,
      defaultAttrFilters,
    ],
  )

  const submit = handleSubmit(
    ({ chainId, saleType, collections, tokenStatus, category, attrFilters = {}, priceRange }) => {
      if (!hideFilters.includes('chainId')) dispatch(tokensv2.actions.setChainId({ id, data: chainId }))
      if (!hideFilters.includes('type')) dispatch(tokensv2.actions.setType({ id, data: saleType || 'all' }))
      if (!hideFilters.includes('collections'))
        dispatch(tokensv2.actions.setCollections({ id, data: collections || [] }))
      if (!hideFilters.includes('filterBy')) dispatch(tokensv2.actions.setFilterBy({ id, data: tokenStatus || [] }))
      if (!hideFilters.includes('category'))
        dispatch(tokensv2.actions.setCategory({ id, data: category || Category.All }))
      if (!hideFilters.includes('attrFilters'))
        dispatch(
          tokensv2.actions.setAttrFilters({
            id,
            data: keys(attrFilters).map(name => ({ name, values: attrFilters[name] })),
          }),
        )

      if (priceRange) {
        const { priceCurrency } = priceRange
        let maxPrice = priceRange.maxPrice ? parseFloat(priceRange.maxPrice) : void 0
        let minPrice = priceRange.minPrice ? parseFloat(priceRange.minPrice) : void 0
        if (maxPrice && isNaN(maxPrice)) maxPrice = void 0
        if (minPrice && isNaN(minPrice)) minPrice = void 0
        if (priceCurrency === 'native') {
          dispatch(tokensv2.actions.setPriceLTE({ id, data: maxPrice }))
          dispatch(tokensv2.actions.setPriceGTE({ id, data: minPrice }))
          dispatch(tokensv2.actions.setPriceInUsdLTE({ id, data: void 0 }))
          dispatch(tokensv2.actions.setPriceInUsdGTE({ id, data: void 0 }))
        } else {
          dispatch(tokensv2.actions.setPriceLTE({ id, data: void 0 }))
          dispatch(tokensv2.actions.setPriceGTE({ id, data: void 0 }))
          dispatch(tokensv2.actions.setPriceInUsdLTE({ id, data: maxPrice }))
          dispatch(tokensv2.actions.setPriceInUsdGTE({ id, data: minPrice }))
        }
      }

      onClose()
    },
  )

  function renderTraitFilters(collection: Collection) {
    if (!collection.attributes) return null

    const traitTypes = keys(collection.attributes)

    if (traitTypes.length === 0) return null

    // sort type in alphabeta
    return traitTypes.sort().map(traitType => renderTraitFilter(collection, traitType))
  }

  function renderTraitFilter({ attributes = {} }: Collection, traitType: string) {
    const traitValues = keys(attributes[traitType])
      // sort by number of count
      .sort((a, b) => attributes[traitType]?.[a] - attributes[traitType]?.[b])
      .slice(0, 100)
    const selecteds = watch('attrFilters')?.[traitType] || []

    return (
      <AccordionItem key={traitType}>
        <AccordionButton pl={8}>
          <Stack direction="row" w="full" align="center">
            <Text fontSize="xs" fontWeight="bold" color="note">
              {traitType}
            </Text>
            <Spacer />
            <Text color="value" fontSize="sm" fontWeight="normal">
              {traitValues.length}
            </Text>
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel>
          <CheckboxGroup
            value={selecteds}
            onChange={v => setValue('attrFilters', { ...watch('attrFilters'), [traitType]: v.map(String) })}
          >
            <Stack>
              {traitValues.map(traitValue => (
                <Checkbox key={`${traitType}-${traitValue}`} value={traitValue}>
                  <Stack direction="row" w="full" align="center" fontSize="sm">
                    <Text textTransform="capitalize">
                      {traitValue.replace(/"/g, '').replace(/-/g, ' ') || '<empty>'}
                    </Text>
                    <Spacer />
                    <Text color="value" fontWeight="normal">
                      {attributes[traitType]?.[traitValue] || 0}
                    </Text>
                  </Stack>
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </AccordionPanel>
      </AccordionItem>
    )
  }

  const panels: React.ReactNode[] = []
  const defaultIndexRef = useRef<number[]>([])

  if (!hideFilters.includes('chainId')) {
    panels.push(
      <AccordionItem key="chain-id-panel">
        <AccordionButton>
          <Stack direction="row" w="full" align="center">
            <Text fontSize="xs" fontWeight="bold" color="note">
              Blockchain
            </Text>
            <Spacer />
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel>
          <SelectChainId value={watch('chainId')} onValueChange={v => setValue('chainId', v)} />
        </AccordionPanel>
      </AccordionItem>,
    )
  }

  if (!hideFilters.includes('type')) {
    const index =
      panels.push(
        <AccordionItem key="type-panel" defaultChecked>
          <AccordionButton>
            <Stack direction="row" w="full" align="center">
              <Text fontSize="xs" fontWeight="bold" color="note">
                Sale Type
              </Text>
              <Spacer />
              <AccordionIcon />
            </Stack>
          </AccordionButton>
          <AccordionPanel>
            <SelectTokenStatus
              value={watch('tokenStatus')}
              onChange={v => setValue('tokenStatus', v)}
              hideOptions={[TokenStatus.HasBid, TokenStatus.HasOffer, TokenStatus.HasTraded]}
            />
          </AccordionPanel>
        </AccordionItem>,
      ) - 1

    // open this panel by default
    defaultIndexRef.current = [index]
  }

  if (!hideFilters.includes('category')) {
    panels.push(
      <AccordionItem key="category-panel">
        <AccordionButton>
          <Stack direction="row" w="full" align="center">
            <Text fontSize="xs" fontWeight="bold" color="note">
              Category
            </Text>
            <Spacer />
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel>
          <SelectCategory value={watch('category')} onValueChange={v => setValue('category', v)} />
        </AccordionPanel>
      </AccordionItem>,
    )
  }

  if (!hideFilters.includes('collections')) {
    panels.push(
      <AccordionItem key="collections-panel">
        <AccordionButton>
          <Stack direction="row" w="full" align="center">
            <Text fontSize="xs" fontWeight="bold" color="note">
              Collections
            </Text>
            <Spacer />
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel>
          {useSignalCollectionSelector ? (
            <SelectCollection
              value={
                currentChainId && currentCollections?.length === 1
                  ? {
                      chainId: currentChainId,
                      contractAddress: currentCollections[0],
                    }
                  : void 0
              }
              onChange={v => {
                setValue('chainId', v?.chainId)
                setValue('collections', v?.contractAddress ? [v.contractAddress] : [])
              }}
              optionWhitelist={collectionWhitelist}
            />
          ) : (
            <SelectCollections
              value={watch('collections')}
              onChange={v => setValue('collections', v)}
              optionWhitelist={collectionWhitelist}
            />
          )}
        </AccordionPanel>
      </AccordionItem>,
    )
  }

  panels.push(
    <AccordionItem key="price-range-panel">
      <AccordionButton>
        <Stack direction="row" w="full" align="center">
          <Text fontSize="xs" fontWeight="bold" color="note">
            Price
          </Text>
          <Spacer />
          <AccordionIcon />
        </Stack>
      </AccordionButton>
      <AccordionPanel>
        <InputPriceRange
          chainId={watch('chainId')}
          value={watch('priceRange')}
          onValueChange={v => setValue('priceRange', v)}
        />
      </AccordionPanel>
    </AccordionItem>,
  )

  if (!hideFilters.includes('attrFilters') && collection) {
    panels.push(
      <AccordionItem key="trait-panel">
        <AccordionButton>
          <Stack direction="row" w="full" align="center">
            <Text>Properties</Text>
            <Spacer />
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel p={0}>{renderTraitFilters(collection)}</AccordionPanel>
      </AccordionItem>,
    )
  }

  return (
    <form onSubmit={submit}>
      <PopoverBody maxH="60vh" overflowY="auto">
        <Accordion allowMultiple allowToggle defaultIndex={defaultIndexRef.current}>
          {panels}
        </Accordion>
      </PopoverBody>
      <PopoverFooter>
        <Stack px={8} py={4}>
          <Button type="submit" w="full">
            Apply
          </Button>
          <Button type="reset" w="full" onClick={() => reset(resetValues)}>
            Reset All
          </Button>
        </Stack>
      </PopoverFooter>
    </form>
  )
}
