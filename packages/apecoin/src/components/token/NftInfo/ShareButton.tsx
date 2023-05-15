import { Stack, Text } from '@chakra-ui/layout'
import {
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
import EllipsisIcon from '../../icons/EllipsisIcon'
import Link from '../../Link'
import ShareIcon from '../../icons/ShareIcon'

interface ShareButtonProps {
  collection?: Collection
}

function ShareButton({ collection }: ShareButtonProps) {
  const url = process.browser ? `${location.origin}${location.pathname}` : ''
  const { onCopy: copyUrl, hasCopied: hasCopiedUrl } = useClipboard(url)

  if (!collection) {
    return null
  }

  function renderWithLink(label: string, url: string) {
    return (
      <ListItem>
        <Link href={url} fontSize="sm" w="full" display="inline-block">
          {label}
        </Link>
      </ListItem>
    )
  }

  return (
    <Popover placement="bottom-end">
      {({ isOpen }) => (
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
              icon={<ShareIcon w={6} h={6} color={isOpen ? 'primary' : 'white'} />}
              aria-label="Collection Menu"
            />
          </PopoverTrigger>
          <PopoverContent border="1px solid" borderColor="primary">
            <List variant="reactable">
              <ListItem>
                <Button w="full" variant="unstyled" fontSize="sm" onClick={copyUrl}>
                  <Stack direction="row" align="center">
                    <Tooltip label="Copied" placement="top" isOpen={hasCopiedUrl}>
                      <Text as="span" fontSize="sm" color="currentcolor">
                        Copy Link
                      </Text>
                    </Tooltip>
                  </Stack>
                </Button>
              </ListItem>
              <ListItem>
                <FacebookShareButton
                  style={{ width: '100%' }}
                  quote={`Check out ${collection.collectionName} on X!`}
                  url={url}
                  hashtag={[collection.collectionName, 'Xdotxyz'].join(',')}
                >
                  <Stack direction="row" align="center">
                    <Text as="span" fontSize="sm" color="currentcolor">
                      Share on Facebook
                    </Text>
                  </Stack>
                </FacebookShareButton>
              </ListItem>
              <ListItem>
                <TwitterShareButton
                  style={{ width: '100%' }}
                  title={`Check out ${collection.collectionName} on X!`}
                  url={url}
                  hashtags={[collection.collectionName, 'Xdotxyz']}
                >
                  <Stack direction="row" align="center">
                    <Text as="span" fontSize="sm" color="currentcolor">
                      Share to Twitter
                    </Text>
                  </Stack>
                </TwitterShareButton>
              </ListItem>
              {collection.siteUrl && renderWithLink('Website', collection.siteUrl)}
            </List>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

export default ShareButton
