import {
  Box,
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ChainId } from '@x/models'
import Link from 'components/Link'
import XposureSlides from './XposureSlides'
import XposureImageSlides from './XposureSlides/ImageSlides'

const breakpoint = 'lg'

export interface XposureSectionProps {
  nfts?: { chainId: ChainId; contract: string; tokenId: string }[]
  images: { src: string; chainId: ChainId; address: string }[]
}

export default function XposureSection({ nfts, images }: XposureSectionProps) {
  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  function renderSlider() {
    return (
      <Center w="full">
        {nfts && <XposureSlides nfts={nfts} />}
        {images && <XposureImageSlides images={images} />}
      </Center>
    )
  }

  const bg = useDesktopView
    ? 'url(/assets/v3/homepage_Banner_2560x580.jpg)'
    : 'url(/assets/v3/mobile_home_banner_640x420.jpg)'

  return (
    <Center
      bg={bg}
      bgRepeat="no-repeat"
      bgSize={{ base: 'auto 420px', [breakpoint]: 'cover' }}
      bgPos={{ base: 'top center', [breakpoint]: 'center' }}
    >
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: '1fr', [breakpoint]: '1fr 1fr' }}
          templateRows={{ base: '420px 600px', [breakpoint]: '580px' }}
        >
          <GridItem pt={15}>
            <Stack>
              <Heading size="xl" textTransform="uppercase" lineHeight={0.8}>
                start
                <br />
                something
                <br />
                big
              </Heading>
              <Heading size="xs" textTransform="uppercase">
                X Gon’ Give It To Ya
              </Heading>
              <Text color="primary" fontSize="lg" fontFamily="heading">
                1.69% Marketplace Fee
              </Text>
              <Box h={10} />
              <Stack direction="row" spacing={4}>
                <Link href="#about-x">
                  <Button>About X</Button>
                </Link>
                <Link href="https://app.sushi.com/swap?outputCurrency=0x7f3141c4d6b047fb930991b450f1ed996a51cb26">
                  <Button>Buy X</Button>
                </Link>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem pt={15}>{renderSlider()}</GridItem>
        </Grid>
      </Container>
    </Center>
  )
}
