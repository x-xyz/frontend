import CollectionList from 'components/signature-base/bulk-listing/CollectionList'
import { Layout, MobileLayout } from 'components/signature-base/bulk-listing/Layout'
import TokenList from 'components/signature-base/bulk-listing/TokenList'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { useState } from 'react'

import { Box, Grid, GridItem, Image, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks'
import { Collection } from '@x/models'

export default function BulkListing() {
  const useDesktopView = useBreakpointValue({ base: false, lg: true })

  return useDesktopView ? <DesktopBulkListing /> : <MobileBulkListing />
}

function ConnectWallet() {
  return (
    <Stack alignItems="center" pt={20} spacing={5}>
      <Image src="/assets/wallet_connect.png" />
      <Text fontWeight="bold" color="value" textAlign="center">
        Please connect your wallet to begin listing.
      </Text>
      <ConnectWalletButton variant="solid" p={2} />
    </Stack>
  )
}

function DesktopBulkListing() {
  const { account } = useActiveWeb3React()
  const [selectedCollection, setSelectedCollection] = useState<Collection>()

  return (
    <Layout>
      {account ? (
        <Grid w="full" h="full" templateColumns="380px 1fr" columnGap={5}>
          <GridItem p={5} pl={0} borderRight="1px solid" borderColor="divider">
            {account && <CollectionList account={account} onCollectionSelected={setSelectedCollection} />}
          </GridItem>
          <GridItem p={5} pr={0}>
            {account && selectedCollection && <TokenList account={account} collection={selectedCollection} />}
          </GridItem>
        </Grid>
      ) : (
        <ConnectWallet />
      )}
    </Layout>
  )
}

function MobileBulkListing() {
  const { account } = useActiveWeb3React()
  const [selectedCollection, setSelectedCollection] = useState<Collection>()

  return (
    <MobileLayout>
      {account ? (
        <Stack spacing={10} mt={5}>
          <Box>
            <Text w="fit-content" mb={5} fontWeight="extrabold" borderBottom="4px solid" borderColor="primary">
              01. Collection Approval
            </Text>
            {account && <CollectionList account={account} onCollectionSelected={setSelectedCollection} />}
          </Box>
          <Box>
            <Text w="fit-content" mb={5} fontWeight="extrabold" borderBottom="4px solid" borderColor="primary">
              02. NFT Listing
            </Text>
            {account && selectedCollection && <TokenList account={account} collection={selectedCollection} />}
          </Box>
        </Stack>
      ) : (
        <ConnectWallet />
      )}
    </MobileLayout>
  )
}
