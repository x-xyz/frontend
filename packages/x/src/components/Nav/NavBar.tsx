import { Stack, StackProps } from '@chakra-ui/layout'

export default function NavBar({ children, ...props }: StackProps) {
  return (
    <Stack direction="row" w="100%" justify="space-between" align="center" my={8} overflowX="auto" {...props}>
      {children}
    </Stack>
  )
}
