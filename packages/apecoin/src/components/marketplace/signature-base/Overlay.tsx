import {
  Drawer as ChakraDrawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Modal as ChakraModal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import CloseIcon from '../../icons/CloseIcon'

interface OverlayProps {
  title: string
  isOpen: boolean
  onClose: () => void
  showCloseButton: boolean
  children: React.ReactNode
}

export default function Overlay(props: OverlayProps) {
  const useDesktopView = useBreakpointValue({ base: false, lg: true })
  return useDesktopView ? <Modal {...props} /> : <Drawer {...props} />
}

function Modal({ isOpen, onClose, title, showCloseButton, children }: OverlayProps) {
  return (
    <ChakraModal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justifyContent="space-between">
            <Text>{title}</Text>
            {showCloseButton && (
              <IconButton aria-label="close modal" icon={<CloseIcon />} variant="unstyled" onClick={() => onClose()} />
            )}
          </HStack>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  )
}

function Drawer({ isOpen, onClose, showCloseButton, title, children }: OverlayProps) {
  return (
    <ChakraDrawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <HStack position="relative">
            <Text>{title}</Text>
            {showCloseButton && (
              <IconButton
                aria-label="close modal"
                position="absolute"
                right={0}
                icon={<CloseIcon />}
                variant="unstyled"
                onClick={() => onClose()}
              />
            )}
          </HStack>
        </DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
      </DrawerContent>
    </ChakraDrawer>
  )
}
