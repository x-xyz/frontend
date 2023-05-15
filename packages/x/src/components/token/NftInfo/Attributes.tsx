import { GridItem } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { ChainId } from '@x/constants'
import { ParsedMetadata } from '@x/hooks'
import SmartText from 'components/SmartText'
import { memo } from 'react'

export interface AttributesProps {
  chainId?: ChainId
  metadata?: ParsedMetadata
  isLoading?: boolean
}

function Attributes({ chainId, metadata, isLoading }: AttributesProps) {
  if (isLoading) return <SkeletonText />

  if (!metadata?.attributes?.length) return null

  return (
    <>
      <GridItem colSpan={2} h={6} />
      <GridItem key="properties_title" colSpan={2} fontSize="md" fontWeight="bold">
        Attributes
      </GridItem>
      {metadata?.attributes
        .map(({ trait_type, value }) => [
          <GridItem key={`attribute_${trait_type}_label`} textTransform="capitalize">
            {trait_type}
          </GridItem>,
          <GridItem key={`attribute_${trait_type}_value`}>
            <SmartText type="address" chainId={chainId}>{`${value || '-'}`}</SmartText>
          </GridItem>,
        ])
        .flat()}
    </>
  )
}

export default memo(Attributes)
