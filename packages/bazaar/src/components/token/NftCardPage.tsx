import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { Box, Flex, Grid, GridItem, GridProps, Spacer, Stack, Text } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/button'
import { Skeleton } from '@chakra-ui/skeleton'
import { useFetchTokensContext } from '@x/hooks'
import { useRouter } from 'next/router'
import SelectCategory from 'components/input/SelectCategory'
import SelectCollections from 'components/input/SelectCollections'
import SelectTokenSortBy from 'components/input/SelectTokenSortBy'
import SelectTokenStatus from 'components/input/SelectTokenStatus'
import SelectTokenType from 'components/input/SelectTokenType'
import NftCardList from './NftCardList'
import SwitchNftCardLayout, { NftCardLayout } from './SwitchNftCardLayout'
import { useSessionState } from '@x/hooks'
import React, { useEffect, useState, isValidElement } from 'react'
import { layout } from 'theme'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { getColor, transparentize } from '@chakra-ui/theme-tools'
import { useTheme } from '@chakra-ui/system'
import RemoveButton from 'components/RemoveButton'

export type Panel = 'chain' | 'type' | 'status' | 'category' | 'collections'

export interface NftCardPageProps extends GridProps {
  afterSortBy?: React.ReactNode
  hidePanels?: Panel[]
}

export default function NftCardPage({ afterSortBy, hidePanels = [], children, ...props }: NftCardPageProps) {
  const theme = useTheme()

  const { locale } = useRouter()

  const panelChildren = React.Children.toArray(children).filter(isValidElement).filter(isNftCardFilterPanelElement)

  const {
    from,
    setFrom,
    chainId,
    type,
    setType,
    filterBy,
    setFilterBy,
    category,
    setCategory,
    collections,
    setCollections,
    sortBy,
    setSortBy,
    tokens,
    total,
    isLoading,
    hasMore,
    batchSize,
    attrFilters,
    setAttrFilters,
  } = useFetchTokensContext()

  const [layoutType, setLayoutType] = useSessionState<NftCardLayout>('nft-card-layout', 'large')

  const isMobileView = useBreakpointValue({ base: true, sm: false })

  const [expended, setExpended] = useState<number | number[]>([])

  useEffect(() => {
    setExpended(isMobileView ? [] : [0])
  }, [isMobileView])

  function renderPanel(label: string, children: React.ReactNode) {
    return (
      <AccordionItem key={label}>
        {({ isExpanded }) => (
          <>
            <h4>
              <AccordionButton>
                <Text flex="1" textAlign="left">
                  {label}
                </Text>
                {isExpanded ? <FiMinus /> : <FiPlus />}
              </AccordionButton>
            </h4>
            <AccordionPanel>{children}</AccordionPanel>
          </>
        )}
      </AccordionItem>
    )
  }

  function renderRemoveFilterButtons() {
    const removeFilterBy = (item: string) => {
      const newList = filterBy.filter(val => val !== item)
      setFilterBy(newList)
    }

    const clearAll = () => {
      if (filterBy.length) setFilterBy([])
      if (attrFilters.length) setAttrFilters('clearAll', [], true)
    }

    const showClearAll = !!filterBy.length || !!attrFilters.length

    const removeAttrFilter = (attribute: string, value: string) => {
      for (const item of attrFilters) {
        if (item.name === attribute) {
          if (item.values.length === 1 && item.values[0] === value) return setAttrFilters(attribute, [])

          const filteredValues = item.values.filter(val => val !== value)

          return setAttrFilters(attribute, filteredValues)
        }
      }
    }

    return (
      <Flex mt={4} sx={{ gap: '16px' }} px={2} flexWrap="wrap">
        {filterBy.map(item => (
          <RemoveButton key={item} onClick={() => removeFilterBy(item)}>
            {item}
          </RemoveButton>
        ))}

        {attrFilters.map(item =>
          item.values.map(val => (
            <RemoveButton key={`${item.name}${val}`} onClick={() => removeAttrFilter(item.name, val)}>
              {item.name} {val}
            </RemoveButton>
          )),
        )}

        {showClearAll && (
          <Button variant="unstyled" color="primary" fontWeight="bold" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </Flex>
    )
  }

  return (
    <Grid
      templateRows="auto 1fr"
      templateColumns={{ sm: '300px 1fr' }}
      mx={layout.offsetPadding}
      pr={{ sm: 2 }}
      {...props}
    >
      <GridItem rowSpan={2}>
        <Accordion
          variant="compact"
          allowToggle
          allowMultiple
          index={expended}
          onChange={setExpended}
          position="sticky"
          top={layout.headerHeight}
          maxH={{ sm: `calc(100vh - ${layout.headerHeight})` }}
          overflowY="auto"
        >
          {!hidePanels.includes('type') && renderPanel('Type', <SelectTokenType value={type} onChange={setType} />)}
          {!hidePanels.includes('status') &&
            renderPanel('Status', <SelectTokenStatus value={filterBy} onChange={setFilterBy} />)}
          {!hidePanels.includes('category') &&
            renderPanel('Category', <SelectCategory value={category} onValueChange={setCategory} />)}
          {!hidePanels.includes('collections') &&
            renderPanel(
              'Collections',
              <SelectCollections chainId={chainId} value={collections} onChange={setCollections} />,
            )}
          {panelChildren.map(child => renderPanel(child.props.title, child.props.children))}
          <Box display={{ base: 'none', sm: 'block' }} h="320px" />
        </Accordion>
      </GridItem>
      <GridItem
        position="sticky"
        top="72px"
        py={2}
        zIndex={9}
        bg={transparentize(getColor(theme, 'background'), 0.7)(theme)}
      >
        <Stack direction={{ base: 'column', sm: 'row' }} alignItems="center">
          <Skeleton isLoaded={!isLoading} flexShrink={0}>
            <Text color="primary">{total.toLocaleString(locale)} results</Text>
          </Skeleton>
          <Spacer display={{ base: 'none', sm: 'block' }} />
          <FormControl display="flex" flexDirection="row" width="fit-content" alignItems="center">
            <FormLabel color="primary" flexShrink={0} marginY={0}>
              Sort by
            </FormLabel>
            <SelectTokenSortBy size="sm" value={sortBy} onValueChange={setSortBy} />
          </FormControl>
          <SwitchNftCardLayout value={layoutType} onValueChange={setLayoutType} />
          {afterSortBy}
        </Stack>

        {renderRemoveFilterButtons()}
      </GridItem>
      <GridItem
        overflowX="hidden" // to enforce list width
      >
        <NftCardList
          items={tokens}
          isLoading={isLoading}
          hasMore={hasMore}
          onMore={() => setFrom(from + batchSize)}
          layout={layoutType}
        />
      </GridItem>
    </Grid>
  )
}

export interface NftCardFilterPanelProps {
  title: string
  children: React.ReactNode
}

export function NftCardFilterPanel({ children }: NftCardFilterPanelProps) {
  return <>{children}</>
}

function isNftCardFilterPanelElement(
  elem: React.ReactElement,
): elem is React.ReactElement<NftCardFilterPanelProps, typeof NftCardFilterPanel> {
  return elem.type === NftCardFilterPanel
}
