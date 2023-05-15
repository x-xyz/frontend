import ReactWindowScroller from 'components/ReactWindowScroller'
import NftCard from 'components/token/NftCard'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import ResizeObserver from 'resize-observer-polyfill'

import { Button, Center, Container, ContainerProps } from '@chakra-ui/react'
import { NftItem } from '@x/models'

const defaultCardWidth = 232

interface ItemData {
  items: NftItem[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
}

export interface NftListProps extends ContainerProps {
  items?: NftItem[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  useFullWidth?: boolean
  cardGap?: number
}

export default function NftList({
  items = [],
  isLoading,
  hasMore,
  onLoadMore,
  useFullWidth,
  cardGap = 4,
  ...props
}: NftListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  const cardWidth = useMemo(() => {
    if (!containerRect) return defaultCardWidth
    if (useFullWidth) return containerRect.width
    return Math.min(defaultCardWidth, containerRect.width - cardGap)
  }, [containerRect, useFullWidth])

  const cardScale = useMemo(() => {
    if (useFullWidth) return cardWidth / defaultCardWidth
    return Math.min(1, cardWidth / defaultCardWidth)
  }, [cardWidth, useFullWidth])

  const cardHeight = cardWidth * 1.61

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
    <Container px={`${containerPaddingX}px`} ref={containerRef} {...props}>
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
          <Button variant="outline" isLoading={isLoading} disabled={isLoading} onClick={() => onLoadMore()}>
            LOAD MORE
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
