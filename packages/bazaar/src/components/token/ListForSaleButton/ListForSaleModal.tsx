import { DateTime } from 'luxon'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import { useForm } from 'react-hook-form'

import {
  Box,
  Button,
  chakra,
  Grid,
  GridItem,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
  SkeletonText,
  Tab,
  TabList,
  Tabs,
} from '@chakra-ui/react'
import {
  useActiveWeb3React,
  useAuctionContract,
  useErc721ApprovalForAll,
  useErc721Contract,
  useMarketplaceContract,
  useToast,
} from '@x/hooks'
import { ChainId, getDaysFromTimePeriod, TimePeriod } from '@x/models'
import { useEffect } from 'react'
import { handleError } from '@x/web3'
import { findToken } from '@x/constants'
import { useCollectionQuery } from '@x/apis'
import { ContractTransaction } from '@ethersproject/contracts'
import { parseUnits } from '@ethersproject/units'
import SelectToken from 'components/input/SelectToken'
import DatePicker from 'components/DatePicker'
import { getFirst } from '@x/utils'
import SelectTimePeriod from 'components/input/SelectTimePeriod'

export interface ListForSaleModalProps extends Omit<ModalProps, 'children'> {
  mode: 'create' | 'update'
  chainId: ChainId
  contract: string
  tokenId: string
  defaultValues?: FormData
  afterSubmitted?: () => void
}

export interface FormData {
  type: 'list' | 'auction'
  paymentToken: string
  price: string
  startTime?: Date
  duration?: TimePeriod
}

const defaultDefaultValues: FormData = { type: 'list', paymentToken: 'bnb', price: '' }

