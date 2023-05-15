import { GridItem } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { ParsedMetadata } from '@x/hooks'
import SmartText from 'components/SmartText'
import { memo } from 'react'
import { ChainId } from '@x/constants'

export interface PropertiesProps {
  chainId?: ChainId
  metadata?: ParsedMetadata
  isLoading?: boolean
}

function Properties({ metadata, isLoading, chainId }: PropertiesProps) {
  if (isLoading) return <SkeletonText />

  const keys = Object.keys(metadata?.properties || {})

  if (keys.length === 0) return null

  return (
    <>
      <GridItem colSpan={2} h={6} />
      <GridItem key="properties_title" colSpan={2} fontSize="md" fontWeight="bold">
        Properties
      </GridItem>
      {Object.keys(metadata?.properties || {})
        .map(key => {
          let value = metadata?.properties?.[key]
          if (key.toLowerCase() === 'royalty') {
            const numberValue = parseFloat(`${value}`)
            if (!isNaN(numberValue)) value = `${numberValue / 100}%`
          }
          return [key, value] as const
        })
        .map(([key, value]) => [
          <GridItem key={`property_${key}_label`} textTransform="capitalize">
            {key}
          </GridItem>,
          <GridItem key={`property_${key}_value`}>
            <SmartText type="address" chainId={chainId}>{`${value || '-'}`}</SmartText>
          </GridItem>,
        ])
        .flat()}
    </>
  )
}

export default memo(Properties)
