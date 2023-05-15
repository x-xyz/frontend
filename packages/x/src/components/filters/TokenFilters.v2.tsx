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
import { Category, ChainId, Collection, SearchTokenV2Params, TokenSaleType, TokenStatus } from '@x/models'
import { useForm } from 'react-hook-form'
import SelectTokenStatus from 'components/input/SelectTokenStatus'
import SelectCollections from 'components/input/SelectCollections'
import { keys } from 'lodash'
import { useMemo, useRef } from 'react'
import SelectCollection from 'components/input/SelectCollection'

export interface TokenFiltersProps {
  collection?: Collection
  hideFilters?: (keyof SearchTokenV2Params)[]
  collectionWhitelist?: { chainId: ChainId; contract: string }[]
  useSignalCollectionSelector?: boolean
  defaultValues?: SearchTokenV2Params
  onValueChange?: (value: SearchTokenV2Params) => void
  useOfferPrice?: boolean
}

export interface FormData {
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
    <Popover placement="bottom-start">
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
  onClose,
  collection,
  hideFilters = [],
  collectionWhitelist,
  useSignalCollectionSelector,
  defaultValues,
  onValueChange,
  useOfferPrice,
}: FormProps) {
  const { watch, setValue, reset, handleSubmit } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      // ...defaultValues,
      chainId: defaultValues?.chainId,
      saleType: defaultValues?.type,
      collections: defaultValues?.collections,
      tokenStatus: defaultValues?.status,
      category: defaultValues?.category ? (parseFloat(defaultValues.category) as Category) : Category.All,
      attrFilters: defaultValues?.attrFilters?.reduce(
        (acc, curr) => ({ ...acc, [curr.name]: curr.values }),
        {} as FormData['attrFilters'],
      ),
      priceRange: {
        priceCurrency: defaultValues?.priceGTE ? 'native' : 'usd',
        maxPrice: (useOfferPrice
          ? defaultValues?.offerPriceInUsdLTE
          : defaultValues?.priceGTE
          ? defaultValues?.priceLTE
          : defaultValues?.priceInUsdLTE
        )?.toString(),
        minPrice: (useOfferPrice
          ? defaultValues?.offerPriceInUsdGTE
          : defaultValues?.priceGTE
          ? defaultValues?.priceGTE
          : defaultValues?.priceInUsdGTE
        )?.toString(),
      },
    },
  })

  const currentChainId = watch('chainId')
  const currentCollections = watch('collections')

  const resetValues = useMemo<FormData>(
    () => ({
      chainId: hideFilters.includes('chainId') ? defaultValues?.chainId : void 0,
      saleType: hideFilters.includes('type') ? defaultValues?.type : void 0,
      collections: hideFilters.includes('collections') ? defaultValues?.collections : void 0,
      tokenStatus: hideFilters.includes('status') ? defaultValues?.status : void 0,
      category: hideFilters.includes('category')
        ? defaultValues?.category
          ? (parseFloat(defaultValues.category) as Category)
          : Category.All
        : void 0,
      attrFilters: hideFilters.includes('attrFilters')
        ? defaultValues?.attrFilters?.reduce(
            (acc, curr) => ({ ...acc, [curr.name]: curr.values }),
            {} as FormData['attrFilters'],
          )
        : void 0,
      priceRange: { priceCurrency: 'usd' },
    }),
    [
      hideFilters,
      defaultValues?.chainId,
      defaultValues?.type,
      defaultValues?.collections,
      defaultValues?.status,
      defaultValues?.category,
      defaultValues?.attrFilters,
    ],
  )

  const submit = handleSubmit(
    ({ chainId, saleType, collections, tokenStatus, category, attrFilters = {}, priceRange }) => {
      const value: SearchTokenV2Params = {}
      if (chainId) value.chainId = chainId
      if (saleType) value.type = saleType
      if (collections?.length) value.collections = collections
      if (tokenStatus) value.status = tokenStatus
      if (category && category !== Category.All) value.category = `${category}`
      if (Object.keys(attrFilters).length > 0)
        value.attrFilters = Object.keys(attrFilters).map(name => ({ name, values: attrFilters[name] }))
      if (useOfferPrice) {
        if (priceRange?.minPrice) value.offerPriceInUsdGTE = parseFloat(priceRange.minPrice)
        if (priceRange?.maxPrice) value.offerPriceInUsdLTE = parseFloat(priceRange.maxPrice)
      } else if (priceRange?.priceCurrency === 'native') {
        if (priceRange?.minPrice) value.priceGTE = parseFloat(priceRange.minPrice)
        if (priceRange?.maxPrice) value.priceLTE = parseFloat(priceRange.maxPrice)
      } else if (priceRange?.priceCurrency === 'usd') {
        if (priceRange?.minPrice) value.priceInUsdGTE = parseFloat(priceRange.minPrice)
        if (priceRange?.maxPrice) value.priceInUsdLTE = parseFloat(priceRange.maxPrice)
      }
      onValueChange?.(value)
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

  if (!hideFilters.includes('status')) {
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
              chainId={watch('chainId')}
              value={watch('collections')}
              onValueChange={v => {
                if (v.length === 0) {
                  setValue('collections', [])
                } else {
                  setValue('chainId', v[0].chainId)
                  setValue(
                    'collections',
                    v.map(o => o.address),
                  )
                }
              }}
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
            {useOfferPrice ? 'Offer Price' : 'Price'}
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
          usdOnly={useOfferPrice}
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
