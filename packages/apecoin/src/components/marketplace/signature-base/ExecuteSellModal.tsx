import SimpleNftCard from 'components/token/SimpleNftCard'
import { defaultAbiCoder } from 'ethers/lib/utils'
import useAuthToken from 'hooks/useAuthToken'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import {
  Box,
  Button,
  Center,
  ChakraProps,
  Divider,
  Image,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Spinner,
  Stack,
  Text,
  useCallbackRef,
} from '@chakra-ui/react'
import { keccak256 } from '@ethersproject/solidity'
import { parseUnits } from '@ethersproject/units'
import { fetchAccountOrderNonce, fetchTokenV2, makeOrder } from '@x/apis/fn'
import { findToken } from '@x/constants'
import { addresses } from '@x/constants/dist'
import { useActiveWeb3React, useErc721ApprovalForAll, useErc721Contract } from '@x/hooks'
import { ChainId, FeeDistType } from '@x/models'
import { Order, signMakerOrder } from '@x/models/dist'
import { handleError } from '@x/web3'

import { FormData } from './SellModal.v2'

export interface ExecuteSellModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
  contract: string
  tokenId: string
  formData: FormData
  isErc1155?: boolean
}

export default function ExecuteSellModal({
  chainId,
  contract,
  tokenId,
  formData,
  onClose,
  isErc1155,
  ...props
}: ExecuteSellModalProps) {
  const toast = useToast({ title: 'Complete your Listing' })

  const { account, callContract, library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const { data: token } = useQuery(['token', chainId, contract, tokenId], fetchTokenV2)

  const erc721 = useErc721Contract(contract, chainId)

  const transferManagerContractAddress = isErc1155
    ? addresses.transferManagerErc1155[chainId]
    : addresses.transferManagerErc721[chainId]

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contract,
    account,
    transferManagerContractAddress,
  )

  const paymentToken = useMemo(() => findToken(formData.paymentToken, chainId), [formData.paymentToken, chainId])

  const tokenWithNewPrice = useMemo(() => {
    if (!token) return
    return { ...token, price: parseFloat(formData.price), paymentToken: formData.paymentToken }
  }, [token, formData])

  const [isSigningTransaction, setSigningTransaction] = useState(false)

  const [isCompleteTransaction, setCompleteTransaction] = useState(false)

  /**
   * chainId, contract, tokenId and formData should not change after modal rendered
   */
  const signTransaction = useCallbackRef(async () => {
    const { price, deadline, quantity = 1, isPrivateSale, reservedAddress } = formData

    setSigningTransaction(true)
    try {
      if (!paymentToken) throw new Error(`unknown token: ${formData.paymentToken}`)
      if (!account) throw new Error('cannot get account')
      if (!library) throw new Error('cannot get library')

      const priceInEther = parseUnits(price, paymentToken.decimals)
      const deadlineInSeconds = Math.floor(DateTime.fromJSDate(deadline).toSeconds())
      const startingTime = Math.floor(DateTime.now().toSeconds())

      const nonceData = await fetchAccountOrderNonce(account, chainId, authToken)

      const params = isPrivateSale
        ? defaultAbiCoder.encode(['address'], [reservedAddress])
        : defaultAbiCoder.encode([], [])

      const strategy = isPrivateSale ? addresses.strategyPrivateSale[chainId] : addresses.strategyFixedPrice[chainId]

      const order: Order = {
        chainId: chainId,
        isAsk: true,
        signer: account,
        items: [
          {
            collection: contract,
            tokenId: tokenId,
            amount: quantity.toString(),
            price: priceInEther.toString(),
          },
        ],
        strategy: strategy,
        currency: paymentToken.address,
        nonce: nonceData.nonce,
        startTime: startingTime.toString(),
        endTime: deadlineInSeconds.toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256(['string'], ['apecoin']),
        params: params,
        feeDistType: FeeDistType.Burn,
      }

      const signedOrder = await signMakerOrder(library.getSigner(), chainId, addresses.exchange[chainId], order)
      //////// toast({ status: 'success', description: `Listed. ${tx.hash}` })

      await makeOrder(signedOrder)

      setCompleteTransaction(true)

      /**
       * keep signing transaction if occurring error
       * to prevent re-run sign transaction again
       */
      setSigningTransaction(false)
    } catch (error) {
      handleError(error, { toast })
    }
  }, [])

  useEffect(() => {
    if (isLoadingApproved) return
    /**
     * isApproved may still not be loaded,
     * have to ensure it is explicit false before requesting approval
     */
    if (isApproved !== false) return
    if (!erc721) return
    if (!transferManagerContractAddress) return

    let stale = false

    callContract({
      contract: erc721,
      method: 'setApprovalForAll',
      args: [transferManagerContractAddress, true],
    })
      .then(tx => tx.wait())
      .catch(error => {
        if (stale) return
        handleError(error, { toast })
      })

    return () => {
      stale = true
    }
  }, [isApproved, isLoadingApproved, callContract, erc721, transferManagerContractAddress, toast])

  useEffect(() => {
    /**
     * isApproved may still not be loaded,
     * have to ensure it is explicit true before signing transaction
     */
    if (isApproved !== true) return
    if (isSigningTransaction) return
    if (isCompleteTransaction) return

    signTransaction()
  }, [isApproved, signTransaction, isSigningTransaction, isCompleteTransaction])

  // close modal once transaction completed
  useEffect(() => {
    if (isCompleteTransaction) onClose()
  }, [isCompleteTransaction, onClose])

  const ApprovalStatusIcon = isApproved ? SuccessIcon : isLoadingApproved ? Spinner : makeStepIcon(1)

  const TransactionStatusIcon = isCompleteTransaction ? SuccessIcon : isSigningTransaction ? Spinner : makeStepIcon(2)

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <SuccessIcon position="absolute" right={4} zIndex="modal" />
        <ModalHeader>Complete your listing</ModalHeader>
        <ModalBody px={0}>
          <SimpleNftCard item={tokenWithNewPrice} mt={5} w="full" />
          <Stack p={10} spacing={5}>
            <Text color="note">
              To list your NFT for sale, you will need to approve this item for sale. This will require a one-time gas
              fee per collection.
            </Text>
            <Divider />
            <List fontWeight="bold" variant="unstyled">
              <ListItem display="flex" alignItems="center">
                <ListIcon as={ApprovalStatusIcon} w={7} h={7} marginInlineEnd={5} />
                Approve item for sale
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={TransactionStatusIcon} w={7} h={7} marginInlineEnd={5} />
                Confirm {formData.price} {paymentToken?.symbol} listing
              </ListItem>
            </List>
          </Stack>
        </ModalBody>
        <ModalFooter pt={5}>
          <Button variant="outline" color="primary" w="100%" onClick={() => onClose()}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function SuccessIcon(props: ChakraProps) {
  return <Image w={7} h={7} src="/assets/icons/ico-success-56x56.svg" {...props} />
}

function makeStepIcon(step: number) {
  return function StepIcon(props: ChakraProps) {
    return (
      <Box {...props}>
        <Center
          w={7}
          h={7}
          borderRadius="28px"
          borderColor="note"
          color="note"
          borderWidth={4}
          fontFamily="heading"
          fontSize="sm"
        >
          {step}
        </Center>
      </Box>
    )
  }
}
