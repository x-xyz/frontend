import CopyIcon from 'components/icons/CopyIcon'
import { useMemo } from 'react'

import { Button } from '@chakra-ui/button'
import { useClipboard } from '@chakra-ui/hooks'
import { Stack, Text, TextProps } from '@chakra-ui/layout'
import { Tooltip } from '@chakra-ui/tooltip'
import { ChainId, getChain } from '@x/constants'
import { shortenAddress } from '@x/utils'

import Link from './Link'

export interface AddressProps extends TextProps {
  children?: string
  type?: 'account' | 'address' | 'token' | 'copy'
  chainId?: ChainId
  /**
   * @deprecated
   */
  selfSynonym?: React.ReactNode
  fallback?: React.ReactNode
}

export default function Address({
  children = '',
  type,
  chainId = ChainId.Fantom,
  fallback = 'invalid address',
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
    return <Text {...props}>{renderAddress()}</Text>
  }

  if (!type) return render()

  if (type === 'copy')
    return (
      <Button variant="unstyled" onClick={onCopy} p={0} m={0}>
        <Stack direction="row" align="center" spacing={0}>
          {render()}
          <Tooltip label="Copied" placement="top" isOpen={hasCopied}>
            <CopyIcon w={6} h={6} color="primary" />
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
