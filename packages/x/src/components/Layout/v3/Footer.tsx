import { Image } from '@chakra-ui/image'
import { Center, Container, Flex, Text, HStack, Stack, Heading } from '@chakra-ui/react'
import Link from 'components/Link'
import SocialMedia from 'components/SocialMedia'

export default function Footer() {
  return (
    <Center w="full" h="full" bg="panel" borderTop="1px solid" borderColor="divider">
      <Container w="full" h="full" maxW="container.xl">
        <Flex
          justify="space-between"
          pt={12}
          pb={20}
          flexDir={{ base: 'column-reverse', lg: 'row' }}
          alignItems={{ base: 'center', lg: 'flex-start' }}
        >
          <HStack align="end" spacing={4} mt={{ base: 12, lg: 0 }}>
            <Link href="/">
              <Image src="/assets/logo.svg" height={12} />
            </Link>
            <Stack spacing={5}>
              <Heading as="h4" size="xs" textTransform="uppercase">
                X Gon&rsquo; Give It To Ya
              </Heading>
              <Text fontSize="sm" lineHeight={1.125}>
                Decentralised
                <br />
                Community owned NFT marketplace
                <br />
                <Text as="span" color="note">
                  © X Marketplace. All rights reserved.
                </Text>
              </Text>
            </Stack>
          </HStack>
          <Stack spacing={5}>
            <Heading as="h4" size="xs">
              Join the X-community
            </Heading>
            <SocialMedia />
          </Stack>
        </Flex>
      </Container>
    </Center>
  )
}
