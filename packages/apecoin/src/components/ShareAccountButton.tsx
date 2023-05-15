import { Button, IconButton, useClipboard } from '@chakra-ui/react'
import Dropdown, { DropdownListProps } from './Dropdown'
import EllipsisIcon from './icons/EllipsisIcon'
import { EmailShareButton, FacebookShareButton, TelegramShareButton, TwitterShareButton } from 'react-share'
import { Account } from '@x/models'
import { shortenAddress } from '@x/utils'

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
          icon={<EllipsisIcon border="1px solid" borderColor="divider" borderRadius="20px" w={10} h={10} />}
          aria-label="share account"
        />
      }
      {...props}
    >
      <Dropdown.Item>
        <TwitterShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          Share to Twitter
        </TwitterShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <FacebookShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          Share on Facebook
        </FacebookShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <TelegramShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          Share on Telegram
        </TelegramShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <EmailShareButton title={title} url={url} style={{ width: '100%', textAlign: 'left' }}>
          Share via Email
        </EmailShareButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <Button variant="unstyled" onClick={onCopy} w="full" textAlign="left">
          Copy Link
        </Button>
      </Dropdown.Item>
    </Dropdown.List>
  )
}
