import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/modal'
import { chakra } from '@chakra-ui/system'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { findToken } from '@x/constants'
import { useAuctionContract, useErc20Contract } from '@x/hooks'
import { Auction, Bidder } from '@x/models'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ensureEnoughErc20Allowance, ensureEnoughNativeToken } from '@x/web3'
import useToast from 'hooks/useToast'
import SelectToken from 'components/input/SelectToken'
import { useActiveWeb3React } from '@x/hooks'
import { useMinBidIncreasement } from '@x/hooks'
import { Zero } from '@ethersproject/constants'
import { ContractTransaction } from '@ethersproject/contracts'
import { handleError } from '@x/web3'
import { ChainId } from '@x/constants'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import { BigNumberish } from '@ethersproject/bignumber'

export interface PlaceBidModalProps extends Omit<ModalProps, 'children'> {
  auction: Auction
  highestBidder?: Bidder
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
}

interface FormData {
  price: string
}

export default function PlaceBidModal({
  auction,
  highestBidder,
  chainId,
  contractAddress,
  tokenID,
  onClose,
  ...props
}: PlaceBidModalProps) {
  const toast = useToast({ title: 'Place bid' })

  const {
    register,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
    handleSubmit,
  } = useForm<FormData>({ mode: 'onChange' })

  const { account, library, callContract } = useActiveWeb3React()

  const erc20Contract = useErc20Contract(auction.payToken, chainId)

  const auctionContract = useAuctionContract(chainId)

  const token = findToken(auction.payToken, chainId)

  const [minBidIncreasement, isLoadingMinBidIncreasement] = useMinBidIncreasement(auctionContract)

  const heighestBid = highestBidder?.bid || Zero

  const minBid = parseFloat(formatUnits(heighestBid.add(minBidIncreasement), token?.decimals))

  const onSubmit = handleSubmit(async ({ price }) => {
    try {
      if (!token) throw new Error(`unknown token: ${auction.payToken}`)

      if (!account) throw new Error('cannot get account')

      if (!library) throw new Error('cannot get library')

      if (!auctionContract) throw new Error('cannot get auction contract')

      if (token.isNative) {
        await ensureEnoughNativeToken(library, account, price, token)
      } else {
        if (!erc20Contract) throw new Error('cannot get erc20 contract')

        const approveTxHash = await ensureEnoughErc20Allowance(
          erc20Contract,
          account,
          auctionContract.address,
          price,
          token,
        )

        if (approveTxHash) toast({ status: 'success', description: `Approve. ${approveTxHash}` })
      }

      const priceInEther = parseUnits(price, token.decimals)

      let tx: ContractTransaction

      if (token.isNative) {
        tx = await callContract({
          contract: auctionContract,
          method: 'placeBid(address,uint256)',
          args: [contractAddress, tokenID],
          value: priceInEther,
        })
      } else {
        tx = await callContract({
          contract: auctionContract,
          method: 'placeBid(address,uint256,uint256)',
          args: [contractAddress, tokenID, priceInEther],
        })
      }

      await tx.wait()

      toast({ status: 'success', description: `Bid placed. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Place Bid
          <ModalCloseButton />
        </ModalHeader>
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <FormControl isInvalid={!!errors.price}>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <InputLeftAddon>
                    <SelectToken chainId={chainId} buttonProps={{ borderWidth: 0 }} value={auction.payToken} disabled />
                  </InputLeftAddon>
                  <Input
                    type="number"
                    {...register('price', {
                      required: true,
                      min: { value: minBid, message: 'Price too low' },
                    })}
                    placeholder={minBid.toString()}
                    min={minBid}
                    step={10 ** -(token?.decimals || 18)}
                  />
                </InputGroup>
                <FormHelperText>Min bid: {minBid.toString()}</FormHelperText>
                <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                variant="outline"
                w="100%"
                disabled={isLoadingMinBidIncreasement || isSubmitting || !isDirty || !isValid}
                isLoading={isLoadingMinBidIncreasement || isSubmitting}
              >
                Place Bid
              </Button>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
