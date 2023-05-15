import { Button, ButtonProps } from '@chakra-ui/button'
import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import { ChainId, defaultNetwork } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '@x/hooks'
import { useAuctionContract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { useState } from 'react'
import { handleError } from '@x/web3'

export interface ConcludeAuctionButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
  onConcluded?: () => void
}

export default function ConcludeAuctionButton({
  chainId = defaultNetwork,
  contractAddress,
  tokenID,
  children,
  onConcluded,
  ...props
}: ConcludeAuctionButtonProps) {
  const toast = useToast({ title: 'Conclude Auction' })

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
        method: 'resultAuction',
        args: [contractAddress, tokenID],
      })

      await tx.wait()

      toast({ status: 'success', description: 'Auction concluded' })

      onConcluded?.()
    } catch (error) {
      handleError(error, { toast })
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
    <Button onClick={onClick} disabled={loading} isLoading={loading} {...props}>
      {children || 'Conclude Auction'}
    </Button>
  )
}
