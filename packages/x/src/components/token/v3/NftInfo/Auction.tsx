import { Button, ButtonGroup } from '@chakra-ui/button'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Box, Flex, Stack, Text } from '@chakra-ui/layout'
import {
  HStack,
  IconButton,
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from '@chakra-ui/react'
import { Zero } from '@ethersproject/constants'
import { findToken } from '@x/constants/dist'
import { useActiveWeb3React, useAuctionContract, useMinBidIncreasement } from '@x/hooks/dist'
import { compareAddress } from '@x/utils/dist'
import { formatUnits } from 'ethers/lib/utils'
import { useRouter } from 'next/router'
import { useState } from 'react'
import AuctionButton from '../../../auction/AuctionButton'
import CancelAuctionButton from '../../../auction/v3/CancelAuctionButton'
import ConcludeAuctionButton from '../../../auction/v3/ConcludeAuctionButton'
import PlaceBidButton from '../../../auction/v3/PlaceBidButton'
import WithdrawBidButton from '../../../auction/v3/WithdrawBidButton'

import UsdPrice from '../../../UsdPrice'
import { useNftInfo } from '../../NftInfoProvider'
import TransferButton from '../TransferButton'
import Countdown from './Countdown'

const breakpoint = 'lg'

function Auction() {
  const { locale } = useRouter()
  const { account } = useActiveWeb3React()

  const {
    chainId,
    contractAddress,
    tokenId,
    isMine,
    runningAuction: { auction, auctionHighestBidder, auctionHasStarted, auctionHasEnded },
  } = useNftInfo()

  function renderPrice(price: number, unit: string) {
    return `${price.toLocaleString(locale, { minimumFractionDigits: 3 })} ${unit}`
  }

  const auctionContract = useAuctionContract(chainId)
  const [minBidIncrement] = useMinBidIncreasement(auctionContract)

  const token = findToken(auction?.payToken || '', chainId)
  const topBid = auctionHighestBidder?.bid || Zero
  const minBid = topBid.add(minBidIncrement)

  if (!auction || !token) return null

  function renderBidderActions() {
    if (!auction) return null

    return (
      <HStack spacing={6}>
        {compareAddress(auctionHighestBidder?.bidder, account) ? (
          <WithdrawBidButton chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} auction={auction} />
        ) : (
          <PlaceBidButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            auction={auction}
            highestBidder={auctionHighestBidder}
            disabled={!auctionHasStarted || auctionHasEnded}
          />
        )}
      </HStack>
    )
  }

  return (
    <Box border="1px solid" borderColor="divider">
      <Stack p={5} backgroundColor="panel" border="1px solid" borderColor="divider">
        <Countdown auction={auction} />
      </Stack>
      <Flex p={5} mt={-5} flexWrap="wrap">
        <HStack spacing={16} alignItems="stretch" mt={5} mr={5}>
          <Stack spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="note" whiteSpace="nowrap">
              Minimum Bid
            </Text>
            <Text fontSize="4xl" fontWeight="bold">
              {renderPrice(parseFloat(formatUnits(minBid, token.decimals)), token.symbol.toUpperCase())}
            </Text>
            <Text fontSize="sm" color="value">
              <UsdPrice chainId={chainId} tokenId={auction.payToken} suffix="USD">
                {parseFloat(formatUnits(topBid, token.decimals))}
              </UsdPrice>
            </Text>
          </Stack>
          <Stack spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="note" whiteSpace="nowrap">
              Top Bid
            </Text>
            <Text fontSize="4xl" fontWeight="bold">
              {renderPrice(parseFloat(formatUnits(topBid, token.decimals)), token.symbol.toUpperCase())}
            </Text>
            <Text fontSize="sm" color="value">
              <UsdPrice chainId={chainId} tokenId={auction.payToken} suffix="USD">
                {parseFloat(formatUnits(topBid, token.decimals))}
              </UsdPrice>
            </Text>
          </Stack>
        </HStack>
        <Box flex="1 1 auto" />
        <Flex alignItems="center" mt={5}>
          {isMine ? <SellerActions /> : renderBidderActions()}
        </Flex>
      </Flex>
    </Box>
  )
}

function SellerActions() {
  const {
    chainId,
    contractAddress,
    tokenId,
    setOwner,
    refresh,
    runningAuction: { auction, auctionHasEnded, refreshAuction },
    detail,
  } = useNftInfo()

  const [currentAction, setCurrentAction] = useState(0)

  const { onOpen, onClose, isOpen } = useDisclosure()

  const actions: { text: string; button: React.ReactNode }[] = []

  if (!auction) return null

  if (!auction.resulted) {
    if (auctionHasEnded) {
      actions.push({
        text: 'Conclude Auction',
        button: (
          <ConcludeAuctionButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            onConcluded={refreshAuction}
          />
        ),
      })
    }
    actions.push({
      text: 'Update Auction',
      button: <AuctionButton chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} auction={auction} />,
    })
    actions.push({
      text: 'Cancel Auction',
      button: <CancelAuctionButton chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} />,
    })
  }

  actions.push({
    text: 'Transfer',
    button: (
      <TransferButton
        chainId={chainId}
        contractAddress={contractAddress}
        tokenId={tokenId}
        tokenSpec={detail?.tokenType}
        onTransferred={address => {
          setOwner(address)
          refresh()
        }}
      />
    ),
  })

  return (
    <HStack spacing={6}>
      <ButtonGroup isAttached>
        {actions[currentAction].button}
        <Popover
          onOpen={onOpen}
          onClose={onClose}
          isOpen={isOpen}
          isLazy
          returnFocusOnClose
          closeOnBlur
          closeOnEsc
          placement="bottom-end"
        >
          <PopoverTrigger>
            <IconButton ml="-2px" minW={10} aria-label="dropdown" icon={<ChevronDownIcon />} />
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverBody>
                <List>
                  {actions.map((action, idx) => (
                    <ListItem key={idx}>
                      <Button
                        variant="unstyled"
                        w="full"
                        px={3}
                        onClick={() => {
                          setCurrentAction(idx)
                          onClose()
                        }}
                      >
                        {action.text}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      </ButtonGroup>
    </HStack>
  )
}

export default Auction
