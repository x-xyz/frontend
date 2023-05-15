import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { Image as ChakraImage } from '@chakra-ui/image'
import { Center } from '@chakra-ui/layout'
import { Skeleton, SkeletonProps } from '@chakra-ui/skeleton'
import { fetchImageFromIpfs, isBase64 } from '@x/utils'

export default function Image({
  src,
  children,
  isLoaded = true,
  ...props
}: SkeletonProps & { src?: string; children?: (data: string) => React.ReactNode }) {
  const [data, setData] = useState<string>()

  const [isLoading, setLoading] = useState(false)

  const { ref, inView } = useInView()

  useEffect(() => {
    if (!inView) return

    if (!src) {
      setData(void 0)
      return
    }

    let stale = false

    if (/^https?:\/\//.test(src) || /^\//.test(src)) {
      setData(src)
    } else if (isBase64(src) || /^blob:/.test(src)) {
      setData(src)
    } else {
      setLoading(true)

      const cid = src.replace(/^ipfs:\/\//, '')

      fetchImageFromIpfs(cid)
        .then(data => {
          if (!stale) setData(data)
        })
        .catch()
        .then(() => {
          if (!stale) setLoading(false)
        })
    }

    return () => {
      stale = true
    }
  }, [src, inView])

  return (
    <Skeleton as={Center} ref={ref} isLoaded={isLoaded && !isLoading} {...props}>
      {data && (children ? children(data) : <ChakraImage src={data} maxH="full" />)}
    </Skeleton>
  )
}
