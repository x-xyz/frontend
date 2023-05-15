import { Button } from '@chakra-ui/button'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { useActiveWeb3React } from '@x/hooks'
import { ChainId } from '@x/models'

interface SwitchChainModalProps {
  isOpen: boolean
  onClose: () => void
  chainId: ChainId
  chainName: string
}

function SwitchChainModal({ isOpen, onClose, chainId, chainName }: SwitchChainModalProps) {
  const { switchChain, isWaitingApprovalForSwitchingChain } = useActiveWeb3React()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Please switch to {chainName}
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          {`You are not connected to the right network. Please select ${chainName} within your wallet to proceed.`}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => switchChain(chainId)} isLoading={isWaitingApprovalForSwitchingChain}>
            Switch to {chainName}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SwitchChainModal
