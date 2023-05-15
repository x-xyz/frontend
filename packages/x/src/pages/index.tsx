import Introduction from 'components/home/Introduction'
import LatestCollections from 'components/home/LatestCollections'
import Team from 'components/home/Team'
import TopCollections from 'components/home/TopCollections'
import XposureSection from 'components/home/XposureSection'
import Layout from 'components/Layout/v3'
import { isFeatureEnabled } from 'flags'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Box } from '@chakra-ui/react'
import * as yugaConfig from 'configs/yuga-collections'
import { ChainId } from '@x/models/dist'

export const getServerSideProps = createServerSidePropsGetter(void 0)

export default function Home() {
  return (
    <Layout>
      <XposureSection
        images={yugaConfig.collections.map(c => ({
          chainId: ChainId.Ethereum,
          address: c.contract,
          src: c.image,
        }))}
      />
      <Box h={14} />
      <LatestCollections />
      {isFeatureEnabled('homepage.top-collections') && (
        <>
          <Box h={14} />
          <TopCollections />
        </>
      )}
      <Box h={14} />
      <Introduction />
      <Team />
      <Box h={14} borderBottomWidth="1px" borderBottomColor="divider" />
    </Layout>
  )
}
