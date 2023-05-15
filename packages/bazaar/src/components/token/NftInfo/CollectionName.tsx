import { Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import Link from 'components/Link'
import { Collection } from '@x/models'
import { memo } from 'react'
import { makeQueryParams } from '@x/utils'

export interface CollectionNameProps {
  collection?: Collection
  isLoading?: boolean
}

function CollectionName({ collection, isLoading }: CollectionNameProps) {
  if (isLoading) return <SkeletonText noOfLines={2} />

  if (!collection) return null

  const { chainId } = collection

  const contractAddress = collection.erc721Address

  if (!contractAddress) return <Text fontWeight="bold">{collection.collectionName || '-'}</Text>

  return (
    <Link
      /**
       * @todo workaround, fix url query sync issue in fetchTokens
       */
      href={`${window.location.protocol}//${window.location.host}/assets?${makeQueryParams({
        chainId,
        collections: [contractAddress],
      })}`}
      forceInternal
      fontWeight="bold"
    >
      {collection.collectionName || '-'}
    </Link>
  )
}

export default memo(CollectionName)
