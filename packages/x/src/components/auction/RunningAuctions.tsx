import { fetchAccountV2 } from '@x/apis/dist/fn'
import Address from 'components/Address'
import Countdown from 'components/auction/Countdown'
import HighestBidder from 'components/auction/HighestBidder'
import PlaceBidButton from 'components/auction/PlaceBidButton'
import WithdrawBidButton from 'components/auction/WithdrawBidButton'
import ChainIcon from 'components/ChainIcon'
import Image from 'components/Image'
import Link from 'components/Link'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'

import { Button } from '@chakra-ui/button'
import { Box, Center, Heading, Stack, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { useTokensQuery } from '@x/apis'
import { LeftArrowIcon } from '@x/components/icons'
import { getChainName, getChainNameForUrl } from '@x/constants/dist'
import { useActiveWeb3React, useParsedMetadata, useReadonlyAuctionContract, useRunningAuction } from '@x/hooks'
import { Auction, NftItem, SortableColumn, SortDir, TokenStatus } from '@x/models'
import { compareAddress } from '@x/utils'
import { useQuery } from 'react-query'

export default function RunningAuctions() {
  const { data, isLoading } = useTokensQuery({
    status: [TokenStatus.OnAuction],
    sortBy: SortableColumn.AuctionEndTime,
    sortDir: SortDir.Asc,
    limit: 5,
  })

  const items = useMemo(() => data?.data?.items || [], [data])

  const [index, setIndex] = useState(0)

  return (
    <Stack spacing={4}>
      <Heading as="h4" fontSize="2xl">
        Running Auctions
      </Heading>
      <Box bg="panel" p={6} borderRadius="12px" pos="relative">
        {items[index] ? (
          <RunningAuction nftitem={items[index]} />
        ) : isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <Center>No running auctions</Center>
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
      <Link href="/marketplace?sortBy=saleEndsAt&filterBy=onauction">More running auctions</Link>
    </Stack>
  )
}

interface RunningAuctionProps {
  nftitem: NftItem
}

function RunningAuction({ nftitem }: RunningAuctionProps) {
  const { chainId, contractAddress, tokenId } = nftitem

  const { account } = useActiveWeb3React()

  const auctionContract = useReadonlyAuctionContract(chainId)

  const { auction, auctionWinner, auctionHighestBidder, auctionHasStarted, auctionHasEnded } = useRunningAuction(
    auctionContract,
    contractAddress,
    tokenId,
  )

  const [metadata] = useParsedMetadata(nftitem.hostedTokenUri || nftitem.tokenUri)

  const { data: owner } = useQuery(['account', nftitem.owner || ''], fetchAccountV2, { enabled: !!nftitem.owner })

  const startTime = useMemo(() => auction && DateTime.fromSeconds(auction.startTime.toNumber()), [auction])

  const endTime = useMemo(() => auction && DateTime.fromSeconds(auction.endTime.toNumber()), [auction])

  function renderButton(auction: Auction) {
    if (!compareAddress(auction.owner, account) && compareAddress(auctionHighestBidder?.bidder, account)) {
      return (
        <WithdrawBidButton
          chainId={chainId}
          contractAddress={contractAddress}
          tokenID={nftitem.tokenId}
          auction={auction}
        />
      )
    }

    return (
      <PlaceBidButton
        variant="primary"
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={nftitem.tokenId}
        auction={auction}
        highestBidder={auctionHighestBidder}
        disabled={!auctionHasStarted || auctionHasEnded}
      />
    )
  }

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
      {startTime && endTime && (
        <Countdown
          startTime={startTime}
          endTime={endTime}
          concluded={auction?.resulted}
          units={['days', 'hours', 'minutes']}
        />
      )}
      {auctionHighestBidder && auction && (
        <HighestBidder bidder={auctionHighestBidder} paymentToken={auction.payToken} chainId={chainId} winner />
      )}
      {auction && renderButton(auction)}
    </Stack>
  )
}
