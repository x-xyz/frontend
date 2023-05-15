import { Button } from '@chakra-ui/button'
import { Box, BoxProps, Center } from '@chakra-ui/layout'
import { ChainId, defaultNetwork, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import ConnectWalletButton from './wallet/ConnectWalletButton'

export interface EnsureConsistencyChainProps extends BoxProps {
  expectedChainId?: ChainId
  children: React.ReactNode
  noOverlay?: boolean
}

export default function EnsureConsistencyChain({
  expectedChainId = defaultNetwork,
  children,
  noOverlay,
  ...props
}: EnsureConsistencyChainProps) {
  const { chainId, switchChain, isWaitingApprovalForSwitchingChain, account } = useActiveWeb3React()

  function renderButton() {
    if (!account) return <ConnectWalletButton />
    return (
      <Button onClick={() => switchChain(expectedChainId)} isLoading={isWaitingApprovalForSwitchingChain}>
        Switch to {getChain(expectedChainId).name}
      </Button>
    )
  }

  function renderOverlay() {
    return (
      <Center position="absolute" top={0} left={0} w="100%" h="100%" zIndex={10}>
        {!noOverlay && <Box position="absolute" top={0} left={0} w="100%" h="100%" bg="rgba(0, 0, 0, 0.6)" />}
        {renderButton()}
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
