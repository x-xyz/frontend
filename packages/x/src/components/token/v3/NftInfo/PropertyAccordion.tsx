import { Box, Flex, Stack, Text } from '@chakra-ui/layout'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/react'
import { Collection, NftItem } from '@x/models/dist'

const breakpoint = 'lg'

interface PropertyAccordionProps {
  collection?: Collection
  detail?: NftItem
}

function PropertyAccordion({ collection, detail }: PropertyAccordionProps) {
  function renderTraitRarity(traitType: string, traitValue: string) {
    const { attributes, supply = 0 } = collection || {}
    if (!attributes) return '-'
    const count = attributes[traitType]?.[traitValue] || 0
    const rarity = count / supply
    if (isNaN(rarity)) return '-'
    return `${(rarity * 100).toFixed(2)}%`
  }

  function renderProperties() {
    if (!detail?.attributes) return null

    return (
      <Flex flexWrap="wrap" mt="-5" ml="-2.5">
        {detail?.attributes.map(({ trait_type, value }, idx) => (
          <Box key={idx} width={{ base: '50%', [breakpoint]: '33.3333%' }} flex="0 0 auto" px="2.5" mt="5">
            <Stack
              spacing={0}
              border="1px solid"
              borderColor="divider"
              textAlign="center"
              p="5"
              backgroundColor="panel"
              h="100%"
            >
              <Text fontSize="xs" fontWeight="bold" color="note" textTransform="uppercase" isTruncated>
                {trait_type}
              </Text>
              <Text fontWeight="bold" color="primary" fontSize="lg" flexGrow={1}>
                {value.replace(/"/g, '').replace(/-/g, ' ') || '-'}
              </Text>
              <Text fontSize="sm" color="value">
                {renderTraitRarity(trait_type, value)} have this trait
              </Text>
            </Stack>
          </Box>
        ))}
      </Flex>
    )
  }

  return (
    <Accordion defaultIndex={[0]} allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Properties
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>{renderProperties()}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default PropertyAccordion
