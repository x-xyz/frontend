import { ButtonProps } from '@chakra-ui/button'
import { Tooltip } from '@chakra-ui/tooltip'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useAuctionContract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { Auction, TokenAuction } from '@x/models'
import { handleError } from '@x/web3'
import Web3CheckButton from '../../Web3CheckButton'
import { useMemo } from 'react'

export interface WithdrawBidButtonProps extends ButtonProps {
  auction: Auction | TokenAuction
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
  onBidWithdrawd?: () => void
}

export default function WithdrawBidButton({
  auction,
  chainId = ChainId.Fantom,
  contractAddress,
  tokenID,
  children,
  onBidWithdrawd,
  ...props
}: WithdrawBidButtonProps) {
  const toast = useToast({ title: 'Withdraw bid' })

  const { account, callContract } = useActiveWeb3React()

  const auctionContract = useAuctionContract(chainId)

  const endTime = useMemo(() => {
    if (!auction.endTime) return 0
    if (typeof auction.endTime === 'string') return DateTime.fromISO(auction.endTime).toSeconds()
    return auction.endTime.toNumber()
  }, [auction.endTime])

  const after12Hours = DateTime.now().toSeconds() > endTime + 43200

  async function onClick() {
    if (!after12Hours) return

    try {
      if (!account) throw new Error('cannot get account')

      if (!auctionContract) throw new Error('cannot get auction contract')

      const tx = await callContract({
        contract: auctionContract,
        method: 'withdrawBid',
        args: [contractAddress, tokenID],
      })

      await tx.wait()

      onBidWithdrawd?.()
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  }

  return (
    <Web3CheckButton expectedChainId={chainId} onClick={onClick} {...props}>
      <Tooltip label="Can withdraw only after 12 hours (after auction ended)">{children || 'Withdraw Bid'}</Tooltip>
    </Web3CheckButton>
  )
}
