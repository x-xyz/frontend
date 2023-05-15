import { Button, ButtonProps } from '@chakra-ui/button'
import { Tooltip } from '@chakra-ui/tooltip'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useAuctionContract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { Auction } from '@x/models'
import { handleError } from '@x/web3'
import Web3CheckButton from '../../Web3CheckButton'

export interface WithdrawBidButtonProps extends ButtonProps {
  auction: Auction
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
}

export default function WithdrawBidButton({
  auction,
  chainId = ChainId.Fantom,
  contractAddress,
  tokenID,
  children,
  ...props
}: WithdrawBidButtonProps) {
  const toast = useToast({ title: 'Withdraw bid' })

  const { account, callContract } = useActiveWeb3React()

  const auctionContract = useAuctionContract(chainId)

  const after12Hours = DateTime.now().toSeconds() > auction.endTime.toNumber() + 43200

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
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  }

  return (
    <Tooltip label="Can withdraw only after 12 hours (after auction ended)">
      <Web3CheckButton expectedChainId={chainId} onClick={onClick} {...props}>
        {children || 'Withdraw Bid'}
      </Web3CheckButton>
    </Tooltip>
  )
}
