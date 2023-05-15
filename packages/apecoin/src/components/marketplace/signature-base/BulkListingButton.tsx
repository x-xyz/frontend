import { Collection } from '@x/models/dist'
import DatePicker from 'components/DatePicker'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import SimpleNftCard from 'components/token/SimpleNftCard'
import { every } from 'lodash'
import { useMemo, useState } from 'react'

import {
  Button,
  ButtonProps,
  FormControl,
  FormLabel,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { NftItem, Order, signMakerOrder, FeeDistType } from '@x/models'
import { getFirst } from '@x/utils'
import ProfitEstimation from './ProfitEstimation'
import { addresses, findToken, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import useAuthToken from 'hooks/useAuthToken'
import useToast from 'hooks/useToast'
import { handleError } from '@x/web3'
import { fetchAccountOrderNonce, makeOrder } from '@x/apis/fn'
import { DateTime } from 'luxon'

import { defaultAbiCoder } from '@ethersproject/abi'
import { parseUnits } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/solidity'

export interface PendingListing {
  token: NftItem
  price: string
  paymentToken: string
  quantity?: string
}

export interface BulkListingButtonProps extends ButtonProps {
  collection: Collection
  pendingListings: PendingListing[]
}

export default function BulkListingButton({
  collection,
  pendingListings,
  children,
  disabled,
  ...props
}: BulkListingButtonProps) {
  const { onClose, onOpen, isOpen } = useDisclosure()

  const isPricesValid = useMemo(() => {
    return every(pendingListings, listing => {
      const price = Number(listing.price)
      return isFinite(price) && price > 0
    })
  }, [pendingListings])

  return (
    <>
      <Button onClick={onOpen} disabled={disabled || pendingListings.length === 0 || !isPricesValid} {...props}>
        {children}
      </Button>
      {pendingListings.length > 0 && (
        <BulkListingModal onClose={onClose} isOpen={isOpen} collection={collection} pendingListings={pendingListings} />
      )}
    </>
  )
}

const apeToken = findToken('APE')

interface BulkListingModalProps extends Omit<ModalProps, 'children'> {
  collection: Collection
  pendingListings: PendingListing[]
}

function BulkListingModal({ collection, pendingListings, onClose, ...props }: BulkListingModalProps) {
  const { chainId: currentChainId, account, library } = useActiveWeb3React()
  const [authToken] = useAuthToken()
  const toast = useToast({ title: 'NFT Listing' })
  const chainId = pendingListings[0].token.chainId
  const [endDate, setEndDate] = useState(DateTime.now().plus({ days: 7 }).toJSDate())
  const sellPrice = useMemo(
    () => pendingListings.reduce((acc, val) => acc + parseFloat(val.price), 0),
    [pendingListings],
  )
  const sellPaymentToken = useMemo(
    () =>
      findToken(pendingListings[0].paymentToken, pendingListings[0].token.chainId) ||
      getChain(pendingListings[0].token.chainId).nativeCurrency,
    [pendingListings],
  )
  const [isConfirmingListings, setConfirmingListings] = useState(false)

  async function confirmListings() {
    setConfirmingListings(true)
    try {
      if (!account) throw new Error('cannot get account')
      if (!library) throw new Error('cannot get library')
      const { nonce } = await fetchAccountOrderNonce(account, chainId, authToken)
      const order: Order = {
        chainId,
        isAsk: true,
        signer: account,
        items: pendingListings.map(listing => ({
          collection: listing.token.contractAddress,
          tokenId: listing.token.tokenId,
          amount: listing.quantity || '1',
          price: parseUnits(listing.price, sellPaymentToken.decimals).toString(),
        })),
        strategy: addresses.strategyFixedPrice[chainId],
        currency: sellPaymentToken.address,
        nonce,
        startTime: DateTime.now().startOf('second').toSeconds().toString(),
        endTime: DateTime.fromJSDate(endDate).startOf('second').toSeconds().toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256(['string'], ['apecoin']),
        params: defaultAbiCoder.encode([], []),
        feeDistType: FeeDistType.Burn,
      }
      const signedOrder = await signMakerOrder(library.getSigner(), chainId, addresses.exchange[chainId], order)
      await makeOrder(signedOrder)
      onClose()
    } catch (error) {
      handleError(error, { toast })
    } finally {
      setConfirmingListings(false)
    }
  }

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <Image position="absolute" right={4} zIndex="modal" w={7} h={7} src="/assets/icons/ico-auctionbid-56x56.svg" />
        <ModalHeader>NFT Listing{pendingListings.length > 1 && `(${pendingListings.length})`}</ModalHeader>
        <ModalBody>
          <EnsureConsistencyChain expectedChainId={chainId}>
            <Stack spacing={6}>
              <Stack border="1px solid" borderColor="divider" overflowX="hidden" overflowY="auto" maxH="320px" p={2.5}>
                {pendingListings.map(listing => (
                  <SimpleNftCard
                    key={`${listing.token.chainId}:${listing.token.contractAddress}:${listing.token.tokenId}`}
                    item={listing.token}
                    border="none"
                    borderBottom="1px solid"
                    borderBottomColor="divider"
                    price={parseFloat(listing.price)}
                    w="full"
                    paymentToken={listing.paymentToken}
                  />
                ))}
              </Stack>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(getFirst(date) || new Date())}
                  dateFormat="MM/dd/yyyy h:mm aa"
                  width="100%"
                  height="40px"
                  minDate={new Date()}
                  showTimeInput
                  showTimeSelect
                  autoFocus={false}
                />
              </FormControl>
              <ProfitEstimation
                sellPrice={sellPrice}
                sellPaymentToken={sellPaymentToken}
                royalty={collection.royalty / 100}
                marketplaceFee={sellPaymentToken === apeToken ? 0.0025 : 0.005}
              />
            </Stack>
          </EnsureConsistencyChain>
        </ModalBody>
        {!!account && currentChainId === chainId && (
          <ModalFooter>
            <Stack w="full" spacing={5}>
              <Button
                variant="outline"
                color="primary"
                w="100%"
                isLoading={isConfirmingListings}
                disabled={isConfirmingListings}
                onClick={confirmListings}
              >
                Confirm Listing
              </Button>
              <Button variant="outline" color="primary" w="100%" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}
