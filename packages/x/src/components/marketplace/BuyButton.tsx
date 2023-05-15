import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import useToast from 'hooks/useToast'
import { useState } from 'react'

import { Button, ButtonProps } from '@chakra-ui/button'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import { addresses, ChainId, findToken } from '@x/constants'
import { useActiveWeb3React, useErc20Contract, useMarketplaceContract } from '@x/hooks'
import { compareAddress } from '@x/utils'
import { ensureEnoughErc20Allowance, ensureEnoughNativeToken, handleError } from '@x/web3'

export interface BuyButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
  seller: string
  price: string | number
  paymentToken: string
  expired: boolean
  quantity?: number | string
}

export default function BuyButton({
  chainId = ChainId.Fantom,
  contractAddress,
  tokenID,
  seller,
  price,
  paymentToken,
  expired,
  children,
  quantity = 1,
  ...props
}: BuyButtonProps) {
  const toast = useToast({ title: 'Buy' })

  const { account, library, chainId: currentChainId, callContract } = useActiveWeb3React()

  const erc20Contract = useErc20Contract(paymentToken, chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [loading, setLoading] = useState(false)

  async function buy() {
    setLoading(true)

    try {
      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!library) throw new Error('cannot get library')

      if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      const totalPrice = BigNumber.from(price).mul(quantity)

      if (token.isNative) {
        await ensureEnoughNativeToken(library, account, totalPrice, token)
      } else {
        if (!erc20Contract) throw new Error('cannot get erc20 contract')

        const approveTxHash = await ensureEnoughErc20Allowance(
          erc20Contract,
          account,
          addresses.marketplace[chainId],
          totalPrice,
          token,
        )

        if (approveTxHash) toast({ status: 'success', description: `Approve. ${approveTxHash}` })
      }

      let tx: ContractTransaction

      if (token.isNative) {
        tx = await callContract({
          contract: marketplaceContract,
          method: 'buyItem(address,uint256,address)',
          args: [contractAddress, tokenID, seller],
          from: account,
          value: totalPrice,
        })
      } else {
        tx = await callContract({
          contract: marketplaceContract,
          method: 'buyItem(address,uint256,address,address)',
          args: [contractAddress, tokenID, paymentToken, seller],
        })
      }

      await tx.wait()

      toast({ status: 'success', description: `Bought. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setLoading(false)
    }
  }

  if (chainId !== currentChainId)
    return (
      <RequestSwitchChainButton expectedChainId={chainId} {...props}>
        {children || 'Buy'}
      </RequestSwitchChainButton>
    )

  return (
    <Button
      onClick={buy}
      disabled={!account || compareAddress(account, seller) || loading || expired}
      isLoading={loading}
      {...props}
    >
      {children || 'Buy'}
    </Button>
  )
}
