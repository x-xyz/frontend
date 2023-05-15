import { fetchOrder } from '@x/apis/fn'
import { OrderItem, SignedOrder } from '@x/models/dist'
import { keccak256 } from 'ethers/lib/utils'
import { useMemo, useState } from 'react'
import { ButtonProps } from '@chakra-ui/button'
import { ContractTransaction } from '@ethersproject/contracts'
import { addresses, findToken } from '@x/constants'
import { useErc20Contract, useExchangeContract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { ensureEnoughErc20Allowance, ensureEnoughNativeToken } from '@x/web3'
import { compareAddress } from '@x/utils'
import { useActiveWeb3React } from '@x/hooks'
import { handleError } from '@x/web3'
import { ChainId } from '@x/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from 'react-query'
import Web3CheckButton from '../../Web3CheckButton'

export interface BuyButtonProps extends ButtonProps {
  chainId: ChainId
  seller: string
  /**
   * @deprecated
   */
  price?: string | number
  paymentToken: string
  expired: boolean
  orderItem: OrderItem
}

export default function BuyButton({
  chainId,
  seller,
  paymentToken,
  expired,
  orderItem,
  children,
  ...props
}: BuyButtonProps) {
  const toast = useToast({ title: 'Buy' })

  const { account, library, callContract } = useActiveWeb3React()

  const erc20Contract = useErc20Contract(paymentToken, chainId)

  const exchangeContract = useExchangeContract(chainId)

  const { data: order, isFetching: isLoadingOrder } = useQuery<SignedOrder>(
    ['fetchOrder', orderItem.orderHash],
    async () => fetchOrder(chainId, orderItem.orderHash),
  )

  const [buying, setBuying] = useState(false)

  async function buy() {
    setBuying(true)

    try {
      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!library) throw new Error('cannot get library')

      if (!exchangeContract) throw new Error('cannot get exchange contract')

      if (!order) throw new Error('cannot get order')

      const priceInEther = BigNumber.from(orderItem.price)

      if (token.isNative) {
        await ensureEnoughNativeToken(library, account, priceInEther, token)
      } else {
        if (!erc20Contract) throw new Error('cannot get erc20 contract')

        const approveTxHash = await ensureEnoughErc20Allowance(
          erc20Contract,
          account,
          addresses.exchange[chainId],
          priceInEther,
          token,
        )

        if (approveTxHash) toast({ status: 'success', description: `Approve. ${approveTxHash}` })
      }

      let tx: ContractTransaction

      const takerOrder = {
        isAsk: false,
        taker: account,
        itemIdx: orderItem.itemIdx,
        item: orderItem,
        minPercentageToAsk: 0,
        marketplace: keccak256([]),
        params: [],
      }

      if (token.isNative) {
        tx = await callContract({
          contract: exchangeContract,
          method: 'matchAskWithTakerBidUsingETH',
          args: [order, takerOrder],
          value: orderItem.price,
        })
      } else {
        tx = await callContract({
          contract: exchangeContract,
          method: 'matchAskWithTakerBid',
          args: [order, takerOrder],
        })
      }

      await tx.wait()

      toast({ status: 'success', description: `Bought. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setBuying(false)
    }
  }

  return (
    <Web3CheckButton
      expectedChainId={chainId}
      onClick={buy}
      disabled={
        compareAddress(account, seller) || buying || expired || isLoadingOrder || !orderItem.isValid || orderItem.isUsed
      }
      isLoading={buying}
      {...props}
    >
      {children || 'Buy'}
    </Web3CheckButton>
  )
}
