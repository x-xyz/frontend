import { Button, ButtonProps, IconButton, IconButtonProps } from '@chakra-ui/button'
import { Tooltip } from '@chakra-ui/tooltip'
import useToast from 'hooks/useToast'
import { handleError } from '@x/web3'
import Image from '../Image'

interface BaseProps {
  tokenType: 'ERC20'
  tokenAddress: string
  tokenSymbol: string
  tokenImage: string
  tokenDecimals: number
}

export type AddTokenToMetaMaskProps = IconButtonProps & BaseProps

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

  return (
    <Tooltip label={`Add ${tokenSymbol} to MetaMask`}>
      <IconButton
        minW="initial"
        w="48px"
        h="48px"
        icon={<Image src={tokenImage} w="100%" h="100%" />}
        onClick={onClick}
        {...props}
      />
    </Tooltip>
  )
}

export type AddTokenToMetaMaskButtonProps = ButtonProps & BaseProps

export function AddTokenToMetaMaskButton({
  tokenAddress,
  tokenDecimals,
  tokenImage,
  tokenSymbol,
  tokenType,
  ...props
}: AddTokenToMetaMaskButtonProps) {
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
