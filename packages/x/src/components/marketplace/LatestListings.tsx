import { fetchAccountV2 } from '@x/apis/dist/fn'
import Address from 'components/Address'
import ChainIcon from 'components/ChainIcon'
import Image from 'components/Image'
import Link from 'components/Link'
import { useMemo, useState } from 'react'

import { Button } from '@chakra-ui/button'
import { Box, Center, Heading, Stack, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { useTokensQuery } from '@x/apis'
import { LeftArrowIcon } from '@x/components/icons'
import { getChainName, getChainNameForUrl } from '@x/constants/dist'
import { useParsedMetadata } from '@x/hooks'
import { NftItem, SortableColumn, SortDir, TokenStatus } from '@x/models'
import { useQuery } from 'react-query'

import BuyButton from './BuyButton'
import Price from 'components/Price'

export default function LatestListings() {
  const { data, isLoading } = useTokensQuery({
    status: [TokenStatus.BuyNow],
    sortBy: SortableColumn.ListedAt,
    sortDir: SortDir.Desc,
    limit: 5,
  })

  const items = useMemo(() => data?.data?.items || [], [data])

  const [index, setIndex] = useState(0)

  return (
    <Stack spacing={4}>
      <Heading as="h4" fontSize="2xl">
        Latest Listings
      </Heading>
      <Box bg="panel" p={6} borderRadius="12px" pos="relative">
        {items[index] ? (
          <LatestListing nftitem={items[index]} />
        ) : isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <Center>No listing</Center>
        )}
        <Button
          size="sm"
          variant="unstyled"
          pos="absolute"
          top="50%"
          left="-16px"
          marginTop="-16px"
          onClick={() => setIndex(prev => prev - 1)}
          disabled={index === 0}
        >
          <Center bg="white" w="32px" h="32px" borderRadius="16px">
            <LeftArrowIcon color="black" />
          </Center>
        </Button>
        <Button
          size="sm"
          variant="unstyled"
          pos="absolute"
          top="50%"
          right="-16px"
          marginTop="-16px"
          onClick={() => setIndex(prev => prev + 1)}
          disabled={index >= items.length - 1}
        >
          <Center bg="white" w="32px" h="32px" borderRadius="16px">
            <LeftArrowIcon color="black" transform="scaleX(-1)" />
          </Center>
        </Button>
      </Box>
      <Link href="/marketplace?sortBy=listedAt&filterBy=buynow">More listings</Link>
    </Stack>
  )
}

interface RunningAuctionProps {
  nftitem: NftItem
}

function LatestListing({ nftitem }: RunningAuctionProps) {
  const { chainId, contractAddress, tokenId } = nftitem

  const [metadata] = useParsedMetadata(nftitem.hostedTokenUri || nftitem.tokenUri)

  const { data: owner } = useQuery(['account', nftitem.owner || ''], fetchAccountV2, { enabled: !!nftitem.owner })

  return (
    <Stack>
      <Stack direction="row" alignItems="center">
        <ChainIcon chainId={chainId} w="32px" h="32px" />
        <Text>{getChainName(chainId)}</Text>
      </Stack>
      <Image src={nftitem.hostedImageUrl || nftitem.imageUrl} />
      <Link href={`/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${tokenId}`}>{nftitem.name}</Link>
      <Text>{metadata?.description}</Text>
      <Stack direction="row" align="center">
        {owner?.imageUrl ||
          (owner?.imageHash && (
            <Image w="48px" h="48px" borderRadius="24px" overflow="hidden" src={owner?.imageUrl || owner?.imageHash} />
          ))}
        <Stack>
          {owner?.alias && <Text>{owner?.alias}</Text>}
          {nftitem.owner && <Address>{nftitem.owner}</Address>}
        </Stack>
      </Stack>
      <Box h={8} />
      {nftitem.owner && (
        <BuyButton
          variant="primary"
          chainId={chainId}
          contractAddress={contractAddress}
          tokenID={tokenId}
          seller={nftitem.owner}
          price={nftitem.price}
          paymentToken={nftitem.paymentToken}
          expired={false}
        >
          <Price chainId={chainId} tokenId={nftitem.paymentToken} usdPrice={nftitem.priceInUsd}>
            {nftitem.price}
          </Price>
        </BuyButton>
      )}
    </Stack>
  )
}
