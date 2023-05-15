import { Button } from '@chakra-ui/button'
import { Spacer, Stack, Text } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/react'
import GradientBox from './GradientBox'
import Link from './Link'

export default function BuyAndSellBanner() {
  return (
    <GradientBox w="100%" minH="250px" borderRadius="12px">
      <Stack
        pos="absolute"
        w="100%"
        h="100%"
        direction={{ base: 'column', lg: 'row' }}
        alignItems="center"
        pl={5}
        pr={16}
        py={8}
      >
        <Stack>
          <Text fontSize={{ base: '2xl', sm: '4xl' }} fontWeight="medium">
            Buy & Sell your NFTs
          </Text>
          <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight="medium">
            Best NFT Marketplace
          </Text>
        </Stack>
        <Spacer />
        <Stack direction="row">
          <Link href="/collections">
            <Button variant="primary" size={useBreakpointValue({ base: 'sm', sm: 'md' })}>
              Explore
            </Button>
          </Link>
          <Link href="/create">
            <Button size={useBreakpointValue({ base: 'sm', sm: 'md' })}>Create</Button>
          </Link>
        </Stack>
      </Stack>
    </GradientBox>
  )
}
