import EllipsisIcon from 'components/icons/EllipsisIcon'

import {
  ListItem,
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
  List,
  Button,
  IconButton,
  Spacer,
  Box,
  useClipboard,
  Tooltip,
} from '@chakra-ui/react'
import { Collection } from '@x/models'
import TwitterIcon from 'components/icons/TwitterIcon'
import FacebookIcon from 'components/icons/FacebookIcon'
import TelegramIcon from 'components/icons/TelegramIcon'
import CopyIcon from 'components/icons/CopyIcon'
import EmailIcon from 'components/icons/EmailIcon'
import Link from 'components/Link'
import { FacebookShareButton, TwitterShareButton, TelegramShareButton, EmailShareButton } from 'react-share'

export interface CollectionMenuProps {
  collection: Collection
}

export default function CollectionMenu({ collection }: CollectionMenuProps) {
  const url = process.browser ? `${location.origin}${location.pathname}` : ''

  const { onCopy: copyUrl, hasCopied: hasCopiedUrl } = useClipboard(url)

  function renderWithLink(label: string, url: string) {
    return (
      <ListItem>
        <Link href={url} fontSize="sm" fontWeight="bold" w="full" display="inline-block">
          {label}
        </Link>
      </ListItem>
    )
  }

  return (
    <Popover placement="bottom-end">
      {() => (
        <>
          <PopoverTrigger>
            <IconButton
              variant="icon"
              w={10}
              h={10}
              p={0}
              border="1px solid"
              borderColor="divider"
              borderRadius="20px"
              overflow="hidden"
              icon={<EllipsisIcon w="full" h="full" color="primary" />}
              aria-label="Collection Menu"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <Stack direction="row" h="full" align="center">
                <Text fontSize="lg" variant="emphasis">
                  Options
                </Text>
                <Spacer />
                <PopoverCloseButton pos="unset" />
              </Stack>
            </PopoverHeader>

            <List variant="reactable" px={3}>
              {/* <ListItem>Add to Watchlist</ListItem> */}
              {collection.siteUrl && renderWithLink('Website', collection.siteUrl)}
              {collection.discord && renderWithLink('Discord', collection.discord)}
              {collection.instagramHandle && renderWithLink('Instagram', collection.instagramHandle)}
              {collection.twitterHandle && renderWithLink('Twitter', collection.twitterHandle)}
              {/* <ListItem>Report</ListItem> */}
              <ListItem
                borderTopWidth="1px"
                borderBottomWidth="1px"
                borderColor="divider"
                fontSize="xs"
                fontWeight="bold"
                color="note"
                mx={-3}
                px={5}
              >
                Share To
              </ListItem>
              <ListItem>
                <TwitterShareButton
                  style={{ width: '100%' }}
                  title={`Check out ${collection.collectionName} on X!`}
                  url={url}
                  hashtags={[collection.collectionName, 'Xdotxyz']}
                >
                  <Stack direction="row" align="center">
                    <Box w={7} h={7} border="1px solid" borderColor="divider" borderRadius="14px" overflow="hidden">
                      <TwitterIcon color="primary" />
                    </Box>
                    <Text as="span" fontSize="sm" fontWeight="bold" color="currentcolor">
                      Twitter
                    </Text>
                  </Stack>
                </TwitterShareButton>
              </ListItem>
              <ListItem>
                <FacebookShareButton
                  style={{ width: '100%' }}
                  quote={`Check out ${collection.collectionName} on X!`}
                  url={url}
                  hashtag={[collection.collectionName, 'Xdotxyz'].join(',')}
                >
                  <Stack direction="row" align="center">
                    <Box w={7} h={7} border="1px solid" borderColor="divider" borderRadius="14px" overflow="hidden">
                      <FacebookIcon color="primary" />
                    </Box>
                    <Text as="span" fontSize="sm" fontWeight="bold" color="currentcolor">
                      Facebook
                    </Text>
                  </Stack>
                </FacebookShareButton>
              </ListItem>
              <ListItem>
                <TelegramShareButton
                  style={{ width: '100%' }}
                  title={`Check out ${collection.collectionName} on X!`}
                  url={url}
                >
                  <Stack direction="row" align="center">
                    <Box w={7} h={7} border="1px solid" borderColor="divider" borderRadius="14px" overflow="hidden">
                      <TelegramIcon color="primary" />
                    </Box>
                    <Text as="span" fontSize="sm" fontWeight="bold" color="currentcolor">
                      Telegram
                    </Text>
                  </Stack>
                </TelegramShareButton>
              </ListItem>

              <ListItem>
                <EmailShareButton
                  style={{ width: '100%' }}
                  subject={`Check out ${collection.collectionName} on X!`}
                  url={url}
                >
                  <Stack direction="row" align="center">
                    <Box w={7} h={7} border="1px solid" borderColor="divider" borderRadius="14px" overflow="hidden">
                      <EmailIcon color="primary" />
                    </Box>
                    <Text as="span" fontSize="sm" fontWeight="bold" color="currentcolor">
                      Email
                    </Text>
                  </Stack>
                </EmailShareButton>
              </ListItem>
              <ListItem>
                <Button w="full" variant="unstyled" fontSize="sm" fontWeight="bold" onClick={copyUrl}>
                  <Stack direction="row" align="center">
                    <Box w={7} h={7} border="1px solid" borderColor="divider" borderRadius="14px" overflow="hidden">
                      <CopyIcon color="primary" />
                    </Box>
                    <Tooltip label="Copied" placement="top" isOpen={hasCopiedUrl}>
                      <Text as="span" fontSize="sm" fontWeight="bold" color="currentcolor">
                        Copy Link
                      </Text>
                    </Tooltip>
                  </Stack>
                </Button>
              </ListItem>
            </List>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
