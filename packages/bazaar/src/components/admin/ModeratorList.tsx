import { Grid, GridItem, GridProps } from '@chakra-ui/layout'
import { SmallCloseIcon } from '@chakra-ui/icons'
import { SkeletonText } from '@chakra-ui/skeleton'
import Address from 'components/Address'
import { Moderator } from '@x/models'
import { IconButton } from '@chakra-ui/button'
import { Fragment } from 'react'

export interface ModeratorListProps extends GridProps {
  moderators?: Moderator[]
  isLoading?: boolean
  onRemove?: (address: string) => void
}

export default function ModeratorList({ moderators, isLoading, onRemove, ...props }: ModeratorListProps) {
  return (
    <Grid templateColumns="auto 1fr auto" columnGap={4} rowGap={2} {...props}>
      <GridItem colSpan={3}>Moderators</GridItem>
      {isLoading && (
        <>
          <GridItem>
            <SkeletonText noOfLines={1} w="64px" />
          </GridItem>
          <GridItem>
            <SkeletonText noOfLines={1} w="240px" />
          </GridItem>
          <GridItem />
        </>
      )}
      {!isLoading && moderators?.length === 0 && <GridItem colSpan={3}>No moderators</GridItem>}
      {moderators?.map(moderator => (
        <Fragment key={moderator.address}>
          <GridItem>{moderator.name}</GridItem>
          <GridItem>
            <Address type="account">{moderator.address}</Address>
          </GridItem>
          <GridItem>
            {onRemove && (
              <IconButton
                icon={<SmallCloseIcon />}
                aria-label="remove"
                size="xs"
                onClick={() => onRemove(moderator.address)}
              />
            )}
          </GridItem>
        </Fragment>
      ))}
    </Grid>
  )
}
