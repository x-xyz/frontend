import { Box, Divider, Flex, FlexProps } from '@chakra-ui/react'

interface SectionDividerProps extends FlexProps {
  showDivider?: 'left' | 'right'
}

export default function SectionDivider({ showDivider, ...props }: SectionDividerProps) {
  const showLeftDivider = showDivider === 'left' ? 'visible' : 'hidden'
  const showRightDivider = showDivider === 'right' ? 'visible' : 'hidden'

  return (
    <Flex direction="row" w="100%" alignItems="center" {...props}>
      <Box borderTopWidth="1px" borderColor="primary" borderStyle="dashed" flex="1" visibility={showLeftDivider} />
      <Divider orientation="vertical" w="2px" h="80px" bg="primary" />
      <Box borderTopWidth="1px" borderColor="primary" borderStyle="dashed" flex="1" visibility={showRightDivider} />
    </Flex>
  )
}
