import Layout from 'components/Layout/v4'
import SocialMedia from 'components/SocialMedia'
import LatestCollections from 'components/v4/home/LatestCollections'
import TopCollectionList from 'components/v4/home/TopCollectionList'
import { Box, Button, Container, Grid, GridItem, Heading, Spacer, Stack, Text } from '@chakra-ui/react'
import Link from 'components/Link'

export default function Index() {
  return (
    <Layout bg="url(/assets/v4/bg/bg_homepage.jpg)" disableTransparentBlackOnBackground>
      <Container maxW="container.xl" px={0}>
        <Stack align="center" mt="72px" mb="120px">
          <Heading textTransform="uppercase" fontSize="68px">
            start something big
          </Heading>
          <Text fontSize="24px">100% of marketplace fees are passed back to community</Text>
        </Stack>
        <TopCollectionList />
        <LatestCollections />
        <Grid mt="32px" templateColumns="repeat(3, 1fr)" columnGap={1}>
          <GridItem>
            <Stack h="full" bg="url(/assets/v4/bg/bg_home_team.jpg)" bgSize="cover" p={8}>
              <Heading as="h4" fontSize="xl">
                About the X Team
              </Heading>
              <Text fontSize="sm">
                We are a team of builders and thinkers who are well-known and respected in the crypto and NFT industry.
              </Text>
              <Spacer />
              {/* <Button w="120px" disabled>
                Read More
              </Button> */}
            </Stack>
          </GridItem>
          <GridItem>
            <Stack h="full" bg="url(/assets/v4/bg/bg_home_community.jpg)" bgSize="cover" p={8}>
              <Heading as="h4" fontSize="xl">
                The X-community
              </Heading>
              <Text fontSize="sm">
                We&apos;re a community that celebrates radical self expression and inclusiveness with no prerequisites
                placed to participate. X is a home for the weird, the strange and the brilliant. At our Core are the
                principles of Self Expression, Communal Effort, Civic Responsibility and Participation.
              </Text>
              <Spacer />
              <SocialMedia justify="flex-start" sx={{ '&>*': { pr: 8 } }} />
            </Stack>
          </GridItem>
          <GridItem>
            <Stack h="full" bg="url(/assets/v4/bg/bg_home_buyx.jpg)" bgSize="cover" p={8}>
              <Heading as="h4" fontSize="xl">
                About X
              </Heading>
              <Text fontSize="sm">
                X Marketplace is a decentralised community owned NFT marketplace which provides solutions for both NFT
                collectors and projects. NFT trading, IP licensing and portfolio management/valuation solutions provide
                NFT collectors with a holistic marketplace solution to service their varied needs. X’s
                Marketplace-as-a-Service provides a personalised marketplace integrated within a NFT project’s front-end
                to reinforce the collector/project relationship through increased security, cost efficiencies and custom
                value add features.
              </Text>
              <Box h={5} />
              <Link href="https://app.sushi.com/swap?outputCurrency=0x7f3141c4d6b047fb930991b450f1ed996a51cb26">
                <Button w="120px">Buy X</Button>
              </Link>
            </Stack>
          </GridItem>
        </Grid>
        <Box h="72px" />
      </Container>
    </Layout>
  )
}
