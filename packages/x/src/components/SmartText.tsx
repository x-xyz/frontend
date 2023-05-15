import { Text } from '@chakra-ui/layout'
import { isAddress } from '@x/utils'
import Address, { AddressProps } from './Address'
import Link from './Link'

export interface SmartTextProps extends AddressProps {
  children: string
}

export default function StartText({ children, type, chainId, ...props }: SmartTextProps) {
  if (isAddress(children))
    return (
      <Address type={type} chainId={chainId} {...props}>
        {children}
      </Address>
    )

  if (/^https?:\/\//.test(children)) return <Link href={children}>Link</Link>

  return <Text {...props}>{children}</Text>
}
