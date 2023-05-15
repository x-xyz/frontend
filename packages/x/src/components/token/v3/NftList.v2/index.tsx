import ReactWindowScroller from 'components/ReactWindowScroller'
import NftCard from 'components/token/v3/NftCard'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import ResizeObserver from 'resize-observer-polyfill'

import { Button, Center, Container } from '@chakra-ui/react'
import { NftItem } from '@x/models'

const defaultCardWidth = 260
const cardGap = 40

interface ItemData {
  items: NftItem[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
}

export interface NftListProps {
  items?: NftItem[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export default function NftList({ items = [], isLoading, hasMore, onLoadMore }: NftListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  const cardWidth = useMemo(() => {
    if (!containerRect) return defaultCardWidth
    return Math.min(defaultCardWidth, containerRect.width - cardGap)
  }, [containerRect])

  const cardScale = useMemo(() => Math.min(1, cardWidth / defaultCardWidth), [cardWidth])

  const cardHeight = cardWidth * 1.77

  const columnWidth = cardWidth + cardGap

  const columnCount = useMemo(
    () => Math.floor((containerRect?.width || 0) / columnWidth) || 1,
    [containerRect, columnWidth],
  )

  const rowCount = useMemo(
    () => Math.ceil(items.length / columnCount) + (isLoading ? 1 : 0),
    [items, columnCount, isLoading],
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
    <Container px={`${containerPaddingX}px`} maxW={{ base: 'container.xl', '2xl': 'container.3xl' }} ref={containerRef}>
      <ReactWindowScroller isGrid>
        {scrollerProps => (
          <FixedSizeGrid<ItemData>
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowCount={rowCount}
            rowHeight={rowHeight}
            height={process.browser ? window.innerHeight : 0}
            width={process.browser ? window.innerWidth : 0}
            itemData={{ items, columnCount, isLoading, cardScale }}
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
      <Center pt={5} pb={15}>
        {hasMore && onLoadMore && (
          <Button isLoading={isLoading} disabled={isLoading} onClick={() => onLoadMore()}>
            Load More
          </Button>
        )}
      </Center>
    </Container>
  )
}

function Item({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading, cardScale } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      const nft = items[index]
      return <NftCard nft={nft} />
    }

    if (isLoading) {
      return <NftCard />
    }
  }

  return (
    <Center style={style} transform={`scale(${cardScale})`}>
      {render()}
    </Center>
  )
}
