import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/alert'
import { Button, ButtonProps } from '@chakra-ui/button'
import { Image } from '@chakra-ui/image'
import { Text } from '@chakra-ui/layout'
import {
  Box,
  Flex,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
} from '@chakra-ui/react'
import { getSupportedChainNames, SupportedWallet, supportedWallets } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { UnsupportedChainIdError } from '@x/web3'
import Link, { LinkProps } from '../Link'

import { useConnectWalletModal } from './ConnectWalletProvider'

export type ConnectWalletButtonProps = ButtonProps

export default function ConnectWalletButton({ children, ...props }: ConnectWalletButtonProps) {
  const { activate, active, error, deactivate } = useActiveWeb3React()
  const { onOpen } = useConnectWalletModal()
  const [caughtError, setCaughtError] = useState<unknown>()

  useEffect(() => setCaughtError(error), [error])

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
            <ul>
              {getSupportedChainNames().map(chain => (
                <li key={chain}>{chain}</li>
              ))}
            </ul>
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
    <Popover isLazy returnFocusOnClose closeOnBlur closeOnEsc placement="bottom-end">
      <PopoverTrigger>
        {/*<Link cursor="pointer" {...props}>*/}
        {/*  {children || 'CONNECT WALLET'}*/}
        {/*</Link>*/}
        {/*<Button variant="link" {...props}>*/}
        {/*  {children || 'CONNECT WALLET'}*/}
        {/*</Button>*/}
        {/*<Stack direction="row" align="center">*/}
        <IconButton
          variant="unstyled"
          icon={<Image w={8} h={8} src="/assets/wallet.svg" color="white" />}
          aria-label="connect wallet"
        />
        {/*</Stack>*/}
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="90vw" maxW="380px">
          <PopoverBody>
            <Box p={3}>
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Text fontSize="xl">Connect to a wallet</Text>
              </Flex>
              <Stack>
                {supportedWallets.map(renderSupportedWallet)}
                {caughtError && renderError(caughtError)}
                {error && active && <Button onClick={deactivate}>Disconnect</Button>}
              </Stack>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
