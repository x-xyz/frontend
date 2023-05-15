import CollectionInfoPopover from 'components/CollectionInfoPopover'
import InputPriceRange, { PriceRange } from 'components/input/InputPriceRange'
import SelectCollection, { SelectCollectionProps } from 'components/input/SelectCollection'
import SelectCollections from 'components/input/SelectCollections'
import { builtInCollections } from 'configs'
import { keys } from 'lodash'
import { useState } from 'react'

import { Search2Icon } from '@chakra-ui/icons'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  CheckboxGroup,
  Divider,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Stack,
  StackProps,
  Switch,
  Text,
} from '@chakra-ui/react'
import { Category, ChainId, Collection, SearchTokenV2Params, TokenSaleType, TokenStatus } from '@x/models'
import CaretUp from '../icons/CaretUp'
import CaretDown from '../icons/CaretDown'

export interface TokenFiltersProps extends StackProps {
  collection?: Collection
  hideFilters?: (keyof SearchTokenV2Params)[]
  /**
   * @deprecated
   */
  collectionWhitelist?: { chainId: ChainId; contract: string }[]
  /**
   * @deprecated
   */
  useSignalCollectionSelector?: boolean
  value?: SearchTokenV2Params
  onValueChange?: (value: SearchTokenV2Params) => void
  components?: {
    SelectCollection?: React.JSXElementConstructor<SelectCollectionProps>
    custom?: React.ReactNode
  }
  /**
   * @deprecated
   */
  hideCollectionInfo?: boolean
  /**
   * @deprecated
   */
  hideTitle?: boolean
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
  name?: string
}

export default function TokenFilters({
  collection,
  hideFilters = ['chainId', 'category'],
  value,
  onValueChange,
  components = {},
  hideCollectionInfo,
  hideTitle,
  collectionWhitelist,
  useSignalCollectionSelector,
  ...props
}: TokenFiltersProps) {
  function renderStatus() {
    return (
      <FormControl>
        <Switch
          fontWeight="500"
          w="full"
          h="60px"
          isChecked={!!value?.status?.includes(TokenStatus.BuyNow)}
          onChange={e => {
            let status = value?.status || []
            status = status.filter(v => v !== TokenStatus.BuyNow)
            if (e.target.checked) status.push(TokenStatus.BuyNow)
            onValueChange?.({ ...value, status })
          }}
        >
          Buy Now
        </Switch>
        <Switch
          fontWeight="500"
          w="full"
          h="60px"
          isChecked={!!value?.status?.includes(TokenStatus.HasOffer)}
          onChange={e => {
            let status = value?.status || []
            status = status.filter(v => v !== TokenStatus.HasOffer)
            if (e.target.checked) status.push(TokenStatus.HasOffer)
            onValueChange?.({ ...value, status })
          }}
        >
          Offer
        </Switch>
      </FormControl>
    )
  }

  function renderInputPrice() {
    return (
      <FormControl py="14px">
        <FormLabel fontWeight="500">Price</FormLabel>
        <InputPriceRange
          chainId={value?.chainId}
          value={{
            priceCurrency: value?.priceGTE || value?.priceLTE ? 'native' : 'usd',
            maxPrice: (value?.priceLTE || value?.priceInUsdLTE)?.toString(),
            minPrice: (value?.priceGTE || value?.priceInUsdGTE)?.toString(),
          }}
          onValueChange={v =>
            onValueChange?.({
              ...value,
              priceGTE: v.priceCurrency === 'native' && v.minPrice ? parseFloat(v.minPrice) : void 0,
              priceLTE: v.priceCurrency === 'native' && v.maxPrice ? parseFloat(v.maxPrice) : void 0,
              priceInUsdGTE: v.priceCurrency === 'usd' && v.minPrice ? parseFloat(v.minPrice) : void 0,
              priceInUsdLTE: v.priceCurrency === 'usd' && v.maxPrice ? parseFloat(v.maxPrice) : void 0,
            })
          }
        />
      </FormControl>
    )
  }

  function renderAttrFilters() {
    if (!collection) return
    return renderTraitFilters(collection)
  }

  function renderTraitFilters(collection: Collection) {
    if (!collection.attributes) return null

    const traitTypes = keys(collection.attributes)

    if (traitTypes.length === 0) return null

    // sort type in alphabeta
    return (
      <Accordion allowToggle>{traitTypes.sort().map(traitType => renderTraitFilter(collection, traitType))}</Accordion>
    )
  }

  function renderTraitFilter({ attributes = {} }: Collection, name: string) {
    const traitValues = keys(attributes[name])
      // sort by number of count
      .sort((a, b) => attributes[name]?.[a] - attributes[name]?.[b])
      .slice(0, 100)
    const selecteds = value?.attrFilters?.find(af => af.name === name)?.values || []

    return (
      <TraitFilter
        key={name}
        traitType={name}
        traitValues={traitValues}
        traitValueCounts={attributes[name] || {}}
        selecteds={selecteds}
        onChange={values => {
          const prev = value?.attrFilters || []
          const index = prev.findIndex(af => af.name === name)
          const attrFilters = [...prev.slice(0, index), ...prev.slice(index + 1), { name, values }]
          onValueChange?.({ ...value, attrFilters })
        }}
      />
    )
  }

  return (
    <Stack w="full" bg="panel" divider={<Divider />} spacing={0} py={0} sx={{ '&>*:not(hr)': { px: 4 } }} {...props}>
      {!hideFilters.includes('status') && renderStatus()}
      {!hideFilters.some(filter => filter.includes('price')) && renderInputPrice()}
      {!hideFilters.includes('attrFilters') && renderAttrFilters()}
      {components.custom}
    </Stack>
  )
}

