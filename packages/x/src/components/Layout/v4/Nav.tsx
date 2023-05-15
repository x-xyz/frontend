import { TriangleDownIcon } from '@chakra-ui/icons'
import { Flex, List, ListItem, Popover, PopoverContent, PopoverTrigger, Stack, StackProps } from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks'
import Link from 'components/Link'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { useRouter } from 'next/router'
import { useState } from 'react'

type LinkDef = {
  name: string
  link?: string
  match?: (path: string) => boolean
  links?: { name: string; link?: string }[]
}

export type NavProps = StackProps

export default function Nav(props: NavProps) {
  const router = useRouter()

  const { account } = useActiveWeb3React()
  const [hoverItem, setHoverItem] = useState<number | null>()

  const links = [
    {
      name: 'NFT Marketplace',
      link: '/marketplace',
    },
    {
      name: 'IP Marketplace',
      link: '/ip/marketplace/buy',
      match: (path: string) => path.startsWith('/ip/marketplace'),
    },
    {
      name: 'Bulk Listing',
      link: '/bulk-listing',
    },
    {
      name: 'Rewards',
      links: [
        {
          name: 'Everyday Rewards (Coming Soon)',
        },
        {
          name: 'veX Dashboard',
          link: '/vex',
        },
        {
          name: 'X Token Staking Vault',
          link: 'https://x.vault.inc/',
        },
      ],
    },
  ]

  if (account) {
    links.push({
      name: 'My Portfolio',
      link: `/account/${account}`,
    })
  }

  const isActiveLink = (l: LinkDef) => {
    if (!l.link) return false

    if (l.match) {
      return l.match(router.pathname)
    } else {
      return router.pathname === l.link
    }
  }

  return (
    <Stack h="100%" direction="row" spacing="30px" display="flex" alignItems="center" {...props}>
      {links.map((l, idx) => (
        <Popover key={idx} trigger="hover">
          <PopoverTrigger>
            <Flex
              h="100%"
              flexDir="column"
              position="relative"
              onMouseEnter={() => setHoverItem(idx)}
              onMouseLeave={() => setHoverItem(null)}
            >
              <Link
                display="flex"
                alignItems="center"
                flexGrow={1}
                whiteSpace="nowrap"
                href={l.link}
                mr={2}
                variant={isActiveLink(l) ? 'active' : ''}
              >
                {l.name}
                {l.links && <TriangleDownIcon w={3} h={3} ml={2} />}
              </Link>
            </Flex>
          </PopoverTrigger>
          {l.links && (
            <PopoverContent border="none" borderRadius="6px">
              <List variant="round-border" p={0} border="none">
                {l.links.map(l => (
                  <ListItem key={l.name}>
                    <Link display="flex" alignItems="center" flexGrow={1} whiteSpace="nowrap" href={l.link}>
                      {l.name}
                    </Link>
                  </ListItem>
                ))}
              </List>
            </PopoverContent>
          )}
        </Popover>
      ))}
      {!account && <ConnectWalletButton />}
    </Stack>
  )
}
