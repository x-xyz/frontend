import CollectionCard from 'components/collection/v3/CollectionCard'
import ReactWindowScroller from 'components/ReactWindowScroller'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'

import { Button, Center, Container } from '@chakra-ui/react'
import { Collection } from '@x/models'
import OwnerCollectionCard from '../../../collection/OwnerCollectionCard'

const cardGap = 40

interface Props {
  items: Collection[]
  isLoading?: boolean
  isOwner?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  collectionUrl?: (collection: Collection) => string
}

interface ItemData {
  items: Collection[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
  collectionUrl?: (collection: Collection) => string
}

export default function CollectionList({ items, isLoading, isOwner, hasMore, onLoadMore, collectionUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  const defaultWidth = 360

  const cardWidth = useMemo(() => {
    if (!containerRect) return defaultWidth
    return Math.min(defaultWidth, containerRect.width - cardGap)
  }, [containerRect, defaultWidth])

  const cardScale = useMemo(() => Math.min(1, cardWidth / defaultWidth), [cardWidth, defaultWidth])

  const cardHeight = cardWidth * (isOwner ? 1.45 : 1.93)

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
            itemData={{ items, columnCount, isLoading, cardScale, collectionUrl }}
            overscanRowCount={4}
            {...scrollerProps}
            style={{
              ...scrollerProps.style,
              overflow: 'hidden',
              boxSizing: 'content-box',
            }}
          >
            {isOwner ? OwnerCard : Card}
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

function Card({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading, cardScale, collectionUrl } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      return <CollectionCard collection={items[index]} collectionUrl={collectionUrl} />
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

function OwnerCard({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading, cardScale, collectionUrl } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      return <OwnerCollectionCard collection={items[index]} collectionUrl={collectionUrl} />
    }

    if (isLoading) {
      return <OwnerCollectionCard />
    }
  }

  return (
    <Center style={style} transform={`scale(${cardScale})`}>
      {render()}
    </Center>
  )
}
