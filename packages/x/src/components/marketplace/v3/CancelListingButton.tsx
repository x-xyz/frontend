import { fetchOrder } from '@x/apis/dist/fn'
import { OrderItem } from '@x/models'
import { SignedOrder } from '@x/models/dist'
import { useState } from 'react'
import { ButtonProps } from '@chakra-ui/button'
import { useExchangeContract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useActiveWeb3React } from '@x/hooks'
import { handleError } from '@x/web3'
import { ChainId } from '@x/constants'
import { useQuery } from 'react-query'
import Web3CheckButton from '../../Web3CheckButton'

export interface CancelListingButtonProps extends ButtonProps {
  chainId?: ChainId
  orderItem: OrderItem
  onListingCanceled?: () => void
}

/**
 * @todo rename to `CancelOrderButton`
 */
export default function CancelListingButton({
  chainId = ChainId.Fantom,
  orderItem,
  onListingCanceled,
  children,
  ...props
}: CancelListingButtonProps) {
  const toast = useToast({ title: 'Cancel Order' })

  const { account, callContract } = useActiveWeb3React()

  const exchangeContract = useExchangeContract(chainId)

  const { data: order, isFetching: isLoadingOrder } = useQuery<SignedOrder>(
    ['fetchOrder', orderItem.orderHash],
    async () => fetchOrder(chainId, orderItem.orderHash),
  )

  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)

    try {
      if (!account) throw new Error('cannot get account')

      if (!exchangeContract) throw new Error('cannot get exchange contract')

      if (!order) throw new Error('cannot fetch order')

      const tx = await callContract({
        contract: exchangeContract,
        method: 'cancelMultipleOrders',
        args: [[order], [[orderItem.itemIdx]]],
      })

      await tx.wait()

      toast({ status: 'success', description: `Order canceled. ${tx.hash}` })

      onListingCanceled?.()
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Web3CheckButton
      expectedChainId={chainId}
      onClick={onClick}
      disabled={loading || isLoadingOrder}
      isLoading={loading}
      {...props}
    >
      {children || 'Cancel Listing'}
    </Web3CheckButton>
  )
}
