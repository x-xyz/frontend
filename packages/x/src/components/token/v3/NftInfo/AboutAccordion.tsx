import { Box } from '@chakra-ui/layout'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Text } from '@chakra-ui/react'
import { Collection } from '@x/models'
import Markdown from 'components/Markdown'

interface AboutAccordionProps {
  collection?: Collection
}

function AboutAccordion({ collection }: AboutAccordionProps) {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              About the Collection
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Text as={Markdown} color="note" whiteSpace="break-spaces">
            {collection?.description.replace(/\n/g, ' ')}
          </Text>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default AboutAccordion
