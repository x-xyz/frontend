import Layout from 'components/Layout/wagmi'
import projects from 'components/Layout/wagmi/wagmi-2'
import NftCardPage from 'components/token/NftCardPage'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import Image from 'next/image'
import { useEffect } from 'react'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center, Stack, Text } from '@chakra-ui/layout'
import { FetchTokensProvider, useActiveWeb3React, useFetchTokens } from '@x/hooks'
import { isFeatureEnabled } from 'flags'

export const getServerSideProps = createServerSidePropsGetter(void 0, {
  requrieAuth: !isFeatureEnabled('promotion-page'),
})

export default function Apes() {
  const { account } = useActiveWeb3React()

  function render() {
    if (account) return <MyApes account={account} />

    return (
      <Center p={24}>
        <Stack alignItems="center" spacing={10}>
          <Image src="/assets/excited.png" width="200px" height="156px" />
          <Text fontSize="2xl">Connect your wallet to explore</Text>
          <ConnectWalletButton />
        </Stack>
      </Center>
    )
  }

  return (
    <Layout title="Monthly Special Promotion" assetsFolder="/assets/wagmi-1" projects={projects}>
      {render()}
    </Layout>
  )
}

function MyApes({ account }: { account: string }) {
  const fetchTokeParams = useFetchTokens({
    defaultValue: {
      address: account,
      sortBy: 'createdAt',
      collections: projects.map(p => p.address),
    },
  })

  const { setAddress } = fetchTokeParams

  useEffect(() => {
    setAddress(account)
  }, [setAddress, account])

  return (
    <FetchTokensProvider value={fetchTokeParams}>
      <NftCardPage hidePanels={['chain', 'category', 'collections']} />
    </FetchTokensProvider>
  )
}
