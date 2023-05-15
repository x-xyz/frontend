import { useState } from 'react'

import { Button, HStack, ModalProps, Stack, Text, useBreakpointValue } from '@chakra-ui/react'

import Overlay from './Overlay'
import { Collection } from '@x/models/dist'
import Media from '../../Media'

export interface ApproveOverlayProps extends Omit<ModalProps, 'children'> {
  collection: Collection
  onApproveClicked: () => void
}

// ApproveOverlay shows an overlay with approve button which when clicked, calls `onApproveClicked`. It is parent's
// responsibility to call approve method on the contract and close this overlay once approved.
export default function ApproveOverlay({
  collection,
  onClose,
  isOpen,
  onApproveClicked,
  ...props
}: ApproveOverlayProps) {
  const [isApproving, setIsApproving] = useState(false)

  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

  return (
    <Overlay title="Collection Approval" isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <Stack spacing={8}>
        <Text variant="body2">
          To begin listing, you will first need to approve the collection. This is a one-time gas fee for each approved
          collection. After this you can list as many NFTs as you wish.
        </Text>
        <HStack p={4} border="1px solid" borderColor="line">
          <Media
            w="56px"
            h="56px"
            src={collection.logoImageUrl}
            contentType="image"
            borderRadius="4px"
            overflow="hidden"
          />
          <Text variant="subtitle2">{collection.collectionName}</Text>
        </HStack>
        <Stack direction={useDesktopView ? 'row' : 'column-reverse'} w="full" spacing={4}>
          <Button
            type="submit"
            variant="solid"
            w="100%"
            isLoading={isApproving}
            onClick={() => {
              setIsApproving(true)
              onApproveClicked()
            }}
          >
            Approve
          </Button>
        </Stack>
      </Stack>
    </Overlay>
  )
}
