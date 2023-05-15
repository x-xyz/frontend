import { Button, IconButton, Stack, Text, useClipboard } from '@chakra-ui/react'
import Dropdown, { DropdownListProps } from 'components/v3/Dropdown'
import EllipsisIcon from 'components/icons/EllipsisIcon'
import { EmailShareButton, FacebookShareButton, TelegramShareButton, TwitterShareButton } from 'react-share'
import { Account } from '@x/models'
import { shortenAddress } from '@x/utils'
import TwitterIcon from 'components/icons/TwitterIcon'
import FacebookIcon from 'components/icons/FacebookIcon'
import TelegramIcon from 'components/icons/TelegramIcon'
import EmailIcon from 'components/icons/EmailIcon'
import CopyIcon from 'components/icons/CopyIcon'

export interface ShareAccountButtonProps extends DropdownListProps {
  account: Account
}

export default function ShareAccountButton({ account, ...props }: ShareAccountButtonProps) {
  const title = `${account.alias || shortenAddress(account.address)} on x`
  const url = process.browser ? `${location.origin}${location.pathname}` : ''
  const { onCopy } = useClipboard(url)
  return (
    <Dropdown.List
      triggerElem={
        <IconButton
          variant="unstyled"
          icon={
            <EllipsisIcon color="primary" border="1px solid" borderColor="divider" borderRadius="20px" w={10} h={10} />
          }
          aria-label="share account"
        />
      }
      placement="bottom-end"
      title="Share to"
      {...props}
    >
      <Dropdown.Item>
        <TwitterShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          <Stack direction="row" align="center">
            <TwitterIcon color="primary" w={8} h={8} borderColor="divider" borderWidth="1px" borderRadius="16px" />
            <Text>Twitter</Text>
          </Stack>
        </TwitterShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <FacebookShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          <Stack direction="row" align="center">
            <FacebookIcon color="primary" w={8} h={8} borderColor="divider" borderWidth="1px" borderRadius="16px" />
            <Text>Facebook</Text>
          </Stack>
        </FacebookShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <TelegramShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          <Stack direction="row" align="center">
            <TelegramIcon color="primary" w={8} h={8} borderColor="divider" borderWidth="1px" borderRadius="16px" />
            <Text>Telegram</Text>
          </Stack>
        </TelegramShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <EmailShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          <Stack direction="row" align="center">
            <EmailIcon color="primary" w={8} h={8} borderColor="divider" borderWidth="1px" borderRadius="16px" />
            <Text>Email</Text>
          </Stack>
        </EmailShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <Button variant="unstyled" fontWeight="normal" fontSize="sm" onClick={onCopy} w="full" textAlign="left">
          <Stack direction="row" align="center">
            <CopyIcon color="primary" w={8} h={8} borderColor="divider" borderWidth="1px" borderRadius="16px" />
            <Text>Copy Link</Text>
          </Stack>
        </Button>
      </Dropdown.Item>
    </Dropdown.List>
  )
}
