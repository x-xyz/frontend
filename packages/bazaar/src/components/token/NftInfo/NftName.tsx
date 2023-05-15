import { Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { ParsedMetadata } from '@x/hooks'
import { memo } from 'react'

export interface NftNameProps {
  metadata?: ParsedMetadata
  isLoading?: boolean
}

function NftName({ metadata, isLoading }: NftNameProps) {
  if (isLoading) return <SkeletonText noOfLines={2} />

  return (
    <Text as="h2" fontSize="4xl" fontWeight="bold">
      {metadata?.name || '-'}
    </Text>
  )
}

export default memo(NftName)
