import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/modal'
import CustomTokenList from './CustomTokenList'

export type CustomTokenModalProps = Omit<ModalProps, 'children'>

export default function CustomTokenModal(props: CustomTokenModalProps) {
  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Custom Tokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CustomTokenList />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
