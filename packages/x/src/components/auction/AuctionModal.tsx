import { DateTime } from 'luxon'
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
import { BigNumberish } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import useToast from 'hooks/useToast'
import { useForm } from 'react-hook-form'
import { findToken } from '@x/constants'
import { chakra } from '@chakra-ui/system'
import { Stack } from '@chakra-ui/layout'
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input'
import SelectToken from 'components/input/SelectToken'
import DatePicker from 'components/DatePicker'
import { handleError } from '@x/web3'
import { getFirst } from '@x/utils'
import { Button } from '@chakra-ui/button'
import { useAuctionContract, useErc721Contract } from '@x/hooks'
import { useEffect } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Auction } from '@x/models'
import { compareBigNumberish, callOnChain } from '@x/utils'
import { useActiveWeb3React } from '@x/hooks'
import { ChainId } from '@x/constants'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import TokenBalance from 'components/wallet/TokenBalance'

export interface AuctionModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  auction?: Auction
}

interface FormData {
  paymentToken: string
  reservePrice: string
  startTime: Date
  endTime: Date
}

function createDefaultValue(auction?: Auction, chainId = ChainId.Fantom): Partial<FormData> {
  if (!auction)
    return {
      reservePrice: '0',
      startTime: DateTime.now().plus({ minutes: 2 }).toJSDate(),
      endTime: DateTime.now().plus({ days: 1 }).toJSDate(),
    }

  const { payToken, reservePrice, startTime, endTime } = auction

  return {
    paymentToken: payToken,
    reservePrice: formatUnits(reservePrice, findToken(payToken, chainId)?.decimals),
    startTime: new Date(startTime.toNumber() * 1000),
    endTime: new Date(endTime.toNumber() * 1000),
  }
}

export default function AuctionModal({
  chainId,
  contractAddress,
  tokenID,
  auction,
  onClose,
  isOpen,
  ...props
}: AuctionModalProps) {
  const toast = useToast({ title: 'Auction' })

  const { account, callContract } = useActiveWeb3React()

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: createDefaultValue(auction, chainId),
  })

  const erc721Contract = useErc721Contract(contractAddress, chainId)

  const auctionContract = useAuctionContract(chainId)

  const onSubmit = handleSubmit(async ({ paymentToken, reservePrice, startTime, endTime }) => {
    try {
      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error('cannot find token')

      if (!account) throw new Error('cannot get account')

      if (!erc721Contract) throw new Error('cannot get erc721 contract')

      if (!auctionContract) throw new Error('cannot get auction contract')

      const reservePriceInEther = parseUnits(reservePrice, token.decimals)

      const start = Math.floor(startTime.getTime() / 1000)

      const end = Math.floor(endTime.getTime() / 1000)

      if (!auction) {
        if (!(await callOnChain(() => erc721Contract.isApprovedForAll(account, auctionContract.address)))) {
          const tx = await callContract({
            contract: erc721Contract,
            method: 'setApprovalForAll',
            args: [auctionContract.address, true],
          })

          await tx.wait()

          toast({ status: 'success', description: 'Approval' })
        }

        const tx = await callContract({
          contract: auctionContract,
          method: 'createAuction',
          args: [contractAddress, tokenID, token.address, reservePriceInEther, start, end],
        })

        await tx.wait()
      } else {
        const txs: ContractTransaction[] = []

        if (!compareBigNumberish(auction.reservePrice, reservePriceInEther)) {
          txs.push(
            await callContract({
              contract: auctionContract,
              method: 'updateAuctionReservePrice',
              args: [contractAddress, tokenID, reservePriceInEther],
            }),
          )
        }

        if (!compareBigNumberish(auction.startTime, start)) {
          txs.push(
            await callContract({
              contract: auctionContract,
              method: 'updateAuctionStartTime',
              args: [contractAddress, tokenID, start],
            }),
          )
        }

        if (!compareBigNumberish(auction.endTime, end)) {
          txs.push(
            await callContract({
              contract: auctionContract,
              method: 'updateAuctionEndTime',
              args: [contractAddress, tokenID, end],
            }),
          )
        }

        await Promise.all(txs.map(tx => tx.wait()))
      }

      if (!auction) {
        toast({ status: 'success', description: 'Auction started' })
      } else {
        toast({ status: 'success', description: 'Auction updated' })
      }
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  useEffect(() => {
    if (auction || isOpen) reset(createDefaultValue(auction, chainId))
  }, [auction, chainId, reset, isOpen])

  const title = auction ? 'Update Auction' : 'Start Auction'

  const isStartTimePast = !!auction && DateTime.fromSeconds(auction.startTime.toNumber()).diffNow().valueOf() <= 0

  const startTimeRegister = register('startTime', {
    validate: value => {
      if (isStartTimePast) return
      if (DateTime.fromJSDate(value).diffNow().valueOf() <= 0) return 'Invalid start time'
    },
  })

  const endTimeRegister = register('endTime', {
    validate: value => {
      if (
        DateTime.fromJSDate(value)
          .diff(DateTime.fromJSDate(watch('startTime')))
          .valueOf() <= 0
      )
        return 'Invalid end time'
    },
  })

  return (
    <Modal onClose={onClose} isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {title}
          <ModalCloseButton />
        </ModalHeader>
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Reserve Price</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>
                      <SelectToken
                        chainId={chainId}
                        buttonProps={{ borderWidth: 0 }}
                        value={watch('paymentToken')}
                        onChange={value => setValue('paymentToken', value, { shouldValidate: true })}
                        disabled={!!auction}
                      />
                    </InputLeftAddon>
                    <Input
                      {...register('reservePrice', { required: true, pattern: /\d+(\.\d+)?/ })}
                      placeholder="0.00"
                    />
                  </InputGroup>
                  <FormHelperText textAlign="right">
                    <TokenBalance chainId={chainId} tokenId={watch('paymentToken')} />
                  </FormHelperText>
                </FormControl>
                <FormControl isRequired={!isStartTimePast} isInvalid={!!errors.startTime}>
                  <FormLabel>Start Time</FormLabel>
                  <DatePicker
                    name={startTimeRegister.name}
                    ref={startTimeRegister.ref}
                    selected={watch('startTime')}
                    onChange={(date, e) => {
                      if (e) startTimeRegister.onChange(e)
                      const startTime = getFirst(date)
                      if (startTime) setValue('startTime', startTime, { shouldValidate: true })
                    }}
                    onBlur={startTimeRegister.onBlur}
                    minDate={new Date()}
                    minTime={new Date()}
                    maxTime={DateTime.now().endOf('day').toJSDate()}
                    showTimeInput
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    width="100%"
                    height="40px"
                    disabled={isStartTimePast}
                  />
                  <FormErrorMessage>{errors.startTime?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.endTime}>
                  <FormLabel>End Time</FormLabel>
                  <DatePicker
                    name={endTimeRegister.name}
                    ref={endTimeRegister.ref}
                    selected={watch('endTime')}
                    onChange={(date, e) => {
                      if (e) endTimeRegister.onChange(e)
                      const endTime = getFirst(date)
                      if (endTime) setValue('endTime', endTime, { shouldValidate: true })
                    }}
                    onBlur={endTimeRegister.onBlur}
                    minDate={watch('startTime')}
                    showTimeInput
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    width="100%"
                    height="40px"
                  />
                  <FormErrorMessage>{errors.endTime?.message}</FormErrorMessage>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                variant="outline"
                w="100%"
                disabled={!account || !auctionContract || !isDirty || !isValid || isSubmitting || isSubmitSuccessful}
                isLoading={isSubmitting}
              >
                {title}
              </Button>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
