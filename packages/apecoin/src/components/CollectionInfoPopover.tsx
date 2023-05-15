import { useQuery } from 'react-query'

import {
  Button,
  Divider,
  Grid,
  GridItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react'
import { fetchPrice } from '@x/apis/dist/fn/coin'
import { fetchCollectionV2 } from '@x/apis/fn'
import { getChain } from '@x/constants'
import { ChainId, Collection } from '@x/models'

import Markdown from './Markdown'

export interface CollectionInfoPopoverProps {
  chainId: ChainId
  address: string
  initialData?: Collection
}

export default function CollectionInfoPopover({ chainId, address, initialData }: CollectionInfoPopoverProps) {
  const { data = initialData, isLoading } = useQuery(['collection', chainId, address], fetchCollectionV2, {
    initialData,
  })

  const nativeToken = getChain(chainId).nativeCurrency

  const { data: ethereumPrice = '1', isLoading: isLoadingEthereumPrice } = useQuery(['price', 'ethereum'], fetchPrice)

  const { data: apecoinPrice = '1', isLoading: isLoadingApecoinPrice } = useQuery(['price', 'apecoin'], fetchPrice)

  const {
    openseaFloorPriceInNative = 0,
    openseaFloorPriceInApe = 0,
    openseaSalesVolume = 0,
    highestSale = 0,
    highestSaleInUsd = 0,
  } = data || {}

  function renderPriceStat(
    label: string,
    native: number,
    usd = native * parseFloat(ethereumPrice),
    ape = usd / parseFloat(apecoinPrice),
    isLoading?: boolean,
  ) {
    const isLoadingUsdPrice = !usd && isLoadingEthereumPrice
    return (
      <Stack direction="row" align="center" fontSize="xs">
        <Text fontWeight="bold">{label}: </Text>
        <SkeletonText noOfLines={1} isLoaded={!isLoadingUsdPrice && !isLoadingApecoinPrice}>
          {ape.toLocaleString(void 0, { maximumFractionDigits: 2 })} APE
        </SkeletonText>
        <Text>/</Text>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          {native.toLocaleString(void 0, { maximumFractionDigits: 2 })} {nativeToken.symbol}
        </SkeletonText>
        <Text>/</Text>
        <SkeletonText noOfLines={1} isLoaded={!isLoadingUsdPrice} color="value">
          {usd.toLocaleString(void 0, { maximumFractionDigits: 2 })} USD
        </SkeletonText>
      </Stack>
    )
  }

  return (
    <Popover variant="panel" trigger="hover" placement="bottom-start">
      <PopoverTrigger>
        <Button variant="unstyled" color="primary" isLoading={isLoading}>
          Collection Info + Stats
        </Button>
      </PopoverTrigger>
      <PopoverContent w="lg" maxW="100vw">
        <PopoverHeader textTransform="uppercase">collection info + stats</PopoverHeader>
        <PopoverBody p={0} fontSize="sm">
          <Grid
            templateColumns="auto 1fr"
            sx={{
              '&>*': { py: 2, borderBottomColor: 'divider', borderBottomWidth: '1px' },
              '&>*.left-col': { pl: 10 },
              '&>*.right-col': { pl: 5, pr: 10 },
            }}
          >
            <GridItem className="left-col right-col" colSpan={2}>
              <Stack py="30px !important">
                <SkeletonText fontSize="lg" fontWeight="extrabold" noOfLines={1} isLoaded={!isLoading}>
                  {data?.collectionName}
                </SkeletonText>
                <SkeletonText isLoaded={!isLoading} fontSize="sm">
                  {data?.description && <Markdown>{data?.description}</Markdown>}
                </SkeletonText>
              </Stack>
            </GridItem>
            <GridItem className="left-col" fontWeight="bold">
              Reward Floor
              <br />
              Range
            </GridItem>
            <GridItem className="right-col">
              {(openseaFloorPriceInNative * 0.75).toLocaleString(void 0, { maximumFractionDigits: 2 })} ETH to{' '}
              {(openseaFloorPriceInNative * 1.25).toLocaleString(void 0, { maximumFractionDigits: 2 })} ETH
              <br />
              {(openseaFloorPriceInApe * 0.75).toLocaleString(void 0, { maximumFractionDigits: 2 })} APE to{' '}
              {(openseaFloorPriceInApe * 1.25).toLocaleString(void 0, { maximumFractionDigits: 2 })} APE
            </GridItem>
            <GridItem className="left-col" fontWeight="bold">
              Floor
            </GridItem>
            <GridItem className="right-col">
              {openseaFloorPriceInNative.toLocaleString(void 0, { maximumFractionDigits: 2 })} ETH
              <br />
              {openseaFloorPriceInApe.toLocaleString(void 0, { maximumFractionDigits: 2 })} APE
            </GridItem>
            <GridItem className="left-col" fontWeight="bold">
              Highest Sale
            </GridItem>
            <GridItem className="right-col">
              {highestSale.toLocaleString(void 0, { maximumFractionDigits: 2 })} ETH
              <br />
              {(highestSaleInUsd / parseFloat(apecoinPrice)).toLocaleString(void 0, { maximumFractionDigits: 2 })} APE
            </GridItem>
            <GridItem className="left-col" fontWeight="bold">
              Total Volume 24h
            </GridItem>
            <GridItem className="right-col">
              {openseaSalesVolume.toLocaleString(void 0, { maximumFractionDigits: 2 })} ETH
              <br />
              {((openseaSalesVolume * parseFloat(ethereumPrice)) / parseFloat(apecoinPrice)).toLocaleString(void 0, {
                maximumFractionDigits: 2,
              })}{' '}
              APE
            </GridItem>
            <GridItem className="left-col" fontWeight="bold">
              Items
            </GridItem>
            <GridItem className="right-col">{data?.supply?.toLocaleString() || '-'}</GridItem>
            <GridItem className="left-col" fontWeight="bold">
              Owners
            </GridItem>
            <GridItem className="right-col">{data?.numOwners?.toLocaleString() || '-'}</GridItem>
          </Grid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
