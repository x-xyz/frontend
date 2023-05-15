import { fetchPrice } from '@x/apis/dist/fn/coin'
import { useMemo } from 'react'
import XposureSlides from 'components/home/XposureSlides/ImageSlides'
import * as yugaConfig from 'configs/yuga-collections'

import {
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { ChainId } from '@x/models'
import { useQuery } from 'react-query'
import { fetchCollectionV2 } from '@x/apis/fn'

const breakpoint = 'lg'

export default function TopBanner() {
  const { data: bayc } = useQuery(['collection', 1, '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'], fetchCollectionV2)
  const { data: mayc } = useQuery(['collection', 1, '0x60e4d786628fea6478f785a6d7e704777c86a7c6'], fetchCollectionV2)
  const { data: bakc } = useQuery(['collection', 1, '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623'], fetchCollectionV2)
  const { data: otherside } = useQuery(
    ['collection', 1, '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258'],
    fetchCollectionV2,
  )
  const baycFloorPrice = useMemo(() => bayc?.openseaFloorPriceInNative || 0, [bayc])
  const maycFloorPrice = useMemo(() => mayc?.openseaFloorPriceInNative || 0, [mayc])
  const bakcFloorPrice = useMemo(() => bakc?.openseaFloorPriceInNative || 0, [bakc])
  const othersideFloorPrice = useMemo(() => otherside?.openseaFloorPriceInNative || 0, [otherside])
  const kodaFloorPrice = useMemo(() => otherside?.traitFloorPrice?.['Has Koda']?.['True'] || 0, [otherside])

  const { data: ethPrice, isLoading: isLoadingEthPrice } = useQuery(['eth-price', 'ethereum'], fetchPrice)
  const { data: apePrice, isLoading: isLoadingApePrice } = useQuery(['ape-price', 'apecoin'], fetchPrice)

  const apeFloorPrice = (ethFloorPrice: number) => {
    if (isLoadingApePrice || isLoadingEthPrice) return 0
    return (ethFloorPrice * Number(ethPrice)) / Number(apePrice)
  }

  return (
    <>
      <Center
        bgImg={{
          base: 'url(/assets/wagmi-4/mobile_home_banner_640x420.jpg)',
          [breakpoint]: 'url(/assets/wagmi-4/homepage_Banner_2560x580.jpg)',
        }}
        bgRepeat="no-repeat"
        bgSize={{ base: 'auto 580px', [breakpoint]: 'cover' }}
        bgPos={{ base: 'top center', [breakpoint]: 'center' }}
      >
        <Container maxW="container.xl">
          <Grid
            templateColumns={{ base: '1fr', [breakpoint]: '1fr 1fr' }}
            templateRows={{ base: '360px 600px', [breakpoint]: '580px' }}
          >
            <GridItem pt={15}>
              <Stack>
                <Heading size="md" textTransform="capitalize">
                  [EXTENDED] Yuga Labs: The Otherside Promotion
                </Heading>
                <Heading size="xl" textTransform="uppercase" lineHeight={0.8}>
                  limited
                  <br />
                  time only
                </Heading>
                <Heading size="sm" color="primary">
                  Promotion Currently Live!
                </Heading>
              </Stack>
            </GridItem>
            <GridItem pt={15}>
              <Center w="full">
                <XposureSlides
                  images={yugaConfig.collections.map(c => ({
                    chainId: ChainId.Ethereum,
                    address: c.contract,
                    src: c.image,
                  }))}
                />
              </Center>
            </GridItem>
          </Grid>
        </Container>
      </Center>
      <Box h={15} />
      <Container maxW="container.xl">
        <Stack align="center" spacing={8}>
          <Heading textAlign="center" fontSize="24px">
            Listers earn rewards every hour their NFT is listed.
            <br />
            The rewards are claimable every 24 hours.
          </Heading>
          <Text color="note">
            To be eligible for rewards, a Listing must be priced at or below the Current Reward Floor Price shown below
            when it’s listed.
          </Text>
          <Box maxW="full" overflowX="auto">
            <Table variant="simple" bg="unset" borderTop="1px solid" borderTopColor="divider">
              <Thead>
                <Tr>
                  <Th rowSpan={2} verticalAlign="top" color="white" fontSize="md" pb={0}>
                    NFT Collection
                  </Th>
                  <Th fontSize="md" colSpan={3} color="white" pb={0}>
                    List Longer & you&apos;ll earn
                  </Th>
                  <Th fontSize="md" colSpan={2} color="white" pb={0}>
                    Current Reward Floor Price
                  </Th>
                </Tr>
                <Tr>
                  <Th pt={2} colSpan={3}>
                    X tokens earned per NFT listed per period of time
                  </Th>
                  <Th pt={2}>Floor - ETH</Th>
                  <Th pt={2}>Floor - APE</Th>
                </Tr>
              </Thead>
              <Tbody sx={{ '& > tr > td': { py: 4 } }}>
                <Tr>
                  <Td>Koda</Td>
                  <Td>
                    2,976{' '}
                    <Text as="span" color="note">
                      (X/hr)
                    </Text>
                  </Td>
                  <Td>
                    71,429{' '}
                    <Text as="span" color="note">
                      (X/24hrs)
                    </Text>
                  </Td>
                  <Td pr={'100px'}>
                    500,000{' '}
                    <Text as="span" color="note">
                      (X/wk)
                    </Text>
                  </Td>
                  <Td>{kodaFloorPrice.toLocaleString()} ETH</Td>
                  <Td>{apeFloorPrice(kodaFloorPrice).toLocaleString()} APE</Td>
                </Tr>
                <Tr>
                  <Td>BAYC</Td>
                  <Td>
                    1,339{' '}
                    <Text as="span" color="note">
                      (X/hr)
                    </Text>
                  </Td>
                  <Td>
                    32,143{' '}
                    <Text as="span" color="note">
                      (X/24hrs)
                    </Text>
                  </Td>
                  <Td>
                    225,000{' '}
                    <Text as="span" color="note">
                      (X/wk)
                    </Text>
                  </Td>
                  <Td>{baycFloorPrice.toLocaleString()} ETH</Td>
                  <Td>{apeFloorPrice(baycFloorPrice).toLocaleString()} APE</Td>
                </Tr>
                <Tr>
                  <Td>MAYC</Td>
                  <Td>
                    673{' '}
                    <Text as="span" color="note">
                      (X/hr)
                    </Text>
                  </Td>
                  <Td>
                    16,143{' '}
                    <Text as="span" color="note">
                      (X/24hrs)
                    </Text>
                  </Td>
                  <Td>
                    113,000{' '}
                    <Text as="span" color="note">
                      (X/wk)
                    </Text>
                  </Td>
                  <Td>{maycFloorPrice.toLocaleString()} ETH</Td>
                  <Td>{apeFloorPrice(maycFloorPrice).toLocaleString()} APE</Td>
                </Tr>
                <Tr>
                  <Td>Otherside</Td>
                  <Td>
                    673{' '}
                    <Text as="span" color="note">
                      (X/hr)
                    </Text>
                  </Td>
                  <Td>
                    16,143{' '}
                    <Text as="span" color="note">
                      (X/24hrs)
                    </Text>
                  </Td>
                  <Td>
                    113,000{' '}
                    <Text as="span" color="note">
                      (X/wk)
                    </Text>
                  </Td>
                  <Td>{othersideFloorPrice.toLocaleString()} ETH</Td>
                  <Td>{apeFloorPrice(othersideFloorPrice).toLocaleString()} APE</Td>
                </Tr>
                <Tr>
                  <Td>BAKC</Td>
                  <Td>
                    226{' '}
                    <Text as="span" color="note">
                      (X/hr)
                    </Text>
                  </Td>
                  <Td>
                    5,429{' '}
                    <Text as="span" color="note">
                      (X/24hrs)
                    </Text>
                  </Td>
                  <Td>
                    38,000{' '}
                    <Text as="span" color="note">
                      (X/wk)
                    </Text>
                  </Td>
                  <Td>{bakcFloorPrice.toLocaleString()} ETH</Td>
                  <Td>{apeFloorPrice(bakcFloorPrice).toLocaleString()} APE</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Container>
    </>
  )
}
