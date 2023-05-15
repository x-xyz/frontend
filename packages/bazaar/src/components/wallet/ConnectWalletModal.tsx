import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@chakra-ui/button'
import { Spacer, Stack, Text } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/modal'
import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/alert'
import { supportedWallets, SupportedWallet, ChainId } from '@x/constants'
import { UnsupportedChainIdError } from '@x/utils'
import { useActiveWeb3React } from '@x/hooks'
import { metamaskSwitchNetwork } from '@x/web3'

export type ConnectWalletModalProps = Omit<ModalProps, 'children'>

export default function ConnectWalletModal({ onClose, ...props }: ConnectWalletModalProps) {
  const { activate, active, error, deactivate } = useActiveWeb3React()

  const [caughtError, setCaughtError] = useState<unknown>()

  useEffect(() => setCaughtError(error), [error])

  useEffect(() => {
    if (active) onClose()
  }, [active, onClose])

  function renderSupportedWallet({ name, connector, icon, failback }: SupportedWallet) {
    return (
      <Button
        variant="outline"
        key={name}
        onClick={() =>
          activate(connector, error => {
            try {
              failback?.(error)
            } catch (error) {
              setCaughtError(error)

              if (error instanceof UnsupportedChainIdError) {
                metamaskSwitchNetwork(ChainId.BinanceSmartChain)
              }
            }
          })
        }
      >
        <Stack direction="row" width="100%" alignItems="center">
          <Text color="primary">{name}</Text>
          <Spacer />
          {icon && <Image src={icon} width="24px" height="24px" />}
        </Stack>
      </Button>
    )
  }

  function renderError(error: unknown) {
    if (error instanceof UnsupportedChainIdError) {
      return (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Looks like you connected to unsupported network, please switch to Binance Smart Chain to continue.
          </AlertDescription>
        </Alert>
      )
    }

    const errorCode = (error as any).code // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error instanceof Error && errorCode === -32002) {
      if (error.message.includes('wallet_requestPermissions')) {
        return (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>There is a pending request, please check your extension!</AlertDescription>
          </Alert>
        )
      }
    }
  }

  return (
    <Modal size="sm" onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect to a wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            {supportedWallets.map(renderSupportedWallet)}
            {caughtError && renderError(caughtError)}
            {error && active && <Button onClick={deactivate}>Disconnect</Button>}
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
