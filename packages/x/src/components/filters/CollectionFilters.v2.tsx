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
} from '@chakra-ui/react'
import { TriangleDownIcon } from '@chakra-ui/icons'
import InputPriceRange, { PriceRange } from 'components/input/InputPriceRange'
import SelectChainId from 'components/input/SelectChainId'
import SelectCategory from 'components/input/SelectCategory'
import { Category, ChainId, SearchCollectionParams } from '@x/models'
import { useForm } from 'react-hook-form'
import { useMemo } from 'react'

export interface CollectionFiltersProps {
  hideFilters?: (keyof SearchCollectionParams)[]
  defaultValues?: SearchCollectionParams
  onValueChange?: (value: SearchCollectionParams) => void
}

interface FormData {
  chainId?: ChainId
  category?: Category
  priceRange?: PriceRange
}

export default function CollectionFilters(props: CollectionFiltersProps) {
  return (
    <Popover placement="bottom-start" isLazy>
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

interface FormProps extends CollectionFiltersProps {
  onClose: () => void
}

function Form({ onClose, hideFilters = [], defaultValues, onValueChange = () => void 0 }: FormProps) {
  const { watch, setValue, reset, handleSubmit } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      chainId: defaultValues?.chainId,
      category: defaultValues?.category === void 0 ? Category.All : defaultValues?.category,
      priceRange: {
        priceCurrency: defaultValues?.floorPriceGTE ? 'native' : 'usd',
        minPrice: defaultValues?.floorPriceGTE ? defaultValues?.floorPriceLTE : defaultValues?.usdFloorPriceLTE,
        maxPrice: defaultValues?.floorPriceGTE ? defaultValues?.floorPriceGTE : defaultValues?.usdFloorPriceGTE,
      },
    },
  })

  const resetValues = useMemo<FormData>(
    () => ({
      chainId: hideFilters.includes('chainId') ? defaultValues?.chainId : void 0,
      category: hideFilters.includes('category') ? defaultValues?.category : void 0,
      priceRange: { priceCurrency: 'usd' },
    }),
    [hideFilters, defaultValues?.chainId, defaultValues?.category],
  )

  const submit = handleSubmit(({ chainId, category, priceRange = {} }) => {
    const value: SearchCollectionParams = {}
    if (chainId) value.chainId = chainId
    if (category && category !== Category.All) value.category = category
    if (priceRange.priceCurrency === 'native') {
      if (priceRange.minPrice) value.floorPriceGTE = priceRange.minPrice
      if (priceRange.maxPrice) value.floorPriceLTE = priceRange.maxPrice
    } else if (priceRange.priceCurrency === 'usd') {
      if (priceRange.minPrice) value.usdFloorPriceGTE = priceRange.minPrice
      if (priceRange.maxPrice) value.usdFloorPriceLTE = priceRange.maxPrice
    }
    onValueChange(value)
    onClose()
  })

  return (
    <form onSubmit={submit}>
      <PopoverBody maxH="60vh" overflowY="auto">
        <Accordion allowMultiple allowToggle>
          {!hideFilters.includes('chainId') && (
            <AccordionItem>
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
            </AccordionItem>
          )}
          <AccordionItem>
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
          </AccordionItem>
          <AccordionItem>
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
          </AccordionItem>
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
