import { useEffect } from 'react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/modal'
import FollowerList from 'components/info/FollowerList'
// import { useLazyFollowersQuery } from '@x/apis'
import { useLazyFollowersQuery } from '@x/apis'

export interface FollowerListModalProps extends Omit<ModalProps, 'children'> {
  address: string
}

export default function FollowerListModal({ address, isOpen, onClose, ...props }: FollowerListModalProps) {
  const [fetch, { data, isLoading }] = useLazyFollowersQuery()

  useEffect(() => {
    if (isOpen) fetch({ address })
  }, [fetch, address, isOpen])

  useEffect(() => onClose(), [address, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Followers</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FollowerList followers={data?.data} isLoading={isLoading} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
