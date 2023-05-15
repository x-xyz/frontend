import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import TransferOverlay, { TransferOverlayProps } from './TransferOverlay'
import Web3CheckButton from '../Web3CheckButton'

export interface TransferButtonProps extends ButtonProps {
  chainId: TransferOverlayProps['chainId']
  contractAddress: TransferOverlayProps['contractAddress']
  tokenId: TransferOverlayProps['tokenId']
  tokenSpec: TransferOverlayProps['tokenSpec']
  onTransferred?: TransferOverlayProps['onTransferred']
}

export default function TransferButton({
  chainId,
  contractAddress,
  tokenId,
  tokenSpec,
  onTransferred,
  ...props
}: TransferButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Web3CheckButton expectedChainId={chainId} variant="solid" onClick={onOpen} {...props}>
        Transfer
      </Web3CheckButton>
      <TransferOverlay
        chainId={chainId}
        contractAddress={contractAddress}
        tokenId={tokenId}
        tokenSpec={tokenSpec}
        onTransferred={onTransferred}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