export default function ListForSaleModal({
  mode,
  chainId,
  contract,
  tokenId,
  defaultValues = defaultDefaultValues,
  onClose,
  isOpen,
  afterSubmitted,
  ...props
}: ListForSaleModalProps) {
  const toast = useToast({ title: 'List For Sale' })

  const { data: collection, isLoading: isLoadingCollection } = useCollectionQuery({ chainId, contract })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors, dirtyFields, touchedFields },
  } = useForm<FormData>({ mode: 'onChange', defaultValues, reValidateMode: 'onChange' })

  const type = watch('type')

  const { account, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(contract, chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const auctionContract = useAuctionContract(chainId)

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contract,
    account,
    type === 'auction' ? auctionContract?.address : marketplaceContract?.address,
  )

  // reset when modal opened
  useEffect(() => {
    if (isOpen) reset(defaultValues)
  }, [isOpen, reset, defaultValues])

  // close once submit successful
  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  const onSubmit = handleSubmit(async data => {
    // text description of operation, use for toast display
    let action = ''

    try {
      if (!account) throw new Error('Cannot get account')

      if (!erc721Contract) throw new Error('Cannot get erc721 contract')

      let operatorAddress: string | undefined

      if (data.type === 'auction') {
        operatorAddress = auctionContract?.address
      } else {
        operatorAddress = marketplaceContract?.address
      }

      if (!operatorAddress) throw new Error('Cannot get auction or marketplace contract')

      const token = findToken(data.paymentToken, chainId)

      if (!token) throw new Error(`Unknown token: ${data.paymentToken}`)

      if (!isApproved) {
        const tx = await callContract({
          contract: erc721Contract,
          method: 'setApprovalForAll',
          args: [operatorAddress, true],
        })

        await tx.wait()

        toast({ status: 'success', description: `Approved. ${tx.hash}` })
      }

      const txs: ContractTransaction[] = []

      const priceInEther = parseUnits(data.price, token.decimals)
      const startTime = data.startTime
        ? DateTime.fromJSDate(data.startTime).startOf('second')
        : DateTime.now().startOf('second').plus({ minutes: 1 })
      const start = startTime.toSeconds()
      const end = data.duration ? startTime.plus({ days: getDaysFromTimePeriod(data.duration) }).toSeconds() : 0

      if (data.type === 'auction') {
        if (!auctionContract) throw new Error('Cannot get auction contract')

        if (mode === 'create') {
          action = 'Create auction'
          txs.push(
            await callContract({
              contract: auctionContract,
              method: 'createAuction',
              args: [contract, tokenId, token.address, priceInEther, start, end],
            }),
          )
        } else {
          const auctionDefaultValues = defaultValues?.type === 'auction' ? defaultValues : void 0

          if (!auctionDefaultValues) throw new Error('Not found default values, please contact official support')

          action = 'Update auction'

          if (auctionDefaultValues.price !== data.price) {
            txs.push(
              await callContract({
                contract: auctionContract,
                method: 'updateAuctionReservePrice',
                args: [contract, tokenId, priceInEther],
              }),
            )
          }

          if (auctionDefaultValues.startTime?.valueOf() !== data.startTime?.valueOf()) {
            txs.push(
              await callContract({
                contract: auctionContract,
                method: 'updateAuctionStartTime',
                args: [contract, tokenId, start],
              }),
              await callContract({
                contract: auctionContract,
                method: 'updateAuctionEndTime',
                args: [contract, tokenId, end],
              }),
            )
          } else if (auctionDefaultValues.duration !== data.duration) {
            txs.push(
              await callContract({
                contract: auctionContract,
                method: 'updateAuctionEndTime',
                args: [contract, tokenId, end],
              }),
            )
          }
        }
      } else {
        if (!marketplaceContract) throw new Error('Cannot get marketplace contract')

        if (mode === 'create') {
          action = 'List item'

          txs.push(
            await callContract({
              contract: marketplaceContract,
              /**
               * @todo use deadline once contract upgraded
               */
              // method: 'listItem(address,uint256,uint256,address,uint256,uint256,uint256)',
              // args: [contract, tokenId, 1, token.address, priceInEther, start, end],
              method: 'listItem(address,uint256,uint256,address,uint256,uint256)',
              args: [contract, tokenId, 1, token.address, priceInEther, start],
            }),
          )
        } else {
          action = 'Update listing'
          txs.push(
            await callContract({
              contract: marketplaceContract,
              /**
               * @todo use deadline once contract upgraded
               */
              // method: 'updateListing(address,uint256,address,uint256,uint256)',
              // args: [contract, tokenId, token.address, priceInEther, end],
              method: 'updateListing(address,uint256,address,uint256)',
              args: [contract, tokenId, token.address, priceInEther],
            }),
          )
        }
      }

      await Promise.all(txs.map(tx => tx.wait()))

      toast({ status: 'success', description: `${action} succeed` })

      afterSubmitted?.()
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const isLoading = isLoadingApproved || isSubmitting

  const canSubmit = isDirty && isValid && !isSubmitSuccessful

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>List For Sale</ModalHeader>
        <ModalCloseButton />
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <Stack spacing={6}>
                {mode === 'create' && (
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Tabs
                      variant="switch"
                      index={watch('type') === 'auction' ? 1 : 0}
                      onChange={i => setValue('type', i === 0 ? 'list' : 'auction')}
                    >
                      <TabList>
                        <Tab>Fixed Price</Tab>
                        <Tab>Timed Auction</Tab>
                      </TabList>
                    </Tabs>
                  </FormControl>
                )}
                <FormControl isInvalid={!!errors.price} isRequired>
                  <FormLabel>{watch('type') === 'auction' ? 'Reserve Price' : 'Sale Price'}</FormLabel>
                  <InputGroup>
                    <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} />
                    <InputRightAddon>
                      <SelectToken
                        chainId={chainId}
                        buttonProps={{ borderWidth: 0 }}
                        value={watch('paymentToken')}
                        onChange={value => setValue('paymentToken', value)}
                      />
                    </InputRightAddon>
                  </InputGroup>
                  {watch('type') === 'auction' && (
                    <FormHelperText>
                      If you don’t receive any bids equal to or greater than your reserve, the auction will end without
                      sale.
                    </FormHelperText>
                  )}
                  <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.startTime}>
                  <FormLabel>Start Time</FormLabel>
                  <DatePicker
                    {...register('startTime')}
                    value={void 0}
                    selected={watch('startTime')}
                    onChange={(date, e) => {
                      if (e) register('startTime').onChange(e)
                      const v = getFirst(date)
                      setValue('startTime', v ? v : void 0, { shouldValidate: true, shouldDirty: true })
                    }}
                    minDate={new Date()}
                    maxTime={DateTime.now().endOf('day').toJSDate()}
                    minTime={new Date()}
                    showTimeInput
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    isClearable
                  />
                  <FormErrorMessage>{errors.startTime?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.duration}>
                  <FormLabel>Duration</FormLabel>
                  <SelectTimePeriod
                    {...register('duration')}
                    timePeriodToLabel={{
                      [TimePeriod.Day]: '1 day',
                      [TimePeriod.Week]: '7 days',
                      [TimePeriod.TwoWeeks]: '14 days',
                      [TimePeriod.Month]: '30 days',
                      [TimePeriod.TwoMonth]: '60 days',
                    }}
                    hideOptions={[TimePeriod.Year, TimePeriod.All]}
                  />
                  <FormErrorMessage>{errors.duration?.message}</FormErrorMessage>
                </FormControl>
                <Box h={6} />
                <FormControl>
                  <FormLabel>Fees</FormLabel>
                  <Grid templateColumns="1fr auto" fontSize="sm">
                    <GridItem color="inactive">Royalty Fee</GridItem>
                    <GridItem textAlign="right">
                      <SkeletonText isLoaded={!isLoadingCollection} noOfLines={1}>
                        {collection?.data?.royalty || '--'}%
                      </SkeletonText>
                    </GridItem>
                    <GridItem color="inactive">Service Fee</GridItem>
                    <GridItem textAlign="right">2%</GridItem>
                  </Grid>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" isLoading={isLoading} disabled={!canSubmit}>
                Complete Listing
              </Button>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
