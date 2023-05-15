import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { ChainId, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'

export interface RequestSwitchChainButtonProps extends ButtonProps {
  expectedChainId?: ChainId
  reason?: string
}

export default function RequestSwitchChainButton({
  expectedChainId = ChainId.Fantom,
  reason,
  children,
  ...props
}: RequestSwitchChainButtonProps) {
  const { isOpen, onClose, onOpen } = useDisclosure()

  const chain = getChain(expectedChainId)

  const { switchChain, isWaitingApprovalForSwitchingChain } = useActiveWeb3React()

  return (
    <>
      <Button onClick={onOpen} {...props}>
        {children}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Please switch to {chain.name}
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            {reason ||
              `You are not connected to the right network. Please select ${chain.name} within your wallet to proceed.`}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => switchChain(expectedChainId)}
              isLoading={isWaitingApprovalForSwitchingChain}
            >
              Switch to {chain.name}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
