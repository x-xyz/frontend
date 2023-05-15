import CollectionCard from 'components/collection/v3/CollectionCard'
import AppliedCollectionFilters from 'components/filters/AppliedCollectionFilters'
import AppliedCollectionSortor from 'components/filters/AppliedCollectionSortor'
import CollectionFilters from 'components/filters/CollectionFilters'
import CollectionSortor from 'components/filters/CollectionSortor'
import Layout from 'components/Layout/v3'
import ReactWindowScroller from 'components/ReactWindowScroller'
import Header from 'components/wagmi-3/Header'
import Navbar from 'components/wagmi-3/Navbar'
import TopBanner from 'components/wagmi-3/TopBanner'
import * as wagmi3 from 'configs/wagmi-3'
import { isFeatureEnabled } from 'flags'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'

import { Badge, Box, Center, Container, Flex, SkeletonText, Stack } from '@chakra-ui/react'
import { useCollections } from '@x/hooks'
import { ChainId, Collection } from '@x/models'

const cardGap = 40

interface ItemData {
  items: Collection[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
}

const wagmi3CollectionAddresses = wagmi3.collections.reduce(
  (obj, c) => ({ ...obj, [c.contract]: true }),
  {} as Record<string, boolean>,
)

export default function Collections() {
  const { data, isLoading } = useCollections({ defaultChainId: ChainId.Ethereum })

  const collections = useMemo(() => (data?.data || []).filter(c => wagmi3CollectionAddresses[c.erc721Address]), [data])

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  const cardWidth = useMemo(() => {
    const defaultWidth = 360
    if (!containerRect) return defaultWidth
    return Math.min(defaultWidth, containerRect.width - cardGap)
  }, [containerRect])

  const cardScale = useMemo(() => Math.min(1, cardWidth / 360), [cardWidth])

  const cardHeight = cardWidth * 1.94

  const columnWidth = cardWidth + cardGap

  const columnCount = useMemo(
    () => Math.floor((containerRect?.width || 0) / columnWidth) || 1,
    [containerRect, columnWidth],
  )

  const rowCount = useMemo(
    () => Math.ceil(collections.length / columnCount) + (isLoading ? 1 : 0),
    [collections, columnCount, isLoading],
  )

  const rowHeight = cardHeight + cardGap

  const containerPaddingX = ((containerRect?.width || 0) - columnWidth * columnCount) / 2

  useEffect(() => {
    const resize = throttle(() => {
      if (!containerRef.current) return
      setContainerRect(containerRef.current.getBoundingClientRect())
    }, 10)

    if (!containerRef.current) return

    resize()

    const observer = new ResizeObserver(resize)

    observer.observe(containerRef.current)

    return () => {
      resize.cancel()
      observer.disconnect()
    }
  }, [])

  return (
    <Layout components={{ Header }}>
      <TopBanner />
      <Box h={10} />
      <Navbar />
      <Center>
        <Container maxW="container.xl">
          <Flex direction="row" py={5} wrap="wrap" justify="center" sx={{ '&>*': { mx: 2.5, mb: 5 } }}>
            <CollectionFilters hideFilters={['chainId']} />
            {isFeatureEnabled('collections-sortor') && (
              <>
                <CollectionSortor />
                <AppliedCollectionSortor />
              </>
            )}
            <Badge>
              <SkeletonText mr={1} noOfLines={1} isLoaded={!isLoading}>
                {collections.length}
              </SkeletonText>
              Results
            </Badge>
          </Flex>
          <Stack direction="row" pb={10}>
            <AppliedCollectionFilters />
          </Stack>
        </Container>
      </Center>
      <Center>
        <Container px={containerPaddingX} maxW={{ base: 'container.xl', '2xl': 'container.2xl' }} ref={containerRef}>
          <ReactWindowScroller isGrid>
            {scrollerProps => (
              <FixedSizeGrid<ItemData>
                columnCount={columnCount}
                columnWidth={columnWidth}
                rowCount={rowCount}
                rowHeight={rowHeight}
                height={process.browser ? window.innerHeight : 0}
                width={process.browser ? window.innerWidth : 0}
                itemData={{ items: collections, columnCount, isLoading, cardScale }}
                overscanRowCount={4}
                {...scrollerProps}
                style={{
                  ...scrollerProps.style,
                  overflow: 'hidden',
                  boxSizing: 'content-box',
                }}
              >
                {Item}
              </FixedSizeGrid>
            )}
          </ReactWindowScroller>
          <Box h={5} />
        </Container>
      </Center>
    </Layout>
  )
}

function Item({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading, cardScale } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      return <CollectionCard collection={items[index]} />
    }

    if (isLoading) {
      return <CollectionCard />
    }
  }

  return (
    <Center style={style} transform={`scale(${cardScale})`}>
      {render()}
    </Center>
  )
}
