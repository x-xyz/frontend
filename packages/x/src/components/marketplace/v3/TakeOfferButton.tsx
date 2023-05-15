import useToast from 'hooks/useToast'
import { useState } from 'react'

import { ButtonProps } from '@chakra-ui/button'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { fetchOrder } from '@x/apis/fn'
import { addresses } from '@x/constants/dist'
import { useActiveWeb3React, useErc721ApprovalForAll, useErc721Contract, useExchangeContract } from '@x/hooks'
import { OrderItem } from '@x/models'
import { ChainId } from '@x/models/dist'
import { compareAddress } from '@x/utils'
import { handleError } from '@x/web3'

import Web3CheckButton from '../../Web3CheckButton'

export interface TakeOfferButtonProps extends ButtonProps {
  /**
   * @deprecated
   */
  contractAddress?: string
  /**
   * @deprecated
   */
  chainId?: ChainId
  /**
   * @deprecated
   */
  tokenId?: BigNumberish
  offer: OrderItem
  onOfferTook?: (offer: OrderItem) => void
  isErc1155?: boolean
}

export default function TakeOfferButton({ offer, onOfferTook, isErc1155, ...props }: TakeOfferButtonProps) {
  const toast = useToast({ title: 'Accept Offer' })

  const { account, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(offer.collection, offer.chainId)

  const exchangeContract = useExchangeContract(offer.chainId)
  const transferManagerContractAddress = isErc1155
    ? addresses.transferManagerErc1155[offer.chainId]
    : addresses.transferManagerErc721[offer.chainId]

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    offer.chainId,
    offer.collection,
    account,
    transferManagerContractAddress,
  )

  const [isLoading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)

    try {
      // if (!marketplaceContract) throw new Error('cannot get marketplace contract')
      if (!exchangeContract) throw new Error('cannot get exchange contract')
      if (!transferManagerContractAddress) throw new Error('cannot get transfer manager contract')

      if (!account) throw new Error('cannot get account')

      if (!isApproved) {
        if (!erc721Contract) throw new Error('cannot get erc721 contract')

        const approveTx = await callContract({
          contract: erc721Contract,
          method: 'setApprovalForAll',
          args: [transferManagerContractAddress, true],
        })

        await approveTx.wait()

        toast({ status: 'success', description: 'Approved' })
      }

      const signedOrder = await fetchOrder(offer.chainId, offer.orderHash)

      const takerOrder = {
        isAsk: true,
        taker: account,
        itemIdx: offer.itemIdx,
        item: offer,
        minPercentageToAsk: 0,
        marketplace: keccak256([]),
        params: [],
      }

      const tx = await callContract({
        contract: exchangeContract,
        method: 'matchBidWithTakerAsk',
        args: [signedOrder, takerOrder],
      })

      await tx.wait()

      toast({ status: 'success', description: 'Offer took' })

      if (onOfferTook) onOfferTook(offer)
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Web3CheckButton
      expectedChainId={offer.chainId}
      disabled={isLoading || compareAddress(account, offer.signer)}
      isLoading={isLoading || isLoadingApproved}
      onClick={onClick}
      {...props}
    >
      {isApproved ? 'Accept Offer' : 'Approve & Accept Offer'}
    </Web3CheckButton>
  )
}
