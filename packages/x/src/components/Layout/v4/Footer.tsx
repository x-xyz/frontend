import SocialMedia from 'components/SocialMedia'

import { Center, Container, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react'

export default function Footer() {
  return (
    <Center w="full" h="full" bg="panel" borderTop="1px solid" borderColor="divider">
      <Container w="full" h="full" maxW="container.xl">
        <Flex
          justify="space-between"
          pt={12}
          pb={20}
          flexDir={{ base: 'column-reverse', lg: 'row' }}
          alignItems="center"
        >
          <HStack align="end" spacing={4} mt={{ base: 12, lg: 0 }}>
            <Stack spacing={5}>
              <Heading as="h4" size="xs" textTransform="uppercase">
                X Gon&rsquo; Give It To Ya
              </Heading>
              <Text fontSize="sm" lineHeight={1.125}>
                Decentralised community owned
                <br />
                Marketplace for the NFT Economy
                <br />
                <Text as="span" color="note">
                  © X Marketplace. All rights reserved.
                </Text>
              </Text>
            </Stack>
          </HStack>
          <SocialMedia justify="flex-start" sx={{ '&>*': { pl: 8 } }} />
        </Flex>
      </Container>
    </Center>
  )
}
