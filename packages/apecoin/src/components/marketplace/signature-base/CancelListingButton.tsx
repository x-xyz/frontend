import useToast from 'hooks/useToast'
import { useState } from 'react'
import { useQuery } from 'react-query'

import { ButtonProps } from '@chakra-ui/button'
import { fetchOrder } from '@x/apis/dist/fn'
import { useActiveWeb3React, useExchangeContract } from '@x/hooks'
import { OrderItem } from '@x/models'
import { SignedOrder } from '@x/models/dist'
import { handleError } from '@x/web3'

import Web3CheckButton from '../../Web3CheckButton'
import Overlay from './Overlay'
import { Button, Stack, Text, useBreakpointValue, useDisclosure } from '@chakra-ui/react'

export interface CancelListingButtonProps extends ButtonProps {
  orderItem: OrderItem
  onListingCanceled?: () => void
}

/**
 * @todo rename to `CancelOrderButton`
 */
export default function CancelListingButton({
  orderItem,
  onListingCanceled,
  children,
  ...props
}: CancelListingButtonProps) {
  const toast = useToast({ title: 'Cancel Order' })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { account, callContract } = useActiveWeb3React()

  const exchangeContract = useExchangeContract(orderItem.chainId)

  const { data: order, isFetching: isLoadingOrder } = useQuery<SignedOrder>(
    ['fetchOrder', orderItem.orderHash],
    async () => fetchOrder(orderItem.chainId, orderItem.orderHash),
  )

  const [loading, setLoading] = useState(false)

  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

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
    <>
      <Web3CheckButton expectedChainId={orderItem.chainId} onClick={onOpen} {...props}>
        {children || 'Cancel Listing'}
      </Web3CheckButton>
      <Overlay title="Cancel Listing" isOpen={isOpen} onClose={onClose} showCloseButton={false}>
        <Stack spacing={8}>
          <Text variant="body2">Are you sure to cancel the listing?</Text>
          <Stack direction={useDesktopView ? 'row' : 'column-reverse'} w="full" spacing={4}>
            <Button type="submit" variant="outline" onClick={onClose} flex="1 0 auto">
              No
            </Button>
            <Button
              type="submit"
              variant="solid"
              disabled={loading || isLoadingOrder}
              isLoading={loading}
              flex="1 0 auto"
              onClick={() => onClick()}
            >
              Yes
            </Button>
          </Stack>
        </Stack>
      </Overlay>
    </>
  )
}
