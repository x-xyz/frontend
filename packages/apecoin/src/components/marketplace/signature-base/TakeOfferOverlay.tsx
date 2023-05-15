import useToast from 'hooks/useToast'
import { useMemo, useState } from 'react'
import Image from 'components/Image'

import { Button } from '@chakra-ui/button'
import { Stack } from '@chakra-ui/layout'
import { keccak256 } from '@ethersproject/solidity'
import { fetchOrder } from '@x/apis/fn'
import { addresses } from '@x/constants'
import { useActiveWeb3React, useExchangeContract } from '@x/hooks'
import { Divider, HStack, Text } from '@chakra-ui/react'
import { Collection, ListingStrategy, NftItem, OrderItem } from '@x/models/dist'
import Overlay from './Overlay'
import { builtInCollections } from '../../../configs'
import { useErc721ApprovalForAll, useErc721Contract } from '@x/hooks/dist'
import { handleError } from '@x/web3/dist'
import { findToken } from '@x/constants/dist'
import { compareAddress } from '@x/utils/dist'

const contractToName: Record<string, string> = {}
builtInCollections.forEach(c => (contractToName[c.address] = c.name))

export interface TakeOfferProps {
  collection: Collection
  nftItem: NftItem
  offer: OrderItem
  onOfferTook?: (offer: OrderItem) => void
  isErc1155?: boolean
}

export interface TakeOfferOverlayProps {
  takeOfferProps: TakeOfferProps
  isOpen: boolean
  onClose: () => void
}

export default function TakeOfferOverlay({ isOpen, onClose, takeOfferProps }: TakeOfferOverlayProps) {
  return (
    <Overlay title="Accept Bid" isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <PlaceOfferContent takeOfferProps={takeOfferProps} onClose={onClose} />
    </Overlay>
  )
}

function PlaceOfferContent({
  takeOfferProps: { collection, offer, nftItem, onOfferTook, isErc1155 },
  onClose,
}: Omit<TakeOfferOverlayProps, 'isOpen'>) {
  const toast = useToast({ title: 'Accept Bids' })

  const [isLoading, setLoading] = useState(false)

  const { account, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(offer.collection, offer.chainId)

  const exchangeContract = useExchangeContract(offer.chainId)
  const transferManagerContractAddress = isErc1155
    ? addresses.transferManagerErc1155[offer.chainId]
    : addresses.transferManagerErc721[offer.chainId]

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    offer.chainId,
    offer.collection,
    account,
    transferManagerContractAddress,
  )

  const creatorRoyalties = collection?.royalty || 0
  const marketplaceFee = compareAddress(offer.currency, '0x4d224452801aced8b2f0aebe155379bb5d594381') ? 0.0025 : 0.005
  const fees = useMemo(
    () => (isNaN(offer.priceInNative) ? 0 : offer.priceInNative) * (marketplaceFee + creatorRoyalties * 0.01),
    [offer.priceInNative, marketplaceFee, creatorRoyalties],
  )
  const feesInUsd = useMemo(
    () => offer.priceInUsd * (marketplaceFee + creatorRoyalties * 0.01),
    [offer.priceInUsd, marketplaceFee, creatorRoyalties],
  )
  const earning = useMemo(
    () => (isNaN(offer.priceInNative) ? 0 : offer.priceInNative) * (1 - marketplaceFee - creatorRoyalties * 0.01),
    [offer.priceInNative, marketplaceFee, creatorRoyalties],
  )
  const earningInUsd = useMemo(
    () => offer.priceInUsd * (1 - marketplaceFee - creatorRoyalties * 0.01),
    [offer.priceInUsd, marketplaceFee, creatorRoyalties],
  )

  async function onClick() {
    setLoading(true)

    try {
      // if (!marketplaceContract) throw new Error('cannot get marketplace contract')
      if (!exchangeContract) throw new Error('cannot get exchange contract')
      if (!transferManagerContractAddress) throw new Error('cannot get transfer manager contract')

      if (!account) throw new Error('cannot get account')

      if (!isApproved) {
        if (!erc721Contract) throw new Error('cannot get erc721 contract')

        const approveTx = await callContract({
          contract: erc721Contract,
          method: 'setApprovalForAll',
          args: [transferManagerContractAddress, true],
        })

        await approveTx.wait()

        toast({ status: 'success', description: 'Approved' })
      }

      const signedOrder = await fetchOrder(offer.chainId, offer.orderHash)

      const takerOrder = {
        isAsk: true,
        taker: account,
        itemIdx: offer.itemIdx,
        item: offer,
        minPercentageToAsk: 0,
        marketplace: keccak256(['string'], ['apecoin']),
        params: [],
      }

      const tx = await callContract({
        contract: exchangeContract,
        method: 'matchBidWithTakerAsk',
        args: [signedOrder, takerOrder],
      })

      await tx.wait()

      toast({ status: 'success', description: 'Offer took' })

      if (onOfferTook) onOfferTook(offer)
      onClose()
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={6}>
      <HStack spacing={4} alignItems="center">
        <Image src={nftItem.animationUrl || nftItem.imageUrl} boxSize={15} />
        <Stack>
          <Text variant="captionSub">{contractToName[nftItem.contractAddress]}</Text>
          <Text variant="body1">{nftItem.name}</Text>
        </Stack>
      </HStack>
      <Divider borderColor="line" />
      <Stack>
        <HStack justifyContent="space-between">
          <Text variant="captionSub">Bid Price</Text>
          <HStack spacing="65px">
            <Text variant="captionSub">
              {offer.displayPrice} {findToken(offer.currency, offer.chainId)?.symbol}
            </Text>
            <Text variant="captionSub" color="textSecondary" minW="110px" textAlign="right">
              ${offer.priceInUsd.toLocaleString('en', { maximumFractionDigits: 2 })}
            </Text>
          </HStack>
        </HStack>
        <HStack justifyContent="space-between">
          <Text variant="captionSub">Fees</Text>
          <HStack spacing="65px">
            <Text variant="captionSub">
              {fees} {findToken(offer.currency, offer.chainId)?.symbol}
            </Text>
            <Text variant="captionSub" color="textSecondary" minW="110px" textAlign="right">
              ${feesInUsd.toLocaleString('en', { maximumFractionDigits: 2 })}
            </Text>
          </HStack>
        </HStack>
        <HStack justifyContent="space-between">
          <Text variant="captionSub">Total Earnings</Text>
          <HStack spacing="65px">
            <Text variant="captionSub">
              {earning} {findToken(offer.currency, offer.chainId)?.symbol}
            </Text>
            <Text variant="captionSub" color="textSecondary" minW="110px" textAlign="right">
              ${earningInUsd.toLocaleString('en', { maximumFractionDigits: 2 })}
            </Text>
          </HStack>
        </HStack>
      </Stack>
      <Button type="submit" w="100%" disabled={isLoading} isLoading={isLoading} onClick={() => onClick()}>
        Confirm
      </Button>
    </Stack>
  )
}
