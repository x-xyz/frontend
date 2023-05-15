import ParentLayout from 'components/Layout/v3'
import { Stack, Center, Container, StackProps } from '@chakra-ui/react'

export type LayoutProps = StackProps

export default function Layout({ children, ...props }: LayoutProps) {
  return (
    <ParentLayout>
      <Stack h="full" spacing={0} {...props}>
        <Center flexGrow={1}>
          <Container maxW="container.xl" h="full">
            {children}
          </Container>
        </Center>
      </Stack>
    </ParentLayout>
  )
}
