import times from 'lodash/times'
import { useRouter } from 'next/router'

import {
  Box,
  Center,
  Container,
  Divider,
  Heading,
  List,
  ListItem,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useTopCollectionsQuery } from '@x/apis/dist'
import { CollectionTradingVolumePeriod, CollectionWithTradingVolume } from '@x/models/dist'

import SelectPeriod from './SelectPeriod'
import { useState } from 'react'
import Image from 'components/Image'
import Link from 'components/Link'
import { getChainNameForUrl } from '@x/constants/dist'

const breakpoint = 'lg'

export default function TopCollections() {
  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const { locale } = useRouter()

  const [periodType, setPeriodType] = useState(CollectionTradingVolumePeriod.Day)

  const { data, isLoading } = useTopCollectionsQuery({ periodType, limit: 15 })

  function renderSeeAllButton() {
    // return <Button>View Stats</Button>
    return null
  }

  function renderChangeRate(value: number) {
    if (value === -1) return <Text fontSize="sm">-</Text>
    if (value === 0) return <Text fontSize="sm">0%</Text>
    if (value > 0)
      return (
        <Text fontSize="sm" color="success">
          +{(value * 100).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </Text>
      )
    return (
      <Text fontSize="sm" color="danger">
        {(value * 100).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
      </Text>
    )
  }

  function renderCollection(
    {
      collectionName,
      volumeInUsd,
      changeRatio,
      logoImageHash,
      logoImageUrl,
      chainId,
      erc721Address,
    }: CollectionWithTradingVolume,
    index: number,
  ) {
    return (
      <ListItem key={index} w="360px" my={2.5}>
        <Stack direction="row" align="center" spacing={3}>
          <Text w={6} fontSize="xs" color="note" fontWeight="bold">
            {index + 1}
          </Text>
          <Image
            w={10}
            h={10}
            borderRadius="20px"
            overflow="hidden"
            flexShrink={0}
            src={logoImageUrl || logoImageHash}
          />
          <Stack spacing={0}>
            <Link
              fontSize="sm"
              fontWeight="bold"
              maxW="140px"
              isTruncated
              href={`/collection/${getChainNameForUrl(chainId)}/${erc721Address}`}
            >
              {collectionName}
            </Link>
            <Text fontSize="sm" color="value">
              {volumeInUsd.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USD
            </Text>
          </Stack>
          <Spacer />
          {renderChangeRate(changeRatio)}
        </Stack>
      </ListItem>
    )
  }

  return (
    <Center flexDir="column">
      <Container maxW="container.xl">
        <Stack direction="row" justify="center" align="center" spacing={4}>
          <Heading>Industry Top Collections over last</Heading>
          <SelectPeriod value={periodType} onChange={setPeriodType} />
          {useDesktopView && <Spacer />}
          {useDesktopView && renderSeeAllButton()}
        </Stack>
      </Container>
      <Divider bg="divider" mt={4} mb={10} />
      <Container maxW="container.xl">
        <Box overflowX={{ base: 'auto', [breakpoint]: 'hidden' }} pb={5}>
          <Stack direction="row" spacing={10}>
            <List variant="ghost" h="390px" display="flex" flexDir="column" flexWrap="wrap">
              {data?.data?.map(renderCollection)}
              {isLoading && times(15).map((_, i) => <SkeletonItem key={i} index={i} />)}
            </List>
          </Stack>
        </Box>
      </Container>
      {!useDesktopView && (
        <Box mt={10} mb={16}>
          {renderSeeAllButton()}
        </Box>
      )}
    </Center>
  )
}

function SkeletonItem({ index }: { index: number }) {
  return (
    <ListItem w="360px" my={2.5}>
      <Stack direction="row" align="center" spacing={3}>
        <Text w={6} fontSize="xs" color="note" fontWeight="bold">
          {index + 1}
        </Text>
        <SkeletonCircle w={10} h={10} />
        <Stack spacing={2}>
          <SkeletonText fontSize="sm" fontWeight="bold" noOfLines={1}>
            Collection name
          </SkeletonText>
          <SkeletonText fontSize="sm" color="value" noOfLines={1}>
            0.00 USD
          </SkeletonText>
        </Stack>
        <Spacer />
        <SkeletonText fontSize="sm" color="success" noOfLines={1}>
          +0.00%
        </SkeletonText>
      </Stack>
    </ListItem>
  )
}
