import { Grid, GridItem } from '@chakra-ui/layout'
import { useAirdropsQuery } from '@x/apis/dist'
import { findToken } from '@x/constants/dist'
import Layout from 'components/Layout/v3'
import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Center, Container, Heading } from '@chakra-ui/react'
import { Category, ChainId, Collection } from '@x/models'
import RewardCard from 'components/RewardCard'

const breakpoint = 'lg'
const cardGap = 40

interface Props {
  defaultChainId?: ChainId
  defaultCategory?: Category
}

interface ItemData {
  items: Collection[]
  columnCount: number
  isLoading?: boolean
  cardScale: number
}

export default function Rewards({ defaultChainId, defaultCategory }: Props) {
  const { data, isLoading } = useAirdropsQuery()
  const airdrops = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [data])

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  const cardWidth = useMemo(() => {
    const defaultWidth = 360
    if (!containerRect) return defaultWidth
    return Math.min(defaultWidth, containerRect.width - cardGap)
  }, [containerRect])

  const columnWidth = cardWidth + cardGap

  const columnCount = useMemo(
    () => Math.floor((containerRect?.width || 0) / columnWidth) || 1,
    [containerRect, columnWidth],
  )

  const containerPaddingX = ((containerRect?.width || 0) - columnWidth * columnCount) / 2

  useEffect(() => {
    const resize = throttle(() => {
      if (!containerRef.current) return
      setContainerRect(containerRef.current.getBoundingClientRect())
    }, 10)

    if (!containerRef.current) return

    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(containerRef.current)

    return () => {
      resize.cancel()
      observer.disconnect()
    }
  }, [])

  return (
    <Layout>
      <Center
        bgImg={{
          base: 'url(/assets/v3/mobile_rewards_banner_640x120_bg.jpg)',
          md: 'url(/assets/v3/rewards_banner_2560x120_bg.jpg)',
        }}
        bgSize="auto 100%"
        bgRepeat="no-repeat"
        bgPos="center"
        h="120px"
        borderBottomWidth="1px"
        borderColor="divider"
        alignItems="flex-end"
        pb={3}
      >
        <Container maxW="container.xl">
          <Heading textAlign={{ base: 'center', [breakpoint]: 'unset' }}>Rewards</Heading>
        </Container>
      </Center>
      <Center>
        <Container
          px={containerPaddingX}
          maxW={{ base: 'container.xl', '2xl': 'container.2xl' }}
          mb="80px"
          ref={containerRef}
        >
          <Grid templateColumns="repeat(auto-fit, 400px)" rowGap={10} mt={10}>
            {airdrops.length > 0 ? (
              airdrops.map((airdrop, idx) => {
                const token = airdrop && findToken(airdrop.rewardTokenAddress, airdrop.chainId)
                if (!token) return null

                return (
                  <GridItem key={idx} d="flex" justifyContent="center">
                    <RewardCard airdrop={airdrop} token={token} />
                  </GridItem>
                )
              })
            ) : (
              <GridItem d="flex" justifyContent="center">
                <RewardCard />
              </GridItem>
            )}
          </Grid>
        </Container>
      </Center>
    </Layout>
  )
}