interface TraitFilterProps {
  traitType: string
  traitValues: string[]
  traitValueCounts: Record<string, number>
  selecteds: string[]
  onChange: (value: string[]) => void
}

function TraitFilter({ traitType, traitValues, traitValueCounts, selecteds, onChange }: TraitFilterProps) {
  const [search, setSearch] = useState('')
  return (
    <AccordionItem>
      {({ isExpanded }) => (
        <>
          <AccordionButton h="60px">
            <Stack direction="row" w="full" align="center">
              <Text fontWeight="500">{traitType}</Text>
              <Spacer />
              <Text color="value" fontSize="sm" fontWeight="normal">
                {traitValues.length}
              </Text>
              {isExpanded ? <CaretUp /> : <CaretDown />}
            </Stack>
          </AccordionButton>
          <AccordionPanel px={0}>
            <InputGroup mb={5}>
              <InputLeftElement>
                <Search2Icon color="divider" />
              </InputLeftElement>
              <Input placeholder="Filter" value={search} onChange={e => setSearch(e.target.value)} />
            </InputGroup>
            <CheckboxGroup value={selecteds} onChange={v => onChange(v.map(String))}>
              <Stack>
                {traitValues
                  .map(traitValue => ({
                    traitValue,
                    label: traitValue.replace(/"/g, '').replace(/-/g, ' ') || '<empty>',
                  }))
                  .filter(({ label }) => !search || label.toLowerCase().includes(search.toLowerCase()))
                  .map(({ traitValue, label }) => (
                    <Checkbox
                      key={`${traitType}-${traitValue}`}
                      value={traitValue}
                      sx={{
                        '.chakra-checkbox__label': { w: 'full', marginStart: '0', marginEnd: 2 },
                        flexDir: 'row-reverse',
                      }}
                    >
                      <Stack direction="row" w="full" align="center" h="9">
                        <Text textTransform="capitalize">{label || '<empty>'}</Text>
                        <Spacer />
                        <Text color="value" fontWeight="normal">
                          {traitValueCounts[traitValue] || 0}
                        </Text>
                      </Stack>
                    </Checkbox>
                  ))}
              </Stack>
            </CheckboxGroup>
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  )
}
