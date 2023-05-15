import ReactWindowScroller from 'components/ReactWindowScroller'
import NftCard from 'components/token/v3/NftCard'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import ResizeObserver from 'resize-observer-polyfill'

import { Button, Center, Container } from '@chakra-ui/react'
import { Collection, NftItem } from '@x/models'
import { tokensv2, useAppDispatch, useAppSelector } from '@x/store'
import { compareAddress } from '@x/utils'

const defaultCardWidth = 260
const cardGap = 40

interface ItemData {
  items: NftItem[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
  collections?: Collection[]
}

export interface NftListProps {
  tokenV2Id: string
  collection?: Collection
  collections?: Collection[]
}

export default function NftList({ tokenV2Id, collection, collections }: NftListProps) {
  const dispatch = useAppDispatch()
  const tokens = useAppSelector(tokensv2.selectors.items(tokenV2Id))
  const isLoading = useAppSelector(tokensv2.selectors.isLoading(tokenV2Id))
  const batchSize = useAppSelector(tokensv2.selectors.limit(tokenV2Id))
  const hasMore = useAppSelector(tokensv2.selectors.hasMore(tokenV2Id))

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
    () => Math.ceil(tokens.length / columnCount) + (isLoading ? 1 : 0),
    [tokens, columnCount, isLoading],
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
            itemData={{
              items: tokens,
              columnCount,
              isLoading,
              cardScale,
              collections: collections || (collection && [collection]),
            }}
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
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            onClick={() => dispatch(tokensv2.actions.setOffset({ id: tokenV2Id, data: prev => prev + batchSize }))}
          >
            Load More
          </Button>
        )}
      </Center>
    </Container>
  )
}

function Item({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading, cardScale, collections } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      const nft = items[index]
      const collection = collections?.find(
        c => c.chainId === nft.chainId && compareAddress(c.erc721Address, nft.contractAddress),
      )
      return <NftCard nft={nft} collection={collection} />
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
