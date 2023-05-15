import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { getChainName, getChainNameForUrl } from '@x/constants/dist'

import Image from 'components/Image'
import Link from 'components/Link'
import { useState } from 'react'
import Slider, { CustomArrowProps } from 'react-slick'

import { AspectRatio, Box, Button, Heading, SkeletonText, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { ChainId } from '@x/models'
import { useQuery } from 'react-query'
import { fetchCollectionV2 } from '@x/apis/fn'
import Address from 'components/Address'

export interface NftId {
  chainId: ChainId
  contract: string
  tokenId: string
}

export interface XposureSlidesProps {
  images: { src: string; chainId: ChainId; address: string }[]
}

const width = '340px'
const breakpoint = 'lg'

export default function XposureSlides({ images }: XposureSlidesProps) {
  const [current, setCurrent] = useState(0)
  const showArrow = useBreakpointValue({ base: false, md: true })
  const isDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  return (
    <Stack maxW={width} pos="relative">
      <Heading size="sm" textAlign={isDesktopView ? 'start' : 'center'} mb={isDesktopView ? '0' : '10'}>
        X-posure
      </Heading>
      <Slider
        draggable
        slidesToShow={1}
        slidesToScroll={1}
        beforeChange={(_, next) => setCurrent(next)}
        arrows={showArrow}
        prevArrow={<PrevArrow />}
        nextArrow={<NextArrow />}
      >
        {images.map(image => (
          <Slide key={image.src} image={image} />
        ))}
      </Slider>
      <Stack
        direction="row"
        align="center"
        pos="absolute"
        top={{ base: `calc(380px + 42px)`, [breakpoint]: `calc(${width} + 42px)` }}
        w="full"
        mt="52px"
      >
        <Box flexGrow={1} bg="divider" h="3px">
          <Box w={`${((current + 1) / images.length) * 100}%`} h="full" bg="text" transition="width .3s" />
        </Box>
        <Text fontSize="sm">
          <Text as="span">{current + 1}</Text>
          <Text as="span" color="value">
            /{images.length}
          </Text>
        </Text>
      </Stack>
    </Stack>
  )
}

interface SlideProps {
  image: { src: string; chainId: ChainId; address: string }
}

function Slide({ image }: SlideProps) {
  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', image.chainId, image.address],
    fetchCollectionV2,
  )

  const chainName = getChainNameForUrl(image.chainId)

  return (
    <Box w={width}>
      <Link href={collection && `/collection/${chainName}/${collection.erc721Address}`}>
        <AspectRatio ratio={1} w={width} border="10px solid #fff">
          <Image w="full" h="full" src={image.src} />
        </AspectRatio>
      </Link>
      <Box h={10} />
      <Stack direction="row" align="center" spacing={3}>
        <Image
          w="30px"
          h="30px"
          border="2px solid"
          borderColor="divider"
          borderRadius="15px"
          overflow="hidden"
          src={collection?.logoImageUrl || collection?.logoImageHash}
          isLoaded={!isLoadingCollection}
        />
        <SkeletonText w="40%" fontSize="sm" lineHeight={1.2} isLoaded={!isLoadingCollection} noOfLines={2}>
          {collection?.collectionName}
          {collection?.owner && (
            <Address fontSize="xs" fontWeight="bold">
              {collection?.owner}
            </Address>
          )}
        </SkeletonText>
      </Stack>
    </Box>
  )
}

function PrevArrow({ onClick }: CustomArrowProps) {
  return (
    <Button
      variant="unstyled"
      pos="absolute"
      top="154px"
      left="-50px"
      _hover={{ transform: 'scale(0.9)' }}
      onClick={onClick}
    >
      <Image w="30px" h="52px" src="/assets/v3/ico-left-arrow-60x104.png" />
    </Button>
  )
}

function NextArrow({ onClick }: CustomArrowProps) {
  return (
    <Button
      variant="unstyled"
      pos="absolute"
      top="154px"
      right="-50px"
      _hover={{ transform: 'scale(0.9)' }}
      onClick={onClick}
    >
      <Image w="30px" h="52px" src="/assets/v3/ico-right-arrow-60x104.png" />
    </Button>
  )
}
