import { Box, Stack, Text } from '@chakra-ui/layout'
import CollectionList from 'components/signature-base/bulk-listing/CollectionList'
import Layout from 'components/signature-base/bulk-listing/Layout'
import TokenList from 'components/signature-base/bulk-listing/TokenList'
import { isFeatureEnabled } from 'flags'
import { useState } from 'react'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Grid, GridItem } from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks'
import { Collection } from '@x/models'

export const getServerSideProps = createServerSidePropsGetter(void 0, {
  requrieAuth: !isFeatureEnabled('bulk-listing'),
})

export default function BulkListing() {
  const { account } = useActiveWeb3React()
  const [selectedCollection, setSelectedCollection] = useState<Collection>()

  return (
    <Layout>
      <Grid w="full" h="full" templateColumns="380px 1fr" columnGap={5}>
        <GridItem p={5} pl={0} borderColor="divider">
          <Box>
            <Text fontWeight="extrabold">Import / Bulk Listing</Text>
            <Text mt={5} mb={8}>
              To begin listing, you will first need to approve the collection(s). There will be a one-time gas fee for
              each approved collection.
            </Text>
            {account && <CollectionList account={account} onCollectionSelected={setSelectedCollection} />}
          </Box>
        </GridItem>
        <GridItem p={5} pr={0}>
          {account && selectedCollection && <TokenList account={account} collection={selectedCollection} />}
        </GridItem>
      </Grid>
    </Layout>
  )
}
