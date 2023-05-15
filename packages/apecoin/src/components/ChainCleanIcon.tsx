import { Image, ImageProps } from '@chakra-ui/image'
import { ChainId, getChain } from '@x/constants'
import { useMemo } from 'react'
import getChainCleanIcon from '../utils/getChainCleanIcon'

export interface ChainCleanIconProps extends ImageProps {
  chainId: ChainId
}

export default function ChainCleanIcon({ chainId, ...props }: ChainCleanIconProps) {
  const chain = useMemo(() => getChain(chainId), [chainId])

  return <Image src={getChainCleanIcon(chain)} {...props} />
}
