import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { ChainId, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import * as React from 'react'
import { useMemo } from 'react'
import SwitchChainModal from './SwitchChainModal'
import ConnectWalletModal from './wallet/ConnectWalletModal'

export interface Web3CheckButtonProps extends ButtonProps {
  expectedChainId: ChainId
  onClick: React.MouseEventHandler
}

export default function Web3CheckButton({ expectedChainId, onClick, children, ...props }: Web3CheckButtonProps) {
  const { isOpen, onClose, onOpen } = useDisclosure()

  const chain = getChain(expectedChainId)

  const { active, chainId } = useActiveWeb3React()

  const isReady = active && chainId === expectedChainId

  const modal = useMemo(() => {
    if (isReady) return null
    if (!active) {
      return <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
    }
    if (chainId !== expectedChainId) {
      return <SwitchChainModal isOpen={isOpen} onClose={onClose} chainId={expectedChainId} chainName={chain.name} />
    }
  }, [active, chain.name, chainId, expectedChainId, isOpen, isReady, onClose])

  return (
    <>
      <Button variant="solid" onClick={isReady ? onClick : onOpen} {...props}>
        {children}
      </Button>
      {modal}
    </>
  )
}
