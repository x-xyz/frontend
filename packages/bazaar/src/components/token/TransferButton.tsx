import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import TransferModal, { TransferModalProps } from './TransferModal'

export interface TransferButtonProps extends ButtonProps {
  chainId: TransferModalProps['chainId']
  contractAddress: TransferModalProps['contractAddress']
  tokenId: TransferModalProps['tokenId']
  tokenSpec: TransferModalProps['tokenSpec']
  onTransferred?: TransferModalProps['onTransferred']
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
      <Button onClick={onOpen} {...props}>
        Transfer
      </Button>
      <TransferModal
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
