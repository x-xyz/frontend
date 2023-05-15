import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import { ButtonProps } from '@chakra-ui/button'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import { keccak256 } from '@ethersproject/solidity'
import { fetchOrder, fetchTokenV2 } from '@x/apis/fn'
import { addresses, findToken } from '@x/constants'
import { useActiveWeb3React, useErc20Contract, useExchangeContract } from '@x/hooks'
import { OrderItem, SignedOrder } from '@x/models/dist'
import { compareAddress } from '@x/utils'
import { ensureEnoughErc20Allowance, ensureEnoughNativeToken, handleError } from '@x/web3'

import Web3CheckButton from '../../Web3CheckButton'
import { useDisclosure } from '@chakra-ui/react'
import BuyModal from './BuyModal'

export interface BuyButtonProps extends ButtonProps {
  orderItem: OrderItem
}

export default function BuyButton({ orderItem, children, ...props }: BuyButtonProps) {
  const expired = DateTime.fromISO(orderItem.endTime).diffNow().valueOf() <= 0

  const toast = useToast({ title: 'Buy' })

  const { account, library, callContract } = useActiveWeb3React()

  const erc20Contract = useErc20Contract(orderItem.currency, orderItem.chainId)

  const exchangeContract = useExchangeContract(orderItem.chainId)

  const { data: order, isFetching: isLoadingOrder } = useQuery<SignedOrder>(
    ['fetchOrder', orderItem.orderHash],
    async () => fetchOrder(orderItem.chainId, orderItem.orderHash),
  )

  const { data: item, isLoading: isLoadingItem } = useQuery(
    ['token', orderItem.chainId, orderItem.collection, orderItem.tokenId],
    fetchTokenV2,
  )

  const [buying, setBuying] = useState(false)

  const isSellInApeToken = useMemo(
    () => findToken(orderItem.currency, orderItem.chainId)?.symbol === 'APE',
    [orderItem.currency, orderItem.chainId],
  )

  const buyModal = useDisclosure()

  async function buy() {
    setBuying(true)

    try {
      const token = findToken(orderItem.currency, orderItem.chainId)

      if (!token) throw new Error(`unknown token: ${orderItem.currency}`)

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
          addresses.exchange[orderItem.chainId],
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
        marketplace: keccak256(['string'], ['apecoin']),
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
    <>
      <Web3CheckButton
        expectedChainId={orderItem.chainId}
        onClick={isSellInApeToken ? buy : buyModal.onOpen}
        disabled={
          compareAddress(account, orderItem.signer) ||
          buying ||
          expired ||
          isLoadingOrder ||
          isLoadingItem ||
          !orderItem.isValid ||
          orderItem.isUsed
        }
        isLoading={buying || isLoadingOrder || isLoadingItem}
        {...props}
      >
        {children || 'Buy Now'}
      </Web3CheckButton>
      {item && <BuyModal isOpen={buyModal.isOpen} onClose={buyModal.onClose} item={item} orderItem={orderItem} />}
    </>
  )
}
