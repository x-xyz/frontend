import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { useEffect, useMemo } from 'react'
import { compareAddress } from '@x/utils'

export interface UseErc1155OwnershipParams {
  account?: string | null
  chainId?: ChainId
  contractAddress?: string | null
  tokenID?: BigNumberish
  disabled?: boolean
}

export function useErc1155Ownership({
  account,
  chainId,
  contractAddress,
  tokenID,
  disabled,
}: UseErc1155OwnershipParams = {}) {
  // const [fetch, { data, isLoading }] = useLazyOwnershipQuery()

  // const holding = useMemo(
  //   () => data?.data?.find(ownership => compareAddress(account, ownership.address)),
  //   [data, account],
  // )

  // useEffect(() => {
  //   if (!disabled && chainId && contractAddress && tokenID) fetch({ chainId, contractAddress, tokenID })
  // }, [disabled, chainId, contractAddress, tokenID, fetch])

  // return [disabled ? undefined : holding, isLoading] as const

  // @todo
  return [undefined, false] as const
}
