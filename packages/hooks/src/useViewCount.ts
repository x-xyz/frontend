import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useViewCountQuery } from '@x/apis'

export function useViewCount(chainId: ChainId, contract: string, tokenId: BigNumberish) {
  const { data, isLoading } = useViewCountQuery({ chainId, contract, tokenId: tokenId.toString() })
  return [data?.data || 0, isLoading] as const
}
