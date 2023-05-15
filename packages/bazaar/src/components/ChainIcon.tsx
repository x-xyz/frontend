import { Image, ImageProps } from '@chakra-ui/image'
import { ChainId, getChain } from '@x/constants'
import { useMemo } from 'react'

export interface ChainIconProps extends ImageProps {
  chainId: ChainId
}

export default function ChainIcon({ chainId, ...props }: ChainIconProps) {
  const chain = useMemo(() => getChain(chainId), [chainId])

  return <Image src={chain.icon} {...props} />
}
