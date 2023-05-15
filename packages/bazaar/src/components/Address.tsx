import { Text, TextProps } from '@chakra-ui/layout'
import { ChainId, defaultNetwork, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useMemo } from 'react'
import { compareAddress, shortenAddress } from '@x/utils'
import Link from './Link'

export interface AddressProps extends TextProps {
  children: string
  type?: 'account' | 'address' | 'token'
  chainId?: ChainId
}

export default function Address({ children, type, chainId = defaultNetwork, ...props }: AddressProps) {
  const { account } = useActiveWeb3React()

  const isMe = compareAddress(account, children)

  const chain = useMemo(() => getChain(chainId), [chainId])

  function render() {
    return <Text {...props}>{isMe ? 'Me' : shortenAddress(children)}</Text>
  }

  if (!type) return render()

  const url = type === 'account' ? `/account/${children}` : `${chain.blockExplorerUrl}/${type}/${children}`

  return <Link href={url}>{render()}</Link>
}
