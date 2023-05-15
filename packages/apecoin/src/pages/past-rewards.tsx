import Layout from 'components/Layout'
import RewardCard from 'components/RewardCard'
import { useMemo } from 'react'

import { Center, Flex } from '@chakra-ui/react'
import { useAirdropsQuery } from '@x/apis'
import { findToken } from '@x/constants'

export default function PastRewards() {
  const { data } = useAirdropsQuery()
  const airdrops = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [data])
  return (
    <Layout>
      <Center>
        <Flex flexWrap="wrap" maxW={{ base: '368px', sm: '368px', md: '736px', lg: '1104px' }}>
          {airdrops.map((airdrop, index) => {
            const token = findToken(airdrop.rewardTokenAddress, airdrop.chainId)
            return <RewardCard m={1} key={index} airdrop={airdrop} token={token} />
          })}
        </Flex>
      </Center>
    </Layout>
  )
}
