import { Image, ImageProps } from '@chakra-ui/image'
import { ChainId } from '@x/constants'
import { findToken } from '@x/constants'
import { useMemo } from 'react'
import getTokenIcon from 'utils/getTokenIcon'

export interface TokenIconProps extends ImageProps {
  tokenId: string
  chainId?: ChainId
}

export default function TokenIcon({ tokenId: id, chainId, ...props }: TokenIconProps) {
  const token = useMemo(() => findToken(id, chainId), [id, chainId])

  if (!token) return null

  return <Image src={getTokenIcon(token)} {...props} />
}
