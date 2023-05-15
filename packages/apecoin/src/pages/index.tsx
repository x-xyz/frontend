import { useBreakpointValue } from '@chakra-ui/react'
import Layout from 'components/Layout'

import { Box, Container, Flex, Stack, Text } from '@chakra-ui/layout'

import TopCollections from '../components/home/TopCollections'
import Image from '../components/Image'
import { useQuery } from 'react-query'
import { ResponseOf } from '@x/models/dist'
import React from 'react'
import { SkeletonText } from '@chakra-ui/skeleton'

export default function Index() {
  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

  const { data: { data } = {}, isLoading } = useQuery<ResponseOf<{ apeburned: number }>>('/statistics/apeburned')

  return (
    <Layout>
      <Container maxW="1200px" mb="80px">
        <Stack spacing={7}>
          <Stack py={useDesktopView ? 15 : 4} alignItems="center" spacing={useDesktopView ? 4 : 8}>
            <Box>
              {useDesktopView && <Image src="/assets/x.svg" />}
              <Text variant="headline6">X Marketplace</Text>
            </Box>
            {useDesktopView ? (
              <Text textAlign="center">
                The first marketplace for the NFT economy, built for Apes by Apes.
                <br />
                At X Marketplace you have control: Burn or Donate?
                <br />
                We’ll Burn or Donate 100% of the fees from $APE sales and 50% from all other sales.
                <br />
                All fees will be burned/donated in $APE.
              </Text>
            ) : (
              <Stack spacing={0}>
                <Text textAlign="center">The first marketplace for the NFT economy, built for Apes by Apes.</Text>
                <Text textAlign="center">100% of marketplace fees in $APE sales are burned.</Text>
                <Text textAlign="center">50% of marketplace fees for all other sales are burned.</Text>
                <Text textAlign="center">All fees will be burned in $APE.</Text>
              </Stack>
            )}
            {!useDesktopView && (
              <Flex direction="column" alignItems="center">
                <Stack direction="row" alignItems="center" letterSpacing="-1px">
                  <Text color="primary">ApeCoin Burned =</Text>
                  <SkeletonText minW={4} noOfLines={1} isLoaded={!isLoading} color="white">
                    {(data?.apeburned || 0).toLocaleString()}
                  </SkeletonText>
                </Stack>
                <Text whiteSpace="nowrap" letterSpacing="-1px" color="primary">
                  Marketplace Fee ={' '}
                  <Text as="span" color="white">
                    0.25%
                  </Text>{' '}
                  ($APE)/
                  <Text as="span" color="white">
                    0.50%
                  </Text>{' '}
                  (others)
                </Text>
              </Flex>
            )}
          </Stack>
        </Stack>
        <TopCollections />
        {!useDesktopView && (
          <Flex justifyContent="center" alignItems="center" h="8.75rem">
            <Stack direction="row" alignItems="center" letterSpacing="-1px" fontWeight={500}>
              <Text>Total ApeCoin Burned =</Text>
              <SkeletonText minW={4} noOfLines={1} isLoaded={!isLoading} color="white">
                {(data?.apeburned || 0).toLocaleString()}
              </SkeletonText>
              <Image src="/assets/ico-apecoin.png" w={6} h={6} />
            </Stack>
          </Flex>
        )}
      </Container>
    </Layout>
  )
}
