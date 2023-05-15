import { Button, ButtonProps } from '@chakra-ui/button'
import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import { useActiveWeb3React } from '@x/hooks'
import { useErc721Contract, useMarketplaceContract } from '@x/hooks'
import { useErc721ApprovalForAll } from '@x/hooks'
import { useToast } from '@x/hooks'
import { TokenOffer } from '@x/models'
import { useState } from 'react'
import { handleError } from '@x/web3'
import { compareAddress } from '@x/utils'

export interface TakeOfferButtonProps extends ButtonProps {
  offer: TokenOffer
  onOfferTook?: (offer: TokenOffer) => void
}

export default function TakeOfferButton({ offer, onOfferTook, ...props }: TakeOfferButtonProps) {
  const { minter, tokenId, creator } = offer

  const toast = useToast({ title: 'Take Offer' })

  const { account, chainId: currentChainId, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(offer.minter)

  const marketplaceContract = useMarketplaceContract(offer.chainId)

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    offer.chainId,
    offer.minter,
    account,
    marketplaceContract?.address,
  )

  const [isLoading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)

    try {
      if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      if (!isApproved) {
        if (!erc721Contract) throw new Error('cannot get erc721 contract')

        const approveTx = await callContract({
          contract: erc721Contract,
          method: 'setApprovalForAll',
          args: [marketplaceContract.address, true],
        })

        await approveTx.wait()

        toast({ status: 'success', description: 'Approved' })
      }

      const tx = await callContract({
        contract: marketplaceContract,
        method: 'acceptOffer',
        args: [minter, tokenId, creator],
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

  if (offer.chainId && offer.chainId !== currentChainId)
    return (
      <RequestSwitchChainButton expectedChainId={offer.chainId} {...props}>
        {isApproved ? 'Take Offer' : 'Approve & Take Offer'}
      </RequestSwitchChainButton>
    )

  return (
    <Button
      disabled={!account || isLoading || compareAddress(account, offer.creator)}
      isLoading={isLoading || isLoadingApproved}
      onClick={onClick}
      {...props}
    >
      {isApproved ? 'Take Offer' : 'Approve & Take Offer'}
    </Button>
  )
}
