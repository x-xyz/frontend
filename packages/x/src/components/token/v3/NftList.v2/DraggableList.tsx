import ReactWindowScroller from 'components/ReactWindowScroller'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import ResizeObserver from 'resize-observer-polyfill'

import { Button, Center, Container, ContainerProps } from '@chakra-ui/react'
import { NftItem } from '@x/models'

import DraggableItem from './DraggableItem'

const defaultCardWidth = 360
const cardGap = 40

interface ItemData {
  items: NftItem[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
  selectable?: boolean
  selectedItems?: NftItem[]
  onSelectItem?: (item: NftItem, selected: boolean) => void
}

export interface DraggableListProps extends ContainerProps {
  items?: NftItem[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  selectable?: boolean
  selectedItems?: NftItem[]
  onSelectItem?: (item: NftItem, selected: boolean) => void
}

export default function DraggableList({
  items = [],
  isLoading,
  hasMore,
  onLoadMore,
  selectable,
  selectedItems,
  onSelectItem,
  ...props
}: DraggableListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const windowRef = useRef<FixedSizeGrid<ItemData>>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  const cardWidth = useMemo(() => {
    if (!containerRect) return defaultCardWidth
    return Math.min(defaultCardWidth, containerRect.width - cardGap)
  }, [containerRect])

  const cardScale = useMemo(() => Math.min(1, cardWidth / defaultCardWidth), [cardWidth])

  const cardHeight = cardWidth * 0.278

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

  useEffect(() => {
    windowRef.current?.forceUpdate()
  }, [selectedItems])

  return (
    <Container
      px={`${containerPaddingX}px`}
      maxW={{ base: 'container.xl', '2xl': 'container.3xl' }}
      ref={containerRef}
      {...props}
    >
      <ReactWindowScroller isGrid windowRef={windowRef}>
        {scrollerProps => (
          <FixedSizeGrid<ItemData>
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowCount={rowCount}
            rowHeight={rowHeight}
            height={process.browser ? window.innerHeight : 0}
            width={process.browser ? window.innerWidth : 0}
            itemData={{ items, columnCount, isLoading, cardScale, selectable, selectedItems, onSelectItem }}
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
        {hasMore && (
          <Button isLoading={isLoading} disabled={isLoading} onClick={() => onLoadMore?.()}>
            Load More
          </Button>
        )}
      </Center>
    </Container>
  )
}

function Item({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading, cardScale, selectable, onSelectItem, selectedItems = [] } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      const nft = items[index]
      return (
        <DraggableItem
          item={nft}
          selectable={selectable}
          selected={selectedItems.includes(nft)}
          onSelectItem={onSelectItem}
        />
      )
    }

    if (isLoading) {
      return <DraggableItem />
    }
  }

  return (
    <Center style={style} transform={`scale(${cardScale})`}>
      {render()}
    </Center>
  )
}
