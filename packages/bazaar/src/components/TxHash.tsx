import { ChainId, defaultNetwork, getChain } from '@x/constants'
import { useMemo } from 'react'
import Link from './Link'

export interface TxHashProps {
  children: string
  chainId?: ChainId
}

export default function TxHash({ children, chainId = defaultNetwork }: TxHashProps) {
  const chain = useMemo(() => getChain(chainId), [chainId])

  return <Link href={`${chain.blockExplorerUrl}/tx/${children}`}>Link</Link>
}
