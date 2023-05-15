import { Box, BoxProps, Center } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import Image from 'components/Image'

export interface MediaProps extends BoxProps {
  contentType?: 'image' | 'video' | 'embed' | 'gif' | 'youtube'
  src?: string
  isLoading?: boolean
}

export default function Media({ contentType = 'image', src, isLoading, ...props }: MediaProps) {
  if (isLoading) return <Skeleton w="400px" h="400px" maxW="100%" maxH="100%" />

  if (contentType === 'video' || src?.includes('youtube')) {
    /**
     * @todo play video
     */
    return null
  }

  if (contentType === 'embed') {
    return (
      <Box {...props}>
        <iframe width="100%" height="100%" src={src} />
      </Box>
    )
  }

  return (
    <Center bg="panel" {...props}>
      <Image src={src} />
    </Center>
  )
}
