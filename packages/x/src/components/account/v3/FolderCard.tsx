import { Badge, Box, BoxProps, Center, Divider, Spacer, Stack, Text } from '@chakra-ui/react'
import { Folder } from '@x/models'
import StackIcon from 'components/icons/StackIcon'
import Link from 'components/Link'
import Price from 'components/v3/Price'
import StatValue from '../../v3/StatValue'
import FolderCover from './FolderCover'

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
      <Box w="360px" h="500px" borderWidth="1px" borderColor="divider" boxSizing="border-box" {...props}>
        <Center
          w="full"
          h="360px"
          borderBottomWidth="1px"
          borderBottomColor="divider"
          flexDirection="column"
          overflow="hidden"
        >
          {folderTitle && (
            <Text fontSize="5xl" fontWeight="extrabold" color={folder.isBuiltIn ? 'primary' : ''}>
              {folderTitle}
            </Text>
          )}
          {folderSubtitle && (
            <Text fontWeight="bold" color={folder.isBuiltIn ? 'primary' : ''}>
              {folderSubtitle}
            </Text>
          )}
          {!folder.isBuiltIn && (
            <Text fontSize="5xl" fontWeight="extrabold">
              {folder.name}
            </Text>
          )}
        </Center>
        <Stack p={5} spacing={5}>
          <Stack direction="row" align="center" spacing={1}>
            {folder.isPrivate ? (
              <Badge variant="tag">PRIVATE</Badge>
            ) : (
              <Badge variant="tag" bg="success">
                PUBLIC
              </Badge>
            )}
            <Spacer />
            <Text color="divider" lineHeight={0.8}>
              {folder.nftCount}
            </Text>
            <StackIcon color="divider" w={4} h={4} />
          </Stack>
          <Stack direction="row" align="flex-start">
            {/* <Price label="Floor Price" price={folder.floorPriceInUsd} unit="USD" /> */}
            <Price label="Total Folder Value" price={folder.totalValueInUsd} unit="USD" />
            {/* <StatValue label="Total Folder Value" value="Coming Soon" /> */}
            <Stack align="flex-end">
              <Link color="primary" fontSize="lg" href={`/account/${owner}/folder/${folder.id}`}>
                View
              </Link>
              {isOwner && (
                <Link color="primary" fontSize="lg" href={`/account/${owner}/folder/${folder.id}/edit`}>
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
