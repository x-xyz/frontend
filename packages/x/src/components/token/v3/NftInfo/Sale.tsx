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
import { AddressZero } from '@ethersproject/constants'
import { findToken } from '@x/constants/dist'
import { useActiveWeb3React } from '@x/hooks/dist'
import { orderItemExpired, TokenType } from '@x/models/dist'
import { compareAddress, ensureNumber } from '@x/utils/dist'
import LowerPriceButton from 'components/marketplace/v3/LowerPriceButton'
import { maxBy } from 'lodash'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import BuyButton from '../../../marketplace/v3/BuyButton'
import CancelListingButton from '../../../marketplace/v3/CancelListingButton'
import CancelOfferButton from '../../../marketplace/v3/CancelOfferButton'
import PlaceOfferButton from '../../../marketplace/v3/PlaceOfferButton'
import SellButton from '../../../marketplace/v3/SellButton'
import TakeOfferButton from '../../../marketplace/v3/TakeOfferButton'
import UsdPrice from '../../../UsdPrice'
import { useNftInfo } from '../../NftInfoProvider'
import TransferButton from '../TransferButton'

const breakpoint = 'lg'

interface Payment {
  currency?: string
  payToken?: string
  paymentToken?: string
}

function Sale() {
  const { locale } = useRouter()

  const { account } = useActiveWeb3React()
  const { chainId, contractAddress, tokenId, bestListing, isMine, myOffer, offers, setOffers, detail } = useNftInfo()

  function renderPrice(price: number | string, unit: string) {
    return `${price.toLocaleString(locale, { minimumFractionDigits: 3 })} ${unit}`
  }

  function paymentUnit(payment?: Payment) {
    if (!payment) return ''
    return (
      findToken(payment.currency || payment.payToken || payment.paymentToken || '', chainId)?.symbol.toUpperCase() || ''
    )
  }

  const bestOffer = useMemo(() => {
    if (offers.length === 0) return
    return maxBy(offers, o => o.priceInUsd)
  }, [offers])

  const isPurchasable = useMemo(() => {
    if (!bestListing) return false
    if (!bestListing.reservedBuyer) return true

    return compareAddress(bestListing.reservedBuyer, account)
  }, [account, bestListing])

  function renderBuyerActions() {
    return (
      <HStack spacing={6}>
        {bestListing && isPurchasable && (
          <BuyButton
            chainId={chainId}
            seller={bestListing.signer}
            price={bestListing.displayPrice}
            paymentToken={bestListing.currency}
            orderItem={bestListing}
            expired={orderItemExpired(bestListing)}
          />
        )}
        {!myOffer && (
          <PlaceOfferButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            tokenType={detail?.tokenType}
          />
        )}
      </HStack>
    )
  }

  return (
    <Box border="1px solid" borderColor="divider">
      <Flex p={5} flexWrap="wrap" mt={-5}>
        <HStack spacing={16} alignItems="stretch" mt={5} mr={5}>
          <Stack spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="note" whiteSpace="nowrap">
              Fixed Price
            </Text>
            <Text fontSize="4xl" fontWeight="bold">
              {bestListing && (isPurchasable || isMine)
                ? renderPrice(bestListing.displayPrice, paymentUnit(bestListing))
                : '-'}
            </Text>
            {bestListing && isPurchasable && (
              <Text fontSize="sm" color="value">
                <UsdPrice chainId={chainId} tokenId={bestListing.currency} suffix="USD">
                  {ensureNumber(bestListing.displayPrice)}
                </UsdPrice>
              </Text>
            )}
          </Stack>
          <Stack spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="note" whiteSpace="nowrap">
              Top Offer
            </Text>
            <Text fontSize="4xl" fontWeight="bold">
              {bestOffer ? renderPrice(bestOffer.displayPrice, paymentUnit(bestOffer)) : '-'}
            </Text>
            {bestOffer && (
              <Text fontSize="sm" color="value">
                <UsdPrice chainId={chainId} tokenId={bestOffer.currency} suffix="USD">
                  {ensureNumber(bestOffer.displayPrice)}
                </UsdPrice>
              </Text>
            )}
          </Stack>
        </HStack>
        <Box flex="1 1 auto" />
        <Flex alignItems="center" mt={5}>
          {isMine ? <SellerActions /> : renderBuyerActions()}
        </Flex>
      </Flex>
      {bestOffer && (
        <Box p={5} borderTop="1px solid" borderColor="divider" backgroundColor="#262b2c">
          <HStack spacing={16} alignItems="stretch">
            <Stack h="100%" spacing={0}>
              <Text fontSize="xs" fontWeight="bold" color="note" whiteSpace="nowrap">
                Top Offer
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {renderPrice(bestOffer.displayPrice, paymentUnit(bestOffer))}
              </Text>
              <Text fontSize="sm" color="value">
                <UsdPrice chainId={chainId} tokenId={bestOffer.currency} suffix="USD">
                  {ensureNumber(bestOffer.displayPrice)}
                </UsdPrice>
              </Text>
            </Stack>
            <Stack h="100%" spacing={0}>
              <Text fontSize="xs" fontWeight="bold" color="note" whiteSpace="nowrap">
                Expiration
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {DateTime.fromISO(bestOffer.endTime).toRelative()}
              </Text>
            </Stack>
            <Flex flexGrow={1} justifyContent="flex-end">
              {!!myOffer && (
                // <CancelOfferButton
                //   variant="outline"
                //   chainId={chainId}
                //   contractAddress={contractAddress}
                //   tokenID={tokenId}
                //   onOfferCanceled={() =>
                //     setOffers(prev => prev.filter(offer => !compareAddress(offer.signer, account)))
                //   }
                // />
                <CancelListingButton
                  variant="outline"
                  chainId={myOffer.chainId}
                  orderItem={myOffer}
                  onListingCanceled={() =>
                    setOffers(prev => prev.filter(offer => !compareAddress(offer.signer, account)))
                  }
                >
                  Cancel Offer
                </CancelListingButton>
              )}
              {isMine && (
                <TakeOfferButton
                  chainId={chainId}
                  contractAddress={contractAddress}
                  tokenId={tokenId}
                  offer={bestOffer}
                  isErc1155={detail?.tokenType === TokenType.Erc1155}
                />
              )}
            </Flex>
          </HStack>
        </Box>
      )}
    </Box>
  )
}

function SellerActions() {
  const { chainId, contractAddress, tokenId, myListing, setOwner, refresh, detail } = useNftInfo()

  const [currentAction, setCurrentAction] = useState(0)

  let actions: { text: string; button: React.ReactNode }[]

  if (!myListing) {
    actions = [
      {
        text: 'Sell',
        button: (
          <SellButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            tokenType={detail?.tokenType}
          />
        ),
      },
      // {
      //   text: 'Start Auction',
      //   button: <AuctionButton chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} />,
      // },
      {
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
      },
    ]
  } else {
    actions = [
      {
        text: 'Lower Price',
        button: detail && <LowerPriceButton token={detail} />,
      },
      {
        text: 'Cancel Listing',
        button: <CancelListingButton chainId={chainId} orderItem={myListing} />,
      },
      {
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
      },
    ]
  }

  const { onOpen, onClose, isOpen } = useDisclosure()

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

export default Sale
