import { ListItem, UnorderedList } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/button'
import { Stack, Text } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/image'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps } from '@chakra-ui/modal'
import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/alert'
import { supportedWallets, SupportedWallet } from '@x/constants'
import { UnsupportedChainIdError } from '@x/web3'
import { useActiveWeb3React } from '@x/hooks'
import { getSupportedChainNames } from '@x/constants'
import ModalIcon from 'components/modal/ModalIcon'

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
        key={name}
        borderRadius="8px"
        borderWidth="2px"
        borderColor="divider"
        h="60px"
        onClick={() =>
          activate(connector, error => {
            try {
              failback?.(error)
            } catch (error) {
              setCaughtError(error)
            }
          })
        }
      >
        <Stack direction="row" width="100%" alignItems="center" spacing={4}>
          {icon && <Image src={icon} width="24px" height="24px" />}
          <Text>{name}</Text>
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
            Please connect to supported chain. <br />
            <UnorderedList variant="ghost">
              {getSupportedChainNames().map(chain => (
                <ListItem key={chain}>{chain}</ListItem>
              ))}
            </UnorderedList>
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
        <ModalHeader>
          <Text>Connect to a wallet</Text>
        </ModalHeader>
        <ModalBody>
          <Stack>
            {supportedWallets.map(renderSupportedWallet)}
            {caughtError && renderError(caughtError)}
            {error && active && <Button onClick={deactivate}>Disconnect</Button>}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button w="100%" fontWeight="600" onClick={() => onClose()}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
