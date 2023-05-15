import { Button, ButtonProps } from '@chakra-ui/button'
import { useConnectWalletModal } from './ConnectWalletProvider'

export type ConnectWalletButtonProps = ButtonProps

export default function ConnectWalletButton({ children, ...props }: ConnectWalletButtonProps) {
  const { onOpen } = useConnectWalletModal()

  return (
    <Button type="button" variant="solid" onClick={onOpen} {...props}>
      {children || 'Connect Wallet'}
    </Button>
  )
}
