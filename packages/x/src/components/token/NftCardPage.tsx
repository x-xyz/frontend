import SelectCategory from 'components/input/SelectCategory'
import SelectChainId from 'components/input/SelectChainId'
import SelectCollections from 'components/input/SelectCollections'
import SelectTokenSortBy from 'components/input/SelectTokenSortBy'
import SelectTokenStatus from 'components/input/SelectTokenStatus'
import { useRouter } from 'next/router'
import React, { isValidElement } from 'react'
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'
import { layout } from 'theme'

import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Grid, GridItem, GridProps, Spacer, Stack, Text } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from '@chakra-ui/modal'
import { Skeleton } from '@chakra-ui/skeleton'
import { useTheme } from '@chakra-ui/system'
import { getColor, transparentize } from '@chakra-ui/theme-tools'
import { LeftArrowIcon } from '@x/components/icons'
import { useFetchTokensContext, useSessionState } from '@x/hooks'

import NftCardList from './NftCardList'
import SwitchNftCardLayout, { NftCardLayout } from './SwitchNftCardLayout'

export type Panel = 'chain' | 'type' | 'status' | 'category' | 'collections'

export interface NftCardPageProps extends GridProps {
  afterSortBy?: React.ReactNode
  hidePanels?: Panel[]
  strewn?: boolean
}

export default function NftCardPage({ afterSortBy, hidePanels = [], strewn, children, ...props }: NftCardPageProps) {
  const theme = useTheme()

  const { locale } = useRouter()

  const panelChildren = React.Children.toArray(children).filter(isValidElement).filter(isNftCardFilterPanelElement)

  const {
    from,
    setFrom,
    chainId,
    setChainId,
    // type,
    // setType,
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
  } = useFetchTokensContext()

  const [layoutType, setLayoutType] = useSessionState<NftCardLayout>('nft-card-layout', 'large')

  const { isOpen, onOpen, onClose } = useDisclosure()

  function renderPanel(label: string, children: React.ReactNode) {
    return (
      <AccordionItem bg="background" borderRadius="4px" overflow="hidden" key={label}>
        {({ isExpanded }) => (
          <>
            <h4>
              <AccordionButton>
                <Text flex="1" textAlign="left" fontSize="sm">
                  {label}
                </Text>
                {isExpanded ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </AccordionButton>
            </h4>
            <AccordionPanel>{children}</AccordionPanel>
          </>
        )}
      </AccordionItem>
    )
  }

  function renderPanels() {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent
          containerProps={{ justifyContent: 'flex-start', ml: { sm: 24 } }}
          mt={{ sm: 48 }}
          maxW={{ sm: '320px' }}
        >
          <ModalHeader>
            {renderResultCount()}
            <ModalCloseButton as={LeftArrowIcon} transform="scale(0.6)" top={4} right={4} cursor="pointer" />
          </ModalHeader>
          <ModalBody>
            <Accordion allowToggle>
              <Stack spacing={2}>
                {!hidePanels.includes('chain') &&
                  renderPanel('Chain', <SelectChainId value={chainId} onValueChange={setChainId} />)}
                {/* <Heading as="h4" size="sm">Token Type</Heading> */}
                {/* <SelectTokenType value={type} onChange={setType} /> */}
                {!hidePanels.includes('status') &&
                  renderPanel('Status', <SelectTokenStatus value={filterBy} onChange={setFilterBy} />)}
                {!hidePanels.includes('category') &&
                  renderPanel('Categories', <SelectCategory value={category} onValueChange={setCategory} />)}
                {!hidePanels.includes('collections') &&
                  renderPanel(
                    'Collections',
                    <SelectCollections chainId={chainId} value={collections} onChange={setCollections} />,
                  )}
                {panelChildren.map(child => renderPanel(child.props.title, child.props.children))}
              </Stack>
            </Accordion>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  function renderPanelButton() {
    return (
      <Button variant="ghost" isActive={isOpen} onClick={onOpen}>
        Filter
      </Button>
    )
  }

  function renderResultCount() {
    return (
      <Skeleton isLoaded={!isLoading} flexShrink={0}>
        <Text color="primary">{total.toLocaleString(locale)} results</Text>
      </Skeleton>
    )
  }

  return (
    <Grid templateRows="auto 1fr" pr={{ sm: 2 }} {...props}>
      <GridItem
        position="sticky"
        top={layout.headerHeight}
        py={2}
        zIndex={9}
        bg={transparentize(getColor(theme, 'background'), 0.7)(theme)}
      >
        <Stack direction={{ base: 'column', sm: 'row' }} alignItems="center">
          {renderPanelButton()}
          {renderPanels()}
          <Spacer display={{ base: 'none', sm: 'block' }} />
          <FormControl display="flex" flexDirection="row" width="fit-content" alignItems="center">
            <FormLabel color="primary" flexShrink={0} marginY={0}>
              Sort by
            </FormLabel>
            <SelectTokenSortBy size="sm" value={sortBy} onValueChange={setSortBy} />
          </FormControl>
          <SwitchNftCardLayout
            value={layoutType}
            onValueChange={setLayoutType}
            display={{ base: 'none', sm: 'block' }}
          />
          {afterSortBy}
        </Stack>
      </GridItem>
      <GridItem
        overflow="hidden" // to enforce list width
      >
        <NftCardList
          items={tokens}
          isLoading={isLoading}
          hasMore={hasMore}
          onMore={() => setFrom(from + batchSize)}
          layout={layoutType}
          strewn={strewn}
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
