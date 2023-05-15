import { Box, BoxProps } from '@chakra-ui/layout'

export default function Section({ children, ...props }: BoxProps) {
  return (
    <Box p={2} {...props}>
      {children}
    </Box>
  )
}
