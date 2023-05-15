import { Box, BoxProps } from '@chakra-ui/react'

export default function ModalIcon({ children, ...props }: BoxProps) {
  return (
    <Box w={7} h={7} pos="absolute" top={-1} right={-1} {...props}>
      {children}
    </Box>
  )
}
