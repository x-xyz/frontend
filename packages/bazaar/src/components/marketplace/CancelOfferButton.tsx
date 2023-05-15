import { Button, ButtonProps } from '@chakra-ui/button'
import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import { ChainId, defaultNetwork } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '@x/hooks'
import { useMarketplaceContract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { useState } from 'react'
import { handleError } from '@x/web3'

export interface CancelOfferButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
  onOfferCanceled?: () => void
}

export default function CancelOfferButton({
  chainId = defaultNetwork,
  contractAddress,
  tokenID,
  onOfferCanceled,
  ...props
}: CancelOfferButtonProps) {
  const toast = useToast({ title: 'Cancel Offer' })

  const { account, chainId: currentChainId, callContract } = useActiveWeb3React()

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

  if (chainId !== currentChainId)
    return (
      <RequestSwitchChainButton expectedChainId={chainId} {...props}>
        Cancel Offer
      </RequestSwitchChainButton>
    )

  return (
    <Button onClick={onClick} disabled={loading} isLoading={loading} {...props}>
      Cancel Offer
    </Button>
  )
}
