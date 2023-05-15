import { Button } from '@chakra-ui/button'
import { Box, BoxProps, Center } from '@chakra-ui/layout'
import { ChainId, defaultNetwork, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'

export interface EnsureConsistencyChainProps extends BoxProps {
  expectedChainId?: ChainId
  children: React.ReactNode
}

export default function EnsureConsistencyChain({
  expectedChainId = defaultNetwork,
  children,
  ...props
}: EnsureConsistencyChainProps) {
  const { chainId = defaultNetwork, switchChain, isWaitingApprovalForSwitchingChain } = useActiveWeb3React()

  function renderOverlay() {
    return (
      <Center position="absolute" top={0} left={0} w="100%" h="100%">
        <Box position="absolute" top={0} left={0} w="100%" h="100%" bg="rgba(0, 0, 0, 0.6)" />
        <Button onClick={() => switchChain(expectedChainId)} isLoading={isWaitingApprovalForSwitchingChain}>
          Switch to {getChain(expectedChainId).name}
        </Button>
      </Center>
    )
  }

  return (
    <Box position="relative" {...props}>
      {children}
      {chainId !== expectedChainId && renderOverlay()}
    </Box>
  )
}
