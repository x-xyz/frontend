import { Button } from '@chakra-ui/button'
import { Box, Center, Flex, Text } from '@chakra-ui/layout'
import { Container, Heading, useBreakpointValue } from '@chakra-ui/react'
import Link from 'components/Link'
import SocialMedia from 'components/SocialMedia'

const breakpoint = 'lg'

export default function Introduction() {
  const isDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const itemFlex = {
    base: '0 0 100%',
    [breakpoint]: '1 0 0',
  }

  return (
    <Center bg="panel" py={15}>
      <Container maxW="container.xl" id="about-x">
        <Flex
          mx="-4"
          my={{ base: '-7', lg: '-10' }}
          flexDir={isDesktopView ? 'row' : 'column'}
          textAlign={isDesktopView ? 'start' : 'center'}
        >
          <Box px="4" flex={itemFlex} my={{ base: '7', lg: '10' }}>
            <Heading>New to the scene?</Heading>
            <Box h={{ base: 7, lg: 10 }} />
            <Text flexGrow={1}>
              We&apos;ve got you covered!
              <br />
              <br />
              From setting up your wallet, minting your first NFT, to listing your shiny new masterpiece. Our learning
              resources will equip you with the knowledge to becoming an NFT veteran.
            </Text>
            <Button mt={10}>
              <Link href="/docs">Learn</Link>
            </Button>
          </Box>
          <Box px="4" flex={itemFlex} my={{ base: '7', lg: '10' }}>
            <Heading>The X-community</Heading>
            <Box h={{ base: 7, lg: 10 }} />
            <Text flexGrow={1}>
              We&apos;re a community that celebrates radical self expression and inclusiveness with no prerequisites
              placed to participate. X is a home for the weird, the strange and the brilliant. At our Core are the
              principles of Self Expression, Communal Effort, Civic Responsibility and Participation.
            </Text>
            <Box w="40" mt={10} mx={isDesktopView ? 'initial' : 'auto'}>
              <SocialMedia />
            </Box>
          </Box>
          <Box px="4" flex={itemFlex} my={{ base: '7', lg: '10' }}>
            <Heading>About X</Heading>
            <Box h={{ base: 7, lg: 10 }} />
            <Text flexGrow={1}>
              X is a multichain decentralised NFT marketplace that is owned and operated by the NFT community. Collect,
              create and sell across multiple blockchains on the industry&apos;s first decentralised NFT marketplace.
              Governance is provided by the X DAO with voting rights given to token holders.
            </Text>
            <Button mt={10}>
              <Link
                href="https://app.sushi.com/swap?outputCurrency=0x7f3141c4d6b047fb930991b450f1ed996a51cb26"
                target="_blank"
                rel="noreferrer"
              >
                Buy X
              </Link>
            </Button>
          </Box>
        </Flex>
      </Container>
    </Center>
  )
}
