import {
  AspectRatio,
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  List,
  ListItem,
  Stack,
  Text,
} from '@chakra-ui/react'
import Layout from 'components/Layout'
import Link from 'components/Link'

const breakpoint = 'md'

function rwd<T>(base: T, value: T) {
  return { base, [breakpoint]: value }
}

export default function MaaS() {
  return (
    <Layout>
      <Container maxW="1184px" pt={rwd('40px', '72px')}>
        <Stack spacing={rwd('32px', '64px')}>
          <Center flexDir="column">
            <Image src="logo.png" />
            <Heading fontSize="20px" fontWeight={500} py="20px">
              Marketplace as a Service
            </Heading>
          </Center>
          <AspectRatio ratio={rwd(1, 1184 / 286)} w="full">
            <Box
              bgImage={rwd('url(maas-small.png)', 'url(maas.png)')}
              w="full"
              h="full"
              bgSize="cover"
              bgPos="left center"
            />
          </AspectRatio>
          <Stack spacing={rwd('16px', '24px')}>
            <Heading fontSize={rwd('20px', '24px')} fontWeight={rwd(500, 700)}>
              What is it
            </Heading>
            <Text fontSize="14px">
              Marketplace-as-a-Service (MaaS) is a way for creators to take back control. Using our marketplace smart
              contracts and frontend code, any creator can integrate their own NFT marketplace directly into their own
              website without the hassle of having to build or maintain one. The marketplace is ring-fenced for only the
              NFT collections the creator wants displayed and set their own royalties and marketplace fee.
            </Text>
          </Stack>
          <Stack spacing={rwd('16px', '24px')}>
            <Heading fontSize={rwd('20px', '24px')} fontWeight={rwd(500, 700)}>
              Who is it for
            </Heading>
            <Text fontSize="14px">
              Any creator, whether an individual artist creating 1/1s, a larger 10k PFP collection or anything in
              between. If you are in the business of creating NFTs then you can benefit from having your own marketplace
              on your website.
            </Text>
          </Stack>
          <Stack spacing={rwd('16px', '24px')}>
            <Heading fontSize={rwd('20px', '24px')} fontWeight={rwd(500, 700)}>
              Why it matters
            </Heading>
            <Text fontSize="14px">
              Several benefits:
              <br />
              <List listStyleType="decimal" pl="1.6rem">
                <ListItem>Creators set their own royalty ensuring they always get paid what they deserve.</ListItem>
                <ListItem>
                  Ring fenced to display only the NFT collections approved by you - ensuring your collectors are buying
                  the genuine article.
                </ListItem>
                <ListItem>
                  Cheaper marketplace fees for your collectors while also allowing you to earn a small additional
                  revenue stream by marking up our base level fee.
                </ListItem>
                <ListItem>
                  A holistic customer experience for your collectors - keeping them on your website immediately post
                  mint and reinforcing your ecosystem.
                </ListItem>
                <ListItem>
                  No need to build or maintain the marketplace code - focus on your collectors and your project.
                </ListItem>
              </List>
            </Text>
          </Stack>
          <Stack spacing={rwd('16px', '24px')}>
            <Heading fontSize={rwd('20px', '24px')} fontWeight={rwd(500, 700)}>
              What features are included
            </Heading>
            <Text fontSize="14px">
              Look around x.xyz. This is what you get, of course you control the front end design experience but we
              provide all the features you see here on X Marketplace. We are also integrated with gem.xyz ensuring
              collectors who list on your marketplace will also appear on the leading marketplace aggregator. As we
              continue to add new features to X Marketplace, those are available to you at no cost, thus helping future
              proof your marketplace.
            </Text>
          </Stack>
          <Grid templateColumns={rwd('1fr', '1fr 1fr')} gap={rwd('36px', '24px')}>
            <GridItem>
              <Stack justify="space-between" h="full">
                <Heading fontSize={rwd('20px', '24px')} fontWeight={rwd(500, 700)}>
                  How to get started
                </Heading>
                <Text fontSize="14px">
                  Contact us today and we can set up time to discuss your needs and how we can help.
                </Text>
                <Text>
                  Bradley:{' '}
                  <Link color="primary" href="mailto:bradley@x.xyz">
                    bradley@x.xyz
                  </Link>
                </Text>
                <Text>
                  Chin:{' '}
                  <Link color="primary" href="mailto:chin@x.xyz">
                    chin@x.xyz
                  </Link>
                </Text>
              </Stack>
            </GridItem>
            <GridItem>
              <Stack direction="row" spacing="14px">
                <AspectRatio ratio={1} maxW="187px" w="50%">
                  <Image src="brad.png" />
                </AspectRatio>
                <AspectRatio ratio={1} maxW="187px" w="50%">
                  <Image src="chin.png" />
                </AspectRatio>
              </Stack>
            </GridItem>
          </Grid>
        </Stack>
      </Container>
    </Layout>
  )
}
