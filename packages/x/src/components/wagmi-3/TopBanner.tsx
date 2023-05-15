import { Center, Container, Grid, GridItem, Heading, Stack } from '@chakra-ui/react'
import XposureSlides from 'components/home/XposureSlides'
import { nfts } from 'configs/wagmi-3'

const breakpoint = 'lg'

export default function TopBanner() {
  return (
    <Center
      bgImg={{
        base: 'url(/assets/v3/mobile_wagmi_promotions_640x560.jpg)',
        [breakpoint]: 'url(/assets/v3/wagmi_promo_2560x700.jpg)',
      }}
      bgRepeat="no-repeat"
      bgSize={{ base: 'auto 560px', [breakpoint]: 'cover' }}
      bgPos={{ base: 'top center', [breakpoint]: 'center' }}
    >
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: '1fr', [breakpoint]: '1fr 1fr' }}
          templateRows={{ base: '560px 600px', [breakpoint]: '700px' }}
        >
          <GridItem pt={15}>
            <Stack>
              <Heading size="md" textTransform="capitalize">
                Monthly Special Promotion
              </Heading>
              <Heading size="xl" textTransform="uppercase" lineHeight={0.8}>
                limited
                <br />
                time only
              </Heading>
              <Heading size="sm">Promotions ends on 22 March 09:00 UTC</Heading>
            </Stack>
          </GridItem>
          <GridItem pt={15}>
            <Center w="full">
              <XposureSlides nfts={nfts} />
            </Center>
          </GridItem>
        </Grid>
      </Container>
    </Center>
  )
}
