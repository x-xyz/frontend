import { Button, ButtonProps } from '@chakra-ui/button'
import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import { ChainId, defaultNetwork } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '@x/hooks'
import { useAuctionContract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { useState } from 'react'
import { handleError } from '@x/web3'

export interface CancelAuctionButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
}

export default function CancelAuctionButton({
  chainId = defaultNetwork,
  contractAddress,
  tokenID,
  ...props
}: CancelAuctionButtonProps) {
  const toast = useToast({ title: 'Cancel Auction' })

  const { account, chainId: currentChainId, callContract } = useActiveWeb3React()

  const auctionContract = useAuctionContract(chainId)

  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)

    try {
      if (!account) throw new Error('cannot get account')

      if (!auctionContract) throw new Error('conncat get auction contract')

      const tx = await callContract({
        contract: auctionContract,
        method: 'cancelAuction',
        args: [contractAddress, tokenID],
      })

      await tx.wait()

      toast({ status: 'success', description: 'Auction canceled' })
    } catch (error) {
      handleError(error, { toast })
    } finally {
      setLoading(false)
    }
  }

  if (chainId !== currentChainId)
    return (
      <RequestSwitchChainButton expectedChainId={chainId} {...props}>
        Cancel Auction
      </RequestSwitchChainButton>
    )

  return (
    <Button onClick={onClick} disabled={loading} isLoading={loading} {...props}>
      Cancel Auction
    </Button>
  )
}
