import Image from 'components/Image'
import CollectionApproveButton from 'components/signature-base/CollectionApproveButton'
import { useCallback, useEffect, useRef } from 'react'

import {
  AspectRatio,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { addresses } from '@x/constants'
import { useErc721ApprovalForAll } from '@x/hooks/dist'
import { Collection, TokenType } from '@x/models'

export interface CollectionApprovalModalProps extends Omit<ModalProps, 'children'> {
  collections: Collection[]
  owner: string
  onAllApproved?: () => void
}

export default function CollectionApprovalModal({
  collections,
  owner,
  onAllApproved,
  ...props
}: CollectionApprovalModalProps) {
  const approvedCount = useRef(0)
  const onApproved = useCallback(() => {
    approvedCount.current += 1
    if (approvedCount.current === collections.length) {
      onAllApproved?.()
    }
  }, [collections, onAllApproved])

  const { isOpen } = props

  useEffect(() => {
    // reset count
    if (isOpen) approvedCount.current = 0
  }, [isOpen])

  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Collection Approval
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <Text mb={8}>
            To begin listing, you will first need to approve the collection. This is a one-time gas fee for each approved
            collection. After this you can list as many NFTs as you wish.
          </Text>
          <Stack>
            {collections.map(collection => (
              <CollectionApprovalItem
                key={collection.erc721Address}
                collection={collection}
                owner={owner}
                onApproved={onApproved}
              />
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

interface CollectionApprovalItemProps {
  collection: Collection
  owner: string
  onApproved?: () => void
}

function CollectionApprovalItem({ collection, owner, onApproved }: CollectionApprovalItemProps) {
  const { collectionName, tokenType, chainId, erc721Address, logoImageUrl } = collection
  const addressMap = tokenType === TokenType.Erc721 ? addresses.transferManagerErc721 : addresses.transferManagerErc1155
  const spender = addressMap[chainId]
  const [approved, isLoadingApproved] = useErc721ApprovalForAll(chainId, erc721Address, owner, spender)

  useEffect(() => {
    if (approved) onApproved?.()
  }, [approved, onApproved])

  return (
    <Stack direction="row" borderColor="#575757" borderWidth="1px" p={4} align="center">
      <AspectRatio ratio={1} w="56px" flexShrink={0}>
        <Image src={logoImageUrl} />
      </AspectRatio>
      <Stack spacing={1} justify="center">
        <Text>{collectionName}</Text>
      </Stack>
      <Spacer />
      <CollectionApproveButton
        isLoading={isLoadingApproved}
        disabled={approved || isLoadingApproved}
        collection={collection}
        spender={spender}
      >
        {approved ? 'Approved' : 'Approve'}
      </CollectionApproveButton>
    </Stack>
  )
}
