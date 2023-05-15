import { ButtonProps } from '@chakra-ui/button'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '@x/hooks'
import { useMarketplaceContract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useState } from 'react'
import { handleError } from '@x/web3'
import Web3CheckButton from '../../Web3CheckButton'

export interface CancelOfferButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
  onOfferCanceled?: () => void
}

export default function CancelOfferButton({
  chainId = ChainId.Fantom,
  contractAddress,
  tokenID,
  onOfferCanceled,
  ...props
}: CancelOfferButtonProps) {
  const toast = useToast({ title: 'Cancel Offer' })

  const { account, callContract } = useActiveWeb3React()

  const marketplaceContract = useMarketplaceContract(chainId)

  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)

    try {
      if (!account) throw new Error('cannot get account')

      if (!marketplaceContract) throw new Error('conncat get marketplace contract')

      const tx = await callContract({
        contract: marketplaceContract,
        method: 'cancelOffer',
        args: [contractAddress, tokenID],
      })

      await tx.wait()

      if (onOfferCanceled) onOfferCanceled()

      toast({ status: 'success', description: 'Offer canceled' })
    } catch (error) {
      handleError(error, { toast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Web3CheckButton expectedChainId={chainId} onClick={onClick} disabled={loading} isLoading={loading} {...props}>
      Cancel Offer
    </Web3CheckButton>
  )
}
