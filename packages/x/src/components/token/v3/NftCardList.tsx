import { FlexProps, Grid, GridItem } from '@chakra-ui/layout'
import { Collection } from '@x/models'
import { NftItem } from '@x/models'
import NftCard from './NftCard'
import { memo } from 'react'

const breakpoint = 'lg'

export interface NftCardListProps extends FlexProps {
  items?: NftItem[]
  collection?: Collection
}

interface ItemData {
  items: NftItem[]
  columnCount: number
  collections?: Collection[]
}

function NftCardList({ items = [], collection, ...props }: NftCardListProps) {
  return (
    <Grid
      overflow="auto"
      templateColumns="repeat(auto-fill, 260px)"
      gridAutoFlow={{ base: 'column', [breakpoint]: 'unset' }}
      justifyContent={{ base: 'flex-start', [breakpoint]: 'space-between' }}
      maxW="1280px"
      gap={10}
      {...props}
    >
      {items?.map((item, idx) => {
        return (
          <GridItem key={idx}>
            <NftCard key={idx} nft={item} collection={collection} />
          </GridItem>
        )
      })}
    </Grid>
  )
}

export default memo(NftCardList)
