import Head from 'next/head'
import { Avatar } from '@chakra-ui/avatar'
import { Center, BoxProps } from '@chakra-ui/layout'
import { useInterval } from '@x/hooks'
import { useMemo, useState } from 'react'
import times from 'lodash/times'

export interface NavIconProps extends BoxProps {
  assetsFolder: string
  imageCount: number
}

export default function NavIcon({ assetsFolder, imageCount, ...props }: NavIconProps) {
  const [index, setIndex] = useState(0)

  const images = useMemo(
    () => times(imageCount).map(index => `${assetsFolder}/navicon${index}.webp`),
    [assetsFolder, imageCount],
  )

  useInterval(() => {
    setIndex(prev => {
      const next = prev + 1
      return next >= images.length ? 0 : next
    })
  }, 800)

  return (
    <Center
      borderRadius="200px"
      overflow="hidden"
      bg="linear-gradient(150.71deg, #C471ED -30.38%, #F7797D 41.23%, rgba(251, 215, 134, 0.81) 115.2%)"
      padding="2px"
      {...props}
    >
      <Head>
        {images.map(image => (
          <link key={image} rel="prefetch" href={image} />
        ))}
      </Head>
      <Avatar src={images[index]} w="100%" h="100%" />
    </Center>
  )
}
