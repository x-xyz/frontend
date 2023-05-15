import { ButtonProps, IconButtonProps } from '@chakra-ui/button'
import { findToken } from '@x/constants/dist'
import { useActiveWeb3React } from '@x/hooks/dist'
import { useMemo } from 'react'
import AddTokenToMetaMask, { AddTokenToMetaMaskButton } from './AddTokenToMetaMask'

export interface AddTokenToMetaMaskByTokenIdProps extends IconButtonProps {
  tokenId: string
}

export default function AddTokenToMetaMaskByTokenId({ tokenId, ...props }: AddTokenToMetaMaskByTokenIdProps) {
  const { chainId } = useActiveWeb3React()

  const token = useMemo(() => findToken(tokenId, chainId), [tokenId, chainId])

  if (!token) return null

  return (
    <AddTokenToMetaMask
      tokenType="ERC20"
      tokenAddress={token.address}
      tokenSymbol={token.symbol}
      tokenDecimals={token.decimals}
      tokenImage={token.icon.startsWith('http') ? token.icon : `https://x.xyz/${token.icon}`}
      {...props}
    />
  )
}

export interface AddTokenToMetaMaskByTokenIdButtonProps extends ButtonProps {
  tokenId: string
}

export function AddTokenToMetaMaskByTokenIdButton({ tokenId, ...props }: AddTokenToMetaMaskByTokenIdButtonProps) {
  const { chainId } = useActiveWeb3React()

  const token = useMemo(() => findToken(tokenId, chainId), [tokenId, chainId])

  if (!token) return null

  return (
    <AddTokenToMetaMaskButton
      tokenType="ERC20"
      tokenAddress={token.address}
      tokenSymbol={token.symbol}
      tokenDecimals={token.decimals}
      tokenImage={token.icon.startsWith('http') ? token.icon : `https://x.xyz/${token.icon}`}
      {...props}
    />
  )
}
