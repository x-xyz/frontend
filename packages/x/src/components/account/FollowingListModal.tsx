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
// import { useLazyFollowingsQuery } from '@x/apis'
import { useLazyFollowingsQuery } from '@x/apis'

export interface FollowingListModalProps extends Omit<ModalProps, 'children'> {
  address: string
}

export default function FollowingListModal({ address, isOpen, onClose, ...props }: FollowingListModalProps) {
  const [fetch, { data, isLoading }] = useLazyFollowingsQuery()

  useEffect(() => {
    if (isOpen) fetch({ address })
  }, [fetch, address, isOpen])

  useEffect(() => onClose(), [address, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Followings
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <FollowerList followers={data?.data} isLoading={isLoading} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
