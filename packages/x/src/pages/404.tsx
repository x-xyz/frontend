import Image from 'next/image'
import { Box, Heading, Stack } from '@chakra-ui/react'

export default function Index() {
  return (
    <>
      <Box
        position="fixed"
        width="100%"
        height="100%"
        backgroundImage="url(/assets/bg-color.png)"
        backgroundRepeat="no-repeat"
        backgroundPosition="bottom right"
        zIndex={-1}
      />
      <Box position="fixed" width="100%" height="100%" backgroundImage="url(/assets/bg-grid.png)" zIndex={-1} />
      <Stack justifyContent="center" alignItems="center" spacing={14} width="100vw" height="100vh">
        <Image src="/assets/logo.svg" width="232px" height="218px" />
        <Heading fontSize="2xl" textAlign="center" lineHeight="base">
          X is a Decentralized, community-owned NFT marketplace
        </Heading>
      </Stack>
    </>
  )
}
