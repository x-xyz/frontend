import { useRef } from 'react'
import Image from 'next/image'
import { Button } from '@chakra-ui/button'
import { AspectRatio, Box, Center, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import Layout from 'components/Layout'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import Link from 'components/Link'
import ScrollingMouse from 'components/ScrollingMouse'
import SectionDivider from 'components/Layout/SectionDivider'
import { layout } from 'theme'

export const getServerSideProps = createServerSidePropsGetter()

export default function Home() {
  const lineHeight = '18px'

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const fontSize = '17px'

  return (
    <Layout hideMarketNav>
      <Stack w="100%" align="center" spacing={10} mt={{ base: 4, md: 0 }}>
        <Box outline="0px solid blue" w="100%">
          <Stack
            direction={{ base: 'column-reverse', md: 'row' }}
            w="100%"
            maxW="container.xl"
            minH={{ base: 'initial', md: `calc(100vh - ${layout.headerHeight} - 80px)` }}
            mx="auto"
            spacing={8}
            alignItems="center"
            position="relative"
            outline="0px solid red"
          >
            <Stack
              maxW={{ base: '100%', md: '50%' }}
              spacing={{ base: 3, md: 8 }}
              alignItems={{ base: 'center', md: 'flex-start' }}
            >
              <AspectRatio ratio={357 / 36} maxWidth={{ base: '246px', md: '357px' }} w="100%">
                <Image src="/assets/bazaar/bazaar-bsc-logo.png" layout="fill" />
              </AspectRatio>

              <Heading
                variant="gradient"
                textAlign={{ base: 'center', md: 'left' }}
                fontSize={{ base: '24px', md: '36px' }}
              >
                A new world awaits
              </Heading>

              <Text
                textAlign={{ base: 'center', md: 'left' }}
                fontSize={{ md: '24px' }}
                textTransform="uppercase"
                color="primary"
                lineHeight={{ base: '18px', md: '28px' }}
                fontWeight={500}
              >
                Enter the most rewarding BNB Marketplace
              </Text>

              <Stack direction="row" spacing={{ base: 3, md: 6 }} w="100%">
                <Button
                  size="lg"
                  variant="outline"
                  w="100%"
                  flex="190px"
                  onClick={() => scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn
                </Button>

                <Link href="https://twitter.com/BZRdotxyz" flex="190px">
                  <Button
                    size="lg"
                    w="100%"
                    leftIcon={<Image src="/assets/bazaar/twitter-black.png" width="14px" height="14px" />}
                  >
                    Twitter
                  </Button>
                </Link>
              </Stack>
            </Stack>

            <AspectRatio ratio={580 / 548} width="50%" minWidth="290px">
              <Box
                width="100%"
                height="100%"
                backgroundImage={`url(/assets/bazaar/keyvisual.png)`}
                backgroundSize="cover"
                backgroundRepeat="no-repeat"
                backgroundPosition="center center"
                position="absolute"
              />
            </AspectRatio>
          </Stack>

          <ScrollingMouse />
        </Box>

        <SectionDivider showDivider="left" />

        <Stack align="center" spacing={5}>
          <Heading
            variant="gradient"
            textAlign={{ base: 'center', md: 'left' }}
            fontSize={{ base: '24px', md: '36px' }}
          >
            Earn more, do less
          </Heading>
          <Text color="primary" maxW="480px" align="center" lineHeight={lineHeight} fontSize={{ md: fontSize }}>
            Bazaar is BNB’s first community owned NFT Marketplace where you can earn more by taking small actions.
          </Text>
        </Stack>
        <SectionDivider showDivider="right" />

        <Stack align="center" spacing={5} w="100%">
          <Heading
            ref={scrollContainerRef}
            sx={{ scrollMarginTop: '100px' }}
            variant="gradient"
            textAlign={{ base: 'center', md: 'left' }}
            fontSize={{ base: '24px', md: '36px' }}
          >
            small actions, big rewards
          </Heading>
          <Text color="primary" maxW="480px" align="center" lineHeight={lineHeight} fontSize={{ md: fontSize }}>
            Start earning tokens on BNB Chain just by connecting your wallet.
            <Text as="span" display="block" color="inherit" fontSize="2xl" fontWeight="bold" pt={5}>
              Many ways to earn
            </Text>
          </Text>
          <Flex wrap="wrap" justify="space-evenly" w="100%" maxW="container.xl" py={6}>
            <CircleStep action="Verify" subject="Your Email" />
            <CircleStep action="List" subject="Your NFTs" />
            <CircleStep action="Trade" subject="BNB NFTs" />
            <CircleStep action="Refer" subject="Bazaar to Friends" />
          </Flex>
          <Button size="lg" disabled>
            Coming Soon
          </Button>
        </Stack>

        <SectionDivider showDivider="left" />

        <Stack align="center" spacing={5} w="100%">
          <Heading
            variant="gradient"
            textAlign={{ base: 'center', md: 'left' }}
            fontSize={{ base: '24px', md: '36px' }}
          >
            Only on Bazaar
          </Heading>
          <Text color="primary" maxW="672px" align="center" lineHeight={lineHeight} fontSize={{ md: fontSize }}>
            Be the first to know about BNB’s exclusive partnerships and projects.
          </Text>
        </Stack>

        <SectionDivider showDivider="right" />

        <Stack align="center" spacing={8}>
          <Heading
            variant="gradient"
            textAlign={{ base: 'center', md: 'left' }}
            fontSize={{ base: '24px', md: '36px' }}
          >
            Join the Bazaar community
          </Heading>

          <Link href="https://twitter.com/BZRdotxyz" isExternal>
            <Button size="lg" leftIcon={<Image src="/assets/bazaar/twitter-black.png" width="14px" height="14px" />}>
              Follow Us
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Layout>
  )
}

function CircleStep({ action, subject }: { action: string; subject: string }) {
  const borderWidth = '4px'

  const gradientStyle = {
    content: "''",
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
    margin: `-${borderWidth}`,
    borderRadius: 'inherit',
    background:
      'linear-gradient(261.86deg, #FF00FF 15.23%, #EB28FF 18.51%, #D554FE 22.8%, #C07DFE 27.53%, #AFA0FE 32.57%, #A0BEFE 38.04%, #94D6FD 44.07%, #8AE8FD 50.87%, #84F5FD 58.91%, #80FDFD 69.39%, #7FFFFD 91.36%)',
  }

  return (
    <Stack align="center" minW={{ base: '148px', md: '210px' }} flexShrink={0} my={4} spacing={{ base: 3, md: 4 }}>
      <Center
        w={{ base: '100px', md: '180px' }}
        h={{ base: '100px', md: '180px' }}
        borderRadius="90px"
        position="relative"
        background="black"
        _before={gradientStyle}
      >
        <Heading as="h4" variant="gradient" fontSize={{ md: '2xl' }}>
          {action}
        </Heading>
      </Center>
      <Text fontSize={{ md: '2xl' }} color="primary">
        {subject}
      </Text>
    </Stack>
  )
}
