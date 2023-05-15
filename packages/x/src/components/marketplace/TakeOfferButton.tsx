import { Button, ButtonProps } from '@chakra-ui/button'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/models/dist'
import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import { useActiveWeb3React } from '@x/hooks'
import { useErc721Contract, useMarketplaceContract } from '@x/hooks'
import { useErc721ApprovalForAll } from '@x/hooks'
import useToast from 'hooks/useToast'
import { TokenOffer } from '@x/models'
import { useState } from 'react'
import { handleError } from '@x/web3'
import { compareAddress } from '@x/utils'

export interface TakeOfferButtonProps extends ButtonProps {
  contractAddress: string
  chainId: ChainId
  tokenId: BigNumberish
  offer: TokenOffer
  onOfferTook?: (offer: TokenOffer) => void
}

export default function TakeOfferButton({
  contractAddress,
  chainId,
  tokenId,
  offer,
  onOfferTook,
  ...props
}: TakeOfferButtonProps) {
  const toast = useToast({ title: 'Take Offer' })

  const { account, chainId: currentChainId, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(contractAddress)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contractAddress,
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
        method: 'acceptOffer(address,uint256,address)',
        args: [contractAddress, tokenId, offer.owner],
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

  if (chainId !== currentChainId)
    return (
      <RequestSwitchChainButton expectedChainId={chainId} {...props}>
        {isApproved ? 'Take Offer' : 'Approve & Take Offer'}
      </RequestSwitchChainButton>
    )

  return (
    <Button
      disabled={!account || isLoading || compareAddress(account, offer.owner)}
      isLoading={isLoading || isLoadingApproved}
      onClick={onClick}
      {...props}
    >
      {isApproved ? 'Take Offer' : 'Approve & Take Offer'}
    </Button>
  )
}
