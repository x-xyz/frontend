import { Box, BoxProps, Center } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import Image from 'components/Image'

export interface MediaProps extends BoxProps {
  contentType?: 'image' | 'video' | 'embed' | 'gif' | 'youtube'
  mimetype?: string
  src?: string
  isLoading?: boolean
}

export default function Media({ contentType = 'image', mimetype, src, isLoading, ...props }: MediaProps) {
  if (isLoading || !src) return <Skeleton w="400px" h="400px" maxW="100%" maxH="100%" {...props} />

  if (contentType === 'video' || src.includes('youtube')) {
    return (
      <video width="100%" height="100%" controls muted autoPlay loop>
        <source src={src} type={mimetype || 'video/mp4'} />
      </video>
    )
  }

  if (contentType === 'embed') {
    return (
      <Box {...props}>
        <iframe width="100%" height="100%" src={src} />
      </Box>
    )
  }

  return (
    <Center bg="rgba(0, 0, 0, 0.4)" {...props}>
      <Image src={src} w="full" h="full" />
    </Center>
  )
}
