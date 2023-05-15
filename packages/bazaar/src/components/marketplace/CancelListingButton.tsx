import { useState } from 'react'
import { Button, ButtonProps } from '@chakra-ui/button'
import { useMarketplaceContract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { useActiveWeb3React } from '@x/hooks'
import { handleError } from '@x/web3'
import { ChainId, defaultNetwork } from '@x/constants'
import RequestSwitchChainButton from 'components/RequestSwitchChainButton'
import { BigNumberish } from '@ethersproject/bignumber'

export interface CancelListingButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress: string
  tokenID: BigNumberish
}

export default function CancelListingButton({
  chainId = defaultNetwork,
  contractAddress,
  tokenID,
  children,
  ...props
}: CancelListingButtonProps) {
  const toast = useToast({ title: 'Cancel Listing' })

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
        method: 'cancelListing',
        args: [contractAddress, tokenID],
      })

      await tx.wait()

      toast({ status: 'success', description: `Listing canceled. ${tx.hash}` })
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
        {children || 'Cancel Listing'}
      </RequestSwitchChainButton>
    )

  return (
    <Button onClick={onClick} disabled={loading} isLoading={loading} {...props}>
      {children || 'Cancel Listing'}
    </Button>
  )
}
