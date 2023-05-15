import { Box } from '@chakra-ui/layout'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/react'
import { ParsedMetadata } from '@x/hooks'

interface DescriptionAccordionProps {
  metadata?: ParsedMetadata
}

function DescriptionAccordion({ metadata }: DescriptionAccordionProps) {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Description
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>{metadata?.description || '-'}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default DescriptionAccordion
