import Image from 'next/image'
import { useClipboard } from '@chakra-ui/hooks'
import Icon from '@chakra-ui/icon'
import { Stack, Text } from '@chakra-ui/layout'
import { IconButton } from '@chakra-ui/button'
import { Menu, MenuProps, MenuButton, MenuList, MenuItem } from '@chakra-ui/menu'
import { ShareIcon } from '@x/components/icons'
import { useToast } from '@x/hooks'
import { useEffect, useState } from 'react'

export type ShareMenuProps = Omit<MenuProps, 'children'>

export default function ShareMenu({ ...props }: ShareMenuProps) {
  const toast = useToast({ title: 'Link' })

  const [url, setUrl] = useState('')

  const { onCopy, hasCopied } = useClipboard(url)

  useEffect(() => {
    if (hasCopied) toast({ status: 'success', description: 'Link copied' })
  }, [hasCopied, toast])

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  return (
    <Menu lazyBehavior="unmount" isLazy {...props}>
      <MenuButton
        w="44px"
        h="44px"
        bgColor="#1C1C1F"
        as={IconButton}
        variant="outline"
        borderColor="transparent"
        flexShrink={0}
      >
        <Icon as={ShareIcon} w="24px" h="24px" />
      </MenuButton>
      <MenuList bgColor="#1C1C1F">
        <MenuItem onClick={onCopy}>
          <Stack direction="row" alignItems="center">
            <Image src="/assets/link.png" width="24px" height="24px" />
            <Text color="primary" fontWeight={500}>
              Copy Link
            </Text>
          </Stack>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
