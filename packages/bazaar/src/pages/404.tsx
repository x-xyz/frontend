import { Box, Button, Center, Text } from '@chakra-ui/react'
import Layout from 'components/Layout'
import Link from 'components/Link'

export default function Index() {
  return (
    <Layout>
      <Center py="120px" flexDir="column">
        <Text variant="gradient" fontSize="36px" fontWeight="bold">
          404 NOT FOUND
        </Text>
        <Box h={12} />
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </Center>
    </Layout>
  )
}
