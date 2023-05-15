import AccountNavBar from 'components/account/AccountNavBar'
import BuyAndSellBanner from 'components/BuyAndSellBanner'
import Image from 'components/Image'
import Layout from 'components/Layout/v2'
import NftCardPage from 'components/token/NftCardPage'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { useEffect } from 'react'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center, Grid, GridItem, Stack, Text, Divider } from '@chakra-ui/layout'
import { FetchTokensProvider, useActiveWeb3React, useFetchTokens } from '@x/hooks'
import RunningAuctions from 'components/auction/RunningAuctions'
import LatestListings from 'components/marketplace/LatestListings'

export const getServerSideProps = createServerSidePropsGetter()

export default function Dashboard() {
  const { account } = useActiveWeb3React()

  function renderMain() {
    if (account) return <MyCreations account={account} />

    return (
      <Center p={24}>
        <Stack alignItems="center" spacing={10}>
          <Image src="/assets/excited.png" w="200px" h="156px" />
          <Text fontSize="2xl">Connect your wallet to explore</Text>
          <ConnectWalletButton />
        </Stack>
      </Center>
    )
  }

  return (
    <Layout title="Dashboard">
      <BuyAndSellBanner />
      <AccountNavBar account={account || undefined} />
      <Grid templateRows="auto" templateColumns={{ base: '1fr', lg: '1fr 300px' }} columnGap={8}>
        <GridItem>{renderMain()}</GridItem>
        <GridItem display={{ base: 'none', lg: 'block' }} pos="sticky" top="160px" h="fit-content">
          <Stack>
            <RunningAuctions />
            <Divider />
            <LatestListings />
          </Stack>
        </GridItem>
      </Grid>
    </Layout>
  )
}

interface MyCreationsProps {
  account: string
}

function MyCreations({ account }: MyCreationsProps) {
  const fetchTokensParams = useFetchTokens({ defaultValue: { address: account, sortBy: 'createdAt' }, id: 'dashboard' })

  const { setAddress } = fetchTokensParams

  useEffect(() => {
    setAddress(account)
  }, [setAddress, account])

  return (
    <FetchTokensProvider value={fetchTokensParams} id="dashboard">
      <NftCardPage />
    </FetchTokensProvider>
  )
}
