import { Stack, Text } from '@chakra-ui/layout'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spacer,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react'
import { Collection } from '@x/models/dist'
import { EmailShareButton, FacebookShareButton, TelegramShareButton, TwitterShareButton } from 'react-share'
import CopyIcon from '../../../icons/CopyIcon'
import EllipsisIcon from '../../../icons/EllipsisIcon'
import EmailIcon from '../../../icons/EmailIcon'
import FacebookIcon from '../../../icons/FacebookIcon'
import TelegramIcon from '../../../icons/TelegramIcon'
import TwitterIcon from '../../../icons/TwitterIcon'
import Link from '../../../Link'

interface OptionsProps {
  collection?: Collection
}

function Options({ collection }: OptionsProps) {
  const url = process.browser ? `${location.origin}${location.pathname}` : ''
  const { onCopy: copyUrl, hasCopied: hasCopiedUrl } = useClipboard(url)

  if (!collection) {
    return null
  }

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
              {collection.siteUrl && renderWithLink('Website', collection.siteUrl)}
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
                      Share to Twitter
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
                      Share on Facebook
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
                      Share on Telegram
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
                      Share via Email
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

export default Options
