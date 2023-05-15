import { ChakraProps } from '@chakra-ui/react'
import CopyIcon from 'components/icons/CopyIcon'
import { useMemo } from 'react'

import { Button } from '@chakra-ui/button'
import { useClipboard } from '@chakra-ui/hooks'
import { Stack, Text, TextProps } from '@chakra-ui/layout'
import { Tooltip } from '@chakra-ui/tooltip'
import { ChainId, defaultNetwork, getChain } from '@x/constants'
import { shortenAddress } from '@x/utils'

import Link from './Link'

export interface AddressProps extends TextProps {
  children?: string
  type?: 'account' | 'address' | 'token' | 'copy'
  chainId?: ChainId
  fallback?: React.ReactNode
  iconProps?: ChakraProps
}

export default function Address({
  children = '',
  type,
  chainId = defaultNetwork,
  fallback = 'invalid address',
  iconProps,
  ...props
}: AddressProps) {
  const chain = useMemo(() => getChain(chainId), [chainId])

  const { onCopy, hasCopied } = useClipboard(children)

  function renderAddress() {
    if (!children) return ''
    const value = shortenAddress(children)
    if (value === 'invalid address') return fallback
    return value
  }

  function render() {
    return (
      <Text color="primary" {...props}>
        {renderAddress()}
      </Text>
    )
  }

  if (!type) return render()

  if (type === 'copy')
    return (
      <Button variant="unstyled" onClick={onCopy} p={0} m={0}>
        <Stack direction="row" align="center" spacing={0}>
          {render()}
          <Tooltip label="Copied" placement="top" isOpen={hasCopied}>
            <CopyIcon w={5} h={5} color="primary" {...iconProps} />
          </Tooltip>
        </Stack>
      </Button>
    )

  const url =
    type === 'account' ? (children ? `/account/${children}` : void 0) : `${chain.blockExplorerUrl}/${type}/${children}`

  return (
    <Link href={url} color="inherit">
      {render()}
    </Link>
  )
}
