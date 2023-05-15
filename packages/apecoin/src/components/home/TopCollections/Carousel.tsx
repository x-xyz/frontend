import React, { useMemo, useState } from 'react'
import AliceCarousel from 'react-alice-carousel'
import { useTopCollectionsQuery } from '@x/apis/dist'
import { CollectionTradingVolumePeriod, CollectionWithTradingVolume } from '@x/models/dist'
import { Box, Stack, Text } from '@chakra-ui/layout'
import 'react-alice-carousel/lib/alice-carousel.css'
import Image from 'components/Image'
import { Button } from '@chakra-ui/button'
import { chakra, IconButton, useMediaQuery } from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Swiper as SwiperClass } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper'
import 'swiper/css'
import { builtInCollections } from '../../../configs'
import Link from 'components/Link'
import { compareAddress } from '@x/utils/dist'

const ChakraSwiperSlide = chakra(SwiperSlide)

export default function Carousel() {
  const { data, isLoading } = useTopCollectionsQuery({
    periodType: CollectionTradingVolumePeriod.All,
    limit: 100,
    yugaLab: true,
  })

  const [isLargerThan500] = useMediaQuery('(min-width: 500px)')

  const renderCollection = (c: CollectionWithTradingVolume) => {
    return (
      <Box
        w="full"
        h="full"
        position="relative"
        border="1px solid"
        borderColor="#1e1e1e"
        borderRadius="16px"
        overflow="hidden"
      >
        <Link
          fontWeight="bold"
          maxW="140px"
          isTruncated
          href={`/collection/${builtInCollections.find(bc => compareAddress(bc.address, c.erc721Address))?.alias}`}
        >
          <Image w="full" h="full" borderRadius="16px" m={0} src={c.logoImageUrl || c.logoImageHash} />
        </Link>
        <Stack
          position="absolute"
          bottom={0}
          w="full"
          background="linear-gradient(360deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);"
          pt={5}
          pl={4}
          pb={2}
          fontSize="sm"
          fontWeight={500}
          spacing={0}
        >
          <Text variant="subtitle2">{c.collectionName}</Text>
          <Text variant="captionSub">
            Floor Price:{' '}
            {c.openseaFloorPriceInNative.toLocaleString(void 0, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}{' '}
            ETH
          </Text>
        </Stack>
      </Box>
    )
  }

  const items = data?.data || []

  const [swiper, setSwiper] = useState<SwiperClass>()

  const slidePrev = () => {
    swiper && swiper.slidePrev()
  }

  const slideNext = () => {
    swiper && swiper.slideNext()
  }

  return (
    <Box w="full" position="relative" maxW="90vw">
      {items.length > 0 && (
        <Swiper
          modules={[Navigation, Autoplay]}
          centeredSlides={!isLargerThan500}
          loop
          slidesPerView={isLargerThan500 ? 'auto' : 'auto'}
          spaceBetween={12}
          onSwiper={setSwiper}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
        >
          {items.map(item => (
            <ChakraSwiperSlide
              w={isLargerThan500 ? '284px' : '72vw'}
              h={isLargerThan500 ? '284px' : '72vw'}
              key={item.collectionName}
            >
              {renderCollection(item)}
              {/*<chakra.div w="20px" h="20px" bg="red"></chakra.div>*/}
            </ChakraSwiperSlide>
          ))}
        </Swiper>
      )}
      {swiper && items.length > 0 && (
        <Box
          position="absolute"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          top={0}
          bottom={0}
          left={0}
          right={0}
          zIndex={2}
          pointerEvents="none"
        >
          <IconButton
            // position="absolute"
            left="-18px"
            bottom="8px"
            borderRadius="full"
            variant="icon"
            onClick={() => slidePrev()}
            aria-label="prev"
            icon={<FaChevronLeft />}
            pointerEvents="all"
          />
          <IconButton
            // position="absolute"
            right="-18px"
            bottom="8px"
            borderRadius="full"
            variant="icon"
            onClick={() => slideNext()}
            aria-label="next"
            icon={<FaChevronRight />}
            pointerEvents="all"
          />
        </Box>
      )}
    </Box>
  )
}
