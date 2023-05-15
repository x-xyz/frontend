import Link from 'components/Link'
import Media from 'components/Media'

import {
  AspectRatio,
  Button,
  Center,
  Flex,
  FlexProps,
  Grid,
  GridItem,
  Image,
  Stack,
  Stat,
  StatHelpText,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import { findToken, getChainNameForUrl } from '@x/constants/dist'
import { NftItem, PriceSource } from '@x/models'
import { useEffect, useState } from 'react'
import { TokenType } from '@x/models/dist'
import { compareAddress } from '@x/utils/dist'
import { TwelvefoldAddressPlaceholder } from '../../configs'
import { find } from 'lodash'

const breakpoint = 'md'

const tokenSymbolToImageUrl: Record<string, string> = {
  ETH: '/assets/ico-ethereum-60x60.svg',
  WETH: '/assets/ico-ethereum-60x60.svg',
  APE: '/assets/ico-apecoin.png',
  USDC: '/assets/tokens/usdc.png',
  USDT: '/assets/tokens/usdt.png',
}

export interface NftListProps extends FlexProps {
  items?: NftItem[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  cardWidth?: number
  cardHeight?: number
  hideActionButton?: boolean
  itemActionLabel?: string | ((item: NftItem) => string)
  selectedItems?: NftItem[]
  onSelectItem?: (item: NftItem) => void
  hidePrice?: boolean
  hideActionButtonIfListed?: boolean
}

export default function NftList({
  items = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  cardHeight,
  cardWidth,
  hideActionButton,
  itemActionLabel,
  selectedItems,
  onSelectItem,
  hidePrice,
  hideActionButtonIfListed,
  ...props
}: NftListProps) {
  return (
    <Grid
      templateColumns={{ base: 'repeat(2, 1fr)', md: `repeat(auto-fit, ${cardWidth}px)` }}
      columnGap={{ base: 2, md: 4 }}
      rowGap={{ base: 2, md: 4 }}
      {...props}
    >
      {items.map(item => (
        <GridItem key={item.tokenId}>
          <NftCard
            item={item}
            cardHeight={cardHeight}
            cardWidth={cardWidth}
            hideActionButton={hideActionButton}
            actionLabel={itemActionLabel}
            isSelected={selectedItems?.includes(item)}
            onSelect={onSelectItem}
            hidePrice={hidePrice}
            hideActionButtonIfListed={hideActionButtonIfListed}
          />
        </GridItem>
      ))}
      <GridItem gridColumn="1/-1">
        <Center w="full" pt={5} pb={15}>
          {hasMore && onLoadMore && (
            <Button variant="outline" isLoading={isLoading} disabled={isLoading} onClick={() => onLoadMore()}>
              LOAD MORE
            </Button>
          )}
        </Center>
      </GridItem>
    </Grid>
  )
}

const priceSourceToActionLabel: Record<PriceSource, string> = {
  [PriceSource.AuctionBid]: 'Bid',
  [PriceSource.AuctionReserve]: 'Bid',
  [PriceSource.Listing]: 'Buy Now',
  [PriceSource.Offer]: 'Offer',
}

interface NftCardProps {
  item?: NftItem
  cardWidth?: number
  cardHeight?: number
  hideActionButton?: boolean
  actionLabel?: string | ((item: NftItem) => string)
  isSelected?: boolean
  onSelect?: (item: NftItem) => void
  hidePrice?: boolean
  hideActionButtonIfListed?: boolean
}

function NftCard({
  item,
  cardHeight,
  cardWidth,
  hideActionButton,
  actionLabel: overrideActionLabel,
  isSelected,
  onSelect,
  hidePrice,
  hideActionButtonIfListed,
}: NftCardProps) {
  const actionLabel = overrideActionLabel
    ? typeof overrideActionLabel === 'string'
      ? overrideActionLabel
      : item && overrideActionLabel(item)
    : priceSourceToActionLabel[item?.priceSource || PriceSource.Offer]

  const nftUrl =
    (item &&
      item.tokenType !== TokenType.Ordinals &&
      `/asset/${getChainNameForUrl(item.chainId)}/${item.contractAddress}/${item.tokenId}`) ||
    undefined

  const ratio = cardHeight && cardWidth ? cardWidth / cardHeight : void 0

  const borderStyle = { base: '0px', [breakpoint]: '2px' }

  if (hideActionButtonIfListed) {
    hideActionButton = item?.priceSource === PriceSource.Listing
  }

  function renderHidePrice() {
    if (!item) return null

    if (item.priceSource === PriceSource.Listing) {
      return (
        <>
          Listed Price: {item.price.toLocaleString()} {findToken(item.paymentToken, item.chainId)?.symbol}
        </>
      )
    }

    if (item.lastSalePrice) {
      return (
        <>
          Last Sale: {item.lastSalePrice.toLocaleString()}{' '}
          {findToken(item.lastSalePricePaymentToken, item.chainId)?.symbol}
        </>
      )
    }

    return 'Last Sale: -'
  }

  function render() {
    return (
      <Stack w="full" h="full" bg="#1e1e1e" spacing={{ base: '16px', [breakpoint]: '24px' }} borderRadius="16px">
        <Link
          w="full"
          h="full"
          href={nftUrl}
          onClick={e => {
            // user is clicking hover button
            if (onSelect && e.target === e.currentTarget) {
              e.preventDefault()
            } else {
              e.stopPropagation()
              return false
            }
          }}
          minW="unset"
          minH="unset"
          pos="relative"
          borderRadius="16px"
          borderColor="primary"
          borderWidth={isSelected ? borderStyle : '0px'}
          overflow="hidden"
          _hover={
            hideActionButton
              ? void 0
              : {
                  borderWidth: borderStyle,
                  _after: {
                    content: { [breakpoint]: `"${actionLabel}"` },
                    bg: 'primary',
                    w: 'full',
                    h: '40px',
                    pos: 'absolute',
                    bottom: 0,
                    left: 0,
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#000',
                    pt: '10px',
                  },
                  color: 'unset',
                }
          }
        >
          <AspectRatio ratio={1} w="full" borderRadius="16px" overflow="hidden">
            <Media
              contentType={item?.animationUrlContentType || item?.contentType}
              mimetype={item?.animationUrlMimeType}
              src={item?.hostedAnimationUrl || item?.hostedImageUrl || item?.imageUrl}
              isLoading={!item}
              w="full"
              h="full"
            />
          </AspectRatio>
          <Stack w="full" px={4} pt={6} spacing="2" textAlign="left" mt="6px">
            {!compareAddress(TwelvefoldAddressPlaceholder, item?.contractAddress) ? (
              <Text fontWeight="bold" variant="subtitle1">
                {item?.name}
              </Text>
            ) : (
              <Stack>
                <Text fontWeight="bold" variant="subtitle1">
                  Edition: {item?.name}
                </Text>
                <Text fontWeight="bold" variant="subtitle1">
                  Season: {find(item?.attributes, { trait_type: 'season' })?.value}
                </Text>
                <Text fontWeight="bold" variant="subtitle1">
                  Series: {find(item?.attributes, { trait_type: 'series' })?.value}
                </Text>
              </Stack>
            )}
            {!hidePrice && item?.paymentToken ? (
              <Stat lineHeight={{ base: 1.4, [breakpoint]: 1.6 }}>
                <StatNumber fontSize={{ base: '16px', [breakpoint]: '20px' }} display="flex" alignItems="center">
                  <Image
                    display={{ base: 'none', [breakpoint]: 'block' }}
                    src={item && tokenSymbolToImageUrl[findToken(item.paymentToken, item.chainId)?.symbol || '']}
                    w="24px"
                    h="24px"
                  />
                  {item?.price?.toLocaleString() || '-'}
                  <Text as="span" display={{ [breakpoint]: 'none' }} ml="0.5rem">
                    {item && findToken(item?.paymentToken, item?.chainId)?.symbol}
                  </Text>
                </StatNumber>
                <StatHelpText fontSize={{ base: '12px', [breakpoint]: '14px' }} whiteSpace="nowrap">
                  ${item?.priceInUsd?.toLocaleString() || '-'}
                </StatHelpText>
              </Stat>
            ) : (
              item?.tokenType !== TokenType.Ordinals && (
                <Text color="#898989" variant="body2">
                  {renderHidePrice()}
                </Text>
              )
            )}
            {!hideActionButton && (
              <Button
                display={{ base: 'block', [breakpoint]: 'none' }}
                color="#000"
                fontSize="14px"
                h="32px"
                onClick={e => {
                  if (item && onSelect) {
                    e.stopPropagation()
                    e.preventDefault()
                    onSelect(item)
                  }
                }}
              >
                {actionLabel}
              </Button>
            )}
          </Stack>
        </Link>
      </Stack>
    )
  }

  function interact() {
    if (onSelect && !hideActionButton) {
      return (
        <Button variant="unstyled" onClick={() => item && onSelect(item)}>
          {render()}
        </Button>
      )
    }

    return render()
  }

  function calculateCardWidth() {
    return 360 - 100 * (((window ? window.innerWidth : 640) - 320) / (640 - 320))
  }

  return (
    <AspectRatio
      ratio={ratio || { base: 168 / (hideActionButton ? 270 : calculateCardWidth()), [breakpoint]: 258 / 393 }}
      w={cardWidth || { base: '100%', [breakpoint]: '258px' }}
      h={cardHeight}
    >
      {interact()}
    </AspectRatio>
  )
}
