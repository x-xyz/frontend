import { Badge, Box, BoxProps, Center, Spacer, Stack, Text } from '@chakra-ui/react'
import { Folder } from '@x/models'
import StackIcon from 'components/icons/StackIcon'
import Link from 'components/Link'
import Price from 'components/v3/Price'

export interface FolderProps extends BoxProps {
  owner: string
  folder: Folder
  folderTitle?: string
  folderSubtitle?: string
  isOwner?: boolean
}

export default function FolderCard({ owner, folder, folderTitle, folderSubtitle, isOwner, ...props }: FolderProps) {
  return (
    <Link href={`/account/${owner}/folder/${folder.id}`}>
      <Box w="240px" h="350px" bg="#000" fontSize="sm" {...props}>
        <Center
          w="full"
          h="240px"
          borderBottomWidth="1px"
          borderBottomColor="divider"
          flexDirection="column"
          overflow="hidden"
        >
          {folderTitle && (
            <Text fontSize="4xl" fontWeight="extrabold" color={folder.isBuiltIn ? 'primary' : ''}>
              {folderTitle}
            </Text>
          )}
          {folderSubtitle && (
            <Text mx={4} fontWeight="bold" textAlign="center" color={folder.isBuiltIn ? 'primary' : ''}>
              {folderSubtitle}
            </Text>
          )}
          {!folder.isBuiltIn && (
            <Text fontSize="4xl" fontWeight="extrabold">
              {folder.name}
            </Text>
          )}
        </Center>
        <Stack p={3} spacing={1}>
          <Stack direction="row" align="center" spacing={1}>
            <Text>{folder.name || folderTitle || '-'}</Text>
            <Spacer />
            <Text color="divider" lineHeight={0.8}>
              {folder.nftCount}
            </Text>
            <StackIcon color="divider" w={4} h={4} />
          </Stack>
          {folder.isPrivate ? (
            <Badge w="fit-content" variant="tag">
              PRIVATE
            </Badge>
          ) : (
            <Badge w="fit-content" variant="tag" bg="success">
              PUBLIC
            </Badge>
          )}
          <Spacer />
          <Stack direction="row" align="flex-start">
            <Price label="Total Folder Value" price={folder.totalValueInUsd} unit="USD" />
            <Stack align="flex-end" spacing={0}>
              <Link color="primary" href={`/account/${owner}/folder/${folder.id}`}>
                View
              </Link>
              {isOwner && (
                <Link color="primary" href={`/account/${owner}/folder/${folder.id}/edit`}>
                  Edit
                </Link>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Link>
  )
}
