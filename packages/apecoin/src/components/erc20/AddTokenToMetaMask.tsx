import useToast from 'hooks/useToast'

import { Button, ButtonProps } from '@chakra-ui/button'
import { handleError } from '@x/web3'

export interface AddTokenToMetaMaskProps extends ButtonProps {
  tokenType: 'ERC20'
  tokenAddress: string
  tokenSymbol: string
  tokenImage: string
  tokenDecimals: number
}

export default function AddTokenToMetaMask({
  tokenAddress,
  tokenDecimals,
  tokenImage,
  tokenSymbol,
  tokenType,
  ...props
}: AddTokenToMetaMaskProps) {
  const toast = useToast({ title: `Add ${tokenSymbol} to MetaMask` })

  async function onClick() {
    if (!window.ethereum?.request) return false

    try {
      const success = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: tokenType,
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      })

      if (!success) throw new Error('Add token failed')
    } catch (error) {
      handleError(error, { toast })
    }
  }

  return <Button onClick={onClick} {...props} />
}
