import { Box, BoxProps } from '@chakra-ui/layout'

export default function GradientBox({ children, ...props }: BoxProps) {
  return (
    <Box pos="relative" bg="background" overflow="hidden" {...props}>
      <Box pos="absolute" w="100%" h="100%" bg="rgba(255, 255, 255, 0.19)" />
      <Box pos="absolute" w="100%" h="100%" bg="url(/assets/bg-nonce.png)" bgSize="cover" filter="blur(42px)" />
      <Box pos="absolute" w="100%" h="100%">
        {children}
      </Box>
    </Box>
  )
}
