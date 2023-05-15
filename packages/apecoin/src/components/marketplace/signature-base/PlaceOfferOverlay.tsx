import DatePicker from 'components/DatePicker'
import SelectToken from 'components/input/SelectToken'
import TokenBalance from 'components/wallet/TokenBalance'
import useAuthToken from 'hooks/useAuthToken'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'components/Image'

import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Stack } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal'
import { chakra } from '@chakra-ui/system'
import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumberish } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/solidity'
import { parseUnits } from '@ethersproject/units'
import { fetchAccountOrderNonce, makeOrder } from '@x/apis/fn'
import { addresses, ChainId, findToken } from '@x/constants'
import { useActiveWeb3React, useErc20Contract } from '@x/hooks'
import { Order, signMakerOrder, TokenType, FeeDistType } from '@x/models'
import { getFirst } from '@x/utils'
import { ensureEnoughErc20Allowance } from '@x/web3'
import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { Collection, NftItem } from '@x/models/dist'
import CloseIcon from '../../icons/CloseIcon'
import Overlay from './Overlay'

export interface PlaceOfferProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  tokenType?: TokenType
  nftItem: NftItem
  collection: Collection
}

interface FormData {
  paymentToken: string
  price: string
  quantity?: number
  endTime: Date
}

export interface PlaceOfferOverlayProps {
  placeOfferProps: PlaceOfferProps
  isOpen: boolean
  onClose: () => void
}

export default function PlaceOfferOverlay({ isOpen, onClose, placeOfferProps }: PlaceOfferOverlayProps) {
  return (
    <Overlay title="Make an Offer" isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <PlaceOfferContent placeOfferProps={placeOfferProps} onClose={onClose} />
    </Overlay>
  )
}

function PlaceOfferContent({
  placeOfferProps: { chainId, contractAddress, tokenID, tokenType, nftItem, collection },
  onClose,
}: Omit<PlaceOfferOverlayProps, 'isOpen'>) {
  const toast = useToast({ title: 'Place offer' })

  const [authToken] = useAuthToken()

  const {
    register,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
    handleSubmit,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { endTime: DateTime.now().plus({ days: 1 }).toJSDate() },
  })

  const { account, library } = useActiveWeb3React()

  const paymentToken = watch('paymentToken')

  const token = useMemo(() => (paymentToken ? findToken(paymentToken, chainId) : undefined), [paymentToken, chainId])

  const erc20Contract = useErc20Contract(token?.isNative ? undefined : token?.address, chainId)

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  const onSubmit = handleSubmit(async ({ paymentToken, price, quantity = 1, endTime }) => {
    try {
      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!erc20Contract) throw new Error('cannot get erc20 contract')

      if (!library) throw new Error('cannot get library')

      const approveTxHash = await ensureEnoughErc20Allowance(
        erc20Contract,
        account,
        addresses.exchange[chainId],
        price,
        token,
      )

      if (approveTxHash) {
        toast({ status: 'success', description: `Approved. ${approveTxHash}` })
      }

      const priceInEther = parseUnits(price, token.decimals)

      const { nonce } = await fetchAccountOrderNonce(account, chainId, authToken)

      const order: Order = {
        chainId,
        isAsk: false,
        signer: account,
        items: [
          {
            collection: contractAddress,
            tokenId: tokenID.toString(),
            amount: quantity.toString(),
            price: priceInEther.toString(),
          },
        ],
        strategy: addresses.strategyFixedPrice[chainId],
        currency: paymentToken,
        nonce,
        startTime: DateTime.now().startOf('second').toSeconds().toString(),
        endTime: DateTime.fromJSDate(endTime).startOf('second').toSeconds().toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256(['string'], ['apecoin']),
        params: defaultAbiCoder.encode([], []),
        feeDistType: FeeDistType.Burn,
      }

      const signedOrder = await signMakerOrder(library.getSigner(), chainId, addresses.exchange[chainId], order)

      await makeOrder(signedOrder)

      toast({ status: 'success', description: `Offer placed` })
    } catch (error: unknown) {
      if (error instanceof Error) toast({ status: 'error', description: error.message })

      throw error
    }
  })

  return (
    <chakra.form onSubmit={onSubmit}>
      <Stack spacing={6}>
        <HStack spacing={4} alignItems="center">
          <Image src={nftItem.animationUrl || nftItem.imageUrl} boxSize={15} />
          <Stack>
            <Text variant="captionSub">{collection.collectionName}</Text>
            <Text variant="body1">{nftItem.name}</Text>
          </Stack>
        </HStack>
        <Divider borderColor="line" />
        <Stack spacing={4}>
          <HStack justifyContent="space-between">
            <Text variant="captionSub">Wallet Balance</Text>
            <TokenBalance chainId={chainId} tokenId={watch('paymentToken')} variant="captionSub" />
          </HStack>
          <HStack justifyContent="space-between">
            <Text variant="captionSub">Floor Price</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text variant="captionSub">Best Offer</Text>
          </HStack>
        </Stack>
        <FormControl isInvalid={!!errors.price}>
          <InputGroup>
            <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} placeholder="Price" />
            <InputRightAddon
              border="1px solid"
              borderColor="line"
              borderRadius={0}
              minW="8.125rem"
              justifyContent="flex-end"
            >
              <SelectToken
                chainId={chainId}
                buttonProps={{ borderWidth: 0 }}
                textProps={{ variant: 'body2' }}
                value={watch('paymentToken')}
                onChange={value => setValue('paymentToken', value, { shouldValidate: true })}
                withNativeToken={true}
              />
            </InputRightAddon>
          </InputGroup>
        </FormControl>
        {tokenType === TokenType.Erc1155 && (
          <FormControl isRequired isInvalid={!!errors.quantity}>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              {...register('quantity', {
                required: true,
                pattern: /\d+/,
                valueAsNumber: true,
                min: 1,
              })}
              placeholder="1"
              min={1}
              step={1}
            />
          </FormControl>
        )}
        <FormControl>
          <FormLabel>
            <Text variant="caption">Offer Expiration Date</Text>
          </FormLabel>
          <DatePicker
            selected={watch('endTime')}
            onChange={date => {
              const endTime = getFirst(date)
              if (endTime) setValue('endTime', endTime)
            }}
            showTimeInput
            showTimeSelect
            dateFormat="MM/dd/yyyy h:mm aa"
            width="100%"
            height="40px"
            popperProps={{
              strategy: 'fixed',
            }}
          />
        </FormControl>
        <Button type="submit" w="100%" disabled={!isDirty || !isValid} isLoading={isSubmitting}>
          Confirm Offer
        </Button>
      </Stack>
    </chakra.form>
  )
}

function PlaceOfferModal({ isOpen, onClose, placeOfferProps }: PlaceOfferOverlayProps) {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justifyContent="space-between">
            <Text>Make an Offer</Text>
            <IconButton aria-label="close modal" icon={<CloseIcon />} variant="unstyled" onClick={() => onClose()} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <PlaceOfferContent placeOfferProps={placeOfferProps} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function PlaceOfferDrawer({ isOpen, onClose, placeOfferProps }: PlaceOfferOverlayProps) {
  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <HStack justifyContent="center" position="relative">
            <Text>Make an Offer</Text>
            <IconButton
              aria-label="close modal"
              position="absolute"
              right={0}
              icon={<CloseIcon />}
              variant="unstyled"
              onClick={() => onClose()}
            />
          </HStack>
        </DrawerHeader>
        <DrawerBody>
          <PlaceOfferContent placeOfferProps={placeOfferProps} onClose={onClose} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
