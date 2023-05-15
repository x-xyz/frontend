import { Box, FlexProps } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import InView from 'react-intersection-observer'
import { Collection } from '@x/models'
import { NftItem } from '@x/models'
import { useCollectionsQuery } from '@x/apis'
import Link from 'components/Link'
import NftCard, { NftCardProps } from './NftCard'
import { NftCardLayout } from './SwitchNftCardLayout'
import { getChainNameForUrl } from '@x/constants'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import ReactWindowScroller from 'components/ReactWindowScroller'
import ResizeObserver from 'resize-observer-polyfill'
import throttle from 'lodash/throttle'

export interface NftCardListProps extends FlexProps {
  items?: NftItem[]
  isLoading?: boolean
  hasMore?: boolean
  onMore?: () => void
  layout?: NftCardLayout
  strewn?: boolean
}

interface ItemData {
  items: NftItem[]
  columnCount: number
  collections?: Collection[]
  onMore?: () => void
  isLoading?: boolean
  hasMore?: boolean
  strewn?: boolean
  layout: NftCardLayout
}

function NftCardList({
  items = [],
  isLoading = false,
  hasMore = false,
  onMore,
  layout = 'small',
  strewn = false,
  ...props
}: NftCardListProps) {
  const { data: collections } = useCollectionsQuery({})

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

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

  const smallColumnCount = useBreakpointValue({ base: 2, md: 3, xl: 4, '3xl': 7 }) || 1

  const largeColumnCount = useBreakpointValue({ base: 1, md: 2, xl: 3, '2xl': 4 }) || 1

  const columnCount = layout === 'large' ? largeColumnCount : smallColumnCount

  const columnWidth = useMemo(() => Math.floor((containerRect?.width || 0) / columnCount), [containerRect, columnCount])

  const rowCount = useMemo(
    () => Math.ceil(items.length / columnCount) + (hasMore || isLoading ? 1 : 0),
    [items, columnCount, hasMore, isLoading],
  )

  const rowHeight = useMemo(() => Math.floor(columnWidth + 80), [columnWidth])

  return (
    <Box ref={containerRef} h="100%" {...props}>
      <ReactWindowScroller isGrid>
        {scrollerProps => (
          <FixedSizeGrid<ItemData>
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowCount={rowCount}
            rowHeight={rowHeight}
            height={process.browser ? window.innerHeight : 0}
            width={process.browser ? window.innerWidth : 0}
            itemData={{
              items,
              columnCount,
              collections: collections?.data,
              onMore,
              isLoading,
              hasMore,
              strewn,
              layout,
            }}
            overscanRowCount={4}
            {...scrollerProps}
            style={{
              ...scrollerProps.style,
              overflow: 'hidden',
              minHeight: strewn ? '600px' : undefined,
              boxSizing: 'content-box',
              paddingBottom: '160px',
            }}
          >
            {GridItem}
          </FixedSizeGrid>
        )}
      </ReactWindowScroller>
      {/* <Box h="200px" /> */}
    </Box>
  )
}

function getOffsetX(n: number) {
  const offsetX = [60, 150, 10, 100]
  return offsetX[n % offsetX.length]
}

function GridItem({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, collections, onMore, isLoading, hasMore, strewn, layout } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      return <NftCardItem token={items[index]} collections={collections} dark={index % 2 == 1} />
    }

    if (!isLoading && !hasMore) return null

    if (
      // to prevent trigger onMore when initial loading
      items.length > 0 &&
      index === items.length &&
      onMore
    ) {
      return (
        <InView onChange={inView => inView && !isLoading && onMore()} style={{ height: '100%' }}>
          <NftCard h="100%" loading />
        </InView>
      )
    }

    return <NftCard h="100%" loading />
  }

  const top = parseFloat(`${style.top}`.replace(/px$/, '')) + (strewn ? getOffsetX(index % columnCount) : 0)

  return (
    <Box
      p={2}
      style={{ ...style, top: `${top}px` }}
      transition="left .3s ease-out, top .3s ease-out, width .3s ease-out, height .3s ease-out"
    >
      {render()}
    </Box>
  )
}

function NftCardItem({ token, ...props }: NftCardProps) {
  return (
    <Link
      variant="container"
      href={token && `/asset/${getChainNameForUrl(token.chainId)}/${token.contractAddress}/${token.tokenId}`}
    >
      <NftCard w="100%" h="100%" token={token} {...props} />
    </Link>
  )
}

export default memo(NftCardList)
