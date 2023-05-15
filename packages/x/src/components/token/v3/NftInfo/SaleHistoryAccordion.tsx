import { Box } from '@chakra-ui/layout'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/react'

function SaleHistoryAccordion() {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Sales History
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}></AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default SaleHistoryAccordion
