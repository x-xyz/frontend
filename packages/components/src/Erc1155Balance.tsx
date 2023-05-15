import React from 'react'
import { SkeletonText, SkeletonTextProps } from '@chakra-ui/react'
import { useErc1155Balance } from '@x/hooks'
import { ChainId } from '@x/models'

export interface Erc1155BalanceProps extends SkeletonTextProps {
  chainId: ChainId
  contract: string
  tokenId: string
  owner?: string | null
}

export function Erc1155Balance({ chainId, contract, tokenId, owner, ...props }: Erc1155BalanceProps) {
  const [balance, isLoading] = useErc1155Balance(chainId, contract, tokenId, owner)
  return (
    <SkeletonText isLoaded={!isLoading} noOfLines={1} {...props}>
      {balance}
    </SkeletonText>
  )
}
