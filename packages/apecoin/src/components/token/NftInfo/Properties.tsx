import { Box, Flex, Stack, Text } from '@chakra-ui/layout'
import { Collection, NftItem } from '@x/models/dist'
import { SimpleGrid } from '@chakra-ui/react'

const breakpoint = 'lg'

interface PropertyAccordionProps {
  collection?: Collection
  detail?: NftItem
}

function Properties({ collection, detail }: PropertyAccordionProps) {
  function renderTraitRarity(traitType: string, traitValue: string) {
    const { attributes, supply = 0 } = collection || {}
    if (!attributes) return '-'
    const count = attributes[traitType]?.[traitValue] || NaN
    const rarity = count / supply
    if (isNaN(rarity)) return ''
    return `${(rarity * 100).toFixed(2)}% have this trait`
  }

  if (!detail?.attributes) return null

  return (
    <SimpleGrid columns={2} spacing={4}>
      {detail?.attributes.map(({ trait_type, value }) => (
        <Stack key={trait_type} spacing={1} textAlign="center" p="2.5" backgroundColor="panel">
          <Text variant="subtitle1" color="textSecondary" isTruncated>
            {trait_type}
          </Text>
          <Text variant="subtitle1" flexGrow={1}>
            {value.replace(/"/g, '').replace(/-/g, ' ') || '-'}
          </Text>
          <Text variant="caption" color="textSecondary">
            {renderTraitRarity(trait_type, value)}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  )
}

export default Properties
