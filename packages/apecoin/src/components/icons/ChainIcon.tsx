import { Image, ImageProps } from '@chakra-ui/image'
import { ChainId, getChain } from '@x/constants'
import { useMemo } from 'react'
import getChainIcon from 'utils/getChainIcon'

export interface ChainIconProps extends ImageProps {
  chainId: ChainId
}

export default function ChainIcon({ chainId, ...props }: ChainIconProps) {
  const chain = useMemo(() => getChain(chainId), [chainId])

  return <Image src={getChainIcon(chain)} borderRadius="200px" border="2px solid" borderColor="divider" {...props} />
}
