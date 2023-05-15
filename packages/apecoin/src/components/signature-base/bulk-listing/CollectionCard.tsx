import StackIcon from 'components/icons/StackIcon'
import Media from 'components/Media'
import CollectionApproveButton from 'components/signature-base/CollectionApproveButton'

import { AspectRatio, Center, Image, Stack, StackProps, Text } from '@chakra-ui/react'
import { addresses } from '@x/constants/dist'
import { useErc721ApprovalForAll } from '@x/hooks'
import { Collection, TokenType } from '@x/models'

export interface CollectionCardProps extends StackProps {
  collection: Collection
  owner: string
  selected?: boolean
}

export default function CollectionCard({ collection, owner, ...props }: CollectionCardProps) {
  const { tokenType, chainId, erc721Address } = collection
  const addressMap = tokenType === TokenType.Erc721 ? addresses.transferManagerErc721 : addresses.transferManagerErc1155
  const spender = addressMap[chainId]
  const [approved, isLoadingApproved] = useErc721ApprovalForAll(chainId, erc721Address, owner, spender)

  return (
    <Presentation
      collection={collection}
      isLoadingApproved={isLoadingApproved}
      approved={approved}
      spender={spender}
      {...props}
    />
  )
}

interface PresentationProps extends StackProps {
  collection: Collection
  isLoadingApproved: boolean
  approved?: boolean
  selected?: boolean
  spender?: string
}

function Presentation({ collection, isLoadingApproved, approved, selected, spender, ...props }: PresentationProps) {
  return (
    <Stack
      direction="row"
      border="1px solid"
      borderColor={selected ? 'primary' : 'divider'}
      w="full"
      h="70px"
      p="10px"
      spacing="10px"
      {...props}
    >
      <AspectRatio ratio={1} w="50px" flexShrink={0}>
        {collection.logoImageUrl ? (
          <Image src={collection.logoImageUrl} />
        ) : (
          <Media src={collection.logoImageHash} contentType="image" />
        )}
      </AspectRatio>
      <Stack spacing={0} flexGrow={1} maxW="167px">
        <Text fontSize="sm" color="text" isTruncated>
          {collection.collectionName}
        </Text>
        <Stack direction="row" align="center">
          <StackIcon color="divider" w={4} h={4} />
          <Text color="value">{collection.holdingBalance || collection.holdingCount || 0}</Text>
        </Stack>
      </Stack>
      <Center w="100px" h="full">
        {approved ? (
          <Text color="primary">Approved</Text>
        ) : (
          <CollectionApproveButton
            minW="unset"
            isLoading={isLoadingApproved}
            disabled={isLoadingApproved}
            collection={collection}
            spender={spender}
          >
            Approve
          </CollectionApproveButton>
        )}
      </Center>
    </Stack>
  )
}
