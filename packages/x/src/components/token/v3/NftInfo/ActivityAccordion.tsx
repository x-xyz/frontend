import { Box } from '@chakra-ui/layout'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
} from '@chakra-ui/react'

function ActivityAccordion({ children, ...props }: AccordionProps) {
  return (
    <Accordion allowToggle {...props}>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Activity
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel p={0}>{children}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default ActivityAccordion
