import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import Address from 'components/Address'
import Image from 'components/Image'
import Media from 'components/Media'
import Link from 'components/Link'
import { useState } from 'react'
import Slider, { CustomArrowProps } from 'react-slick'

import { AspectRatio, Box, Button, Heading, SkeletonText, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { useCollectionQuery, useTokenQuery } from '@x/apis'
import { getChainNameForUrl } from '@x/constants'
import { ChainId } from '@x/models'

export interface NftId {
  chainId: ChainId
  contract: string
  tokenId: string
}

export interface XposureSlidesProps {
  nfts: NftId[]
}

const width = '340px'
const breakpoint = 'lg'

export default function XposureSlides({ nfts }: XposureSlidesProps) {
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
        {nfts.map(nft => (
          <Slide key={`${nft.chainId}-${nft.contract}-${nft.tokenId}`} nft={nft} />
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
          <Box w={`${((current + 1) / nfts.length) * 100}%`} h="full" bg="text" transition="width .3s" />
        </Box>
        <Text fontSize="sm">
          <Text as="span">{current + 1}</Text>
          <Text as="span" color="value">
            /{nfts.length}
          </Text>
        </Text>
      </Stack>
    </Stack>
  )
}

interface SlideProps {
  nft: NftId
}

function Slide({ nft }: SlideProps) {
  const { data: collection, isLoading: isLoadingCollection } = useCollectionQuery({ ...nft })

  const { data: token, isLoading: isLoadingToken } = useTokenQuery({ ...nft })

  return (
    <Box w={width}>
      <Link href={`/collection/${getChainNameForUrl(nft.chainId)}/${nft.contract}`}>
        <AspectRatio ratio={1} w={width} border="10px solid #fff">
          <Media
            w="full"
            h="full"
            contentType={token?.data?.animationUrlContentType || token?.data?.contentType}
            mimetype={token?.data?.animationUrlMimeType}
            src={
              token?.data?.hostedAnimationUrl ||
              token?.data?.animationUrl ||
              token?.data?.hostedImageUrl ||
              token?.data?.imageUrl
            }
            isLoading={isLoadingToken}
          />
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
          src={collection?.data?.logoImageUrl || collection?.data?.logoImageHash}
          isLoaded={!isLoadingCollection}
        />
        <SkeletonText w="40%" fontSize="sm" lineHeight={1.2} isLoaded={!isLoadingCollection} noOfLines={2}>
          {collection?.data?.collectionName}
          {collection?.data?.owner && (
            <Address fontSize="xs" fontWeight="bold">
              {collection?.data?.owner}
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
