import { Box, Flex, Stack, StackProps } from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks'
import Link from 'components/Link'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import AccountPopover from 'components/account/AccountPopover'
import { useState } from 'react'

export type NavProps = StackProps

export default function Nav(props: NavProps) {
  const { account, chainId } = useActiveWeb3React()
  const [hoverItem, setHoverItem] = useState<number | null>()

  const links = [
    {
      name: 'NFT Marketplace',
      link: '/collections',
    },
    // {
    //   name: 'Create',
    //   link: '/create',
    // },
    // {
    //   name: 'Learn',
    //   link: '/docs',
    // },
    {
      name: 'IP Marketplace',
      link: '/ip/marketplace/buy',
    },
    {
      name: 'Bulk Listing',
      link: '/bulk-listing',
    },
  ]

  return (
    <Stack h="100%" direction="row" spacing={12} display="flex" alignItems="center" {...props}>
      {links.map((l, idx) => (
        <Flex
          key={idx}
          h="100%"
          flexDir="column"
          position="relative"
          onMouseEnter={() => setHoverItem(idx)}
          onMouseLeave={() => setHoverItem(null)}
        >
          <Link display="flex" alignItems="center" flexGrow={1} whiteSpace="nowrap" href={l.link}>
            {l.name}
          </Link>
          <Box h="4px" width="100%" background={hoverItem === idx ? 'primary' : 'none'} />
        </Flex>
      ))}
      {account ? <AccountPopover account={account} chainId={chainId} /> : <ConnectWalletButton />}
    </Stack>
  )
}
