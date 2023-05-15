import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react'
import { findToken, getChain } from '@x/constants'
import { ChainId } from '@x/models'
import ModalIcon from './ModalIcon'

export interface WrapNativeExplanationModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
}

export default function WrapNativeExplanationModal({ chainId, ...props }: WrapNativeExplanationModalProps) {
  const nativeToken = getChain(chainId).nativeCurrency
  const nativeSymbol = nativeToken.symbol
  const wrappedToken = findToken(`W${nativeSymbol}`, chainId)
  const wrappedSymbol = `W${nativeSymbol}`

  return (
    <Modal variant="info" {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ModalIcon>
            <Image src="/assets/v3/ico-info-56x56.png" />
          </ModalIcon>
          {`Converting ${nativeSymbol} to ${wrappedSymbol}`}
        </ModalHeader>
        <ModalBody>
          Converting {nativeSymbol} to {wrappedSymbol} is a 1:1 exchange, so you can convert it anytime required.
          <br />
          <br />
          {wrappedSymbol} ( {wrappedToken?.name} ) is a cryptocurrency used to make bids for NFTs.
          <br />
          <br />
          The first time you convert {nativeSymbol} into {wrappedSymbol} when a sale occurs, a second transaction is
          needed to approve the X Marketplace to access your {wrappedSymbol}. This only happens once per user.
        </ModalBody>
        <ModalFooter>
          <Button w="full" onClick={props.onClose}>
            Got It!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
