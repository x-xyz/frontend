import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import SelectToken from 'components/input/SelectToken'
import { isAddress } from 'ethers/lib/utils'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Image } from '@chakra-ui/image'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { Box, Spacer, Stack, Text } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps } from '@chakra-ui/modal'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Checkbox,
} from '@chakra-ui/react'
import { chakra } from '@chakra-ui/system'
import { BigNumberish } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { addresses, ChainId, findToken } from '@x/constants'
import { useActiveWeb3React, useErc721ApprovalForAll, useErc721Contract, useMarketplaceContract } from '@x/hooks'
import { TokenType } from '@x/models'
import { getFirst } from '@x/utils'
import { handleError } from '@x/web3'

import DatePicker from '../../DatePicker'

export interface SellModalProps extends Omit<ModalProps, 'children'> {
  mode: 'create' | 'update'
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  defaultValues?: Partial<FormData>
  tokenType?: TokenType
  onConfirmSell?: (data: FormData) => void
}

export interface FormData {
  paymentToken: string
  price: string
  quantity?: number
  deadline: Date
  isPrivateSale: boolean
  reservedAddress?: string
}

export default function SellModal({
  mode,
  chainId,
  contractAddress,
  tokenID,
  onClose,
  isOpen,
  defaultValues,
  tokenType = TokenType.Erc721,
  onConfirmSell = () => void 0,
  ...props
}: SellModalProps) {
  const toast = useToast({ title: 'Sell' })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange', defaultValues: { isPrivateSale: false, ...defaultValues } })

  const { account, callContract } = useActiveWeb3React()

  const erc721Contract = useErc721Contract(contractAddress, chainId)

  const marketplaceContract = useMarketplaceContract(chainId)

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contractAddress,
    account,
    addresses.marketplace[chainId],
  )

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  useEffect(() => {
    if (isOpen) reset(defaultValues)
  }, [isOpen, reset, defaultValues])

  const onSubmit = handleSubmit(async formData => {
    try {
      if (mode === 'create') {
        onConfirmSell(formData)
        return
      }

      if (!isApproved) {
        if (!erc721Contract) throw new Error('cannot get erc721 contract')

        const tx = await callContract({
          contract: erc721Contract,
          method: 'setApprovalForAll',
          args: [addresses.marketplace[chainId], true],
        })

        await tx.wait()

        toast({ status: 'success', description: `Approved. ${tx.hash}` })
      }

      const { price, deadline, paymentToken } = formData

      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      const priceInEther = parseUnits(price, token.decimals)
      const deadlineInSeconds = Math.floor(DateTime.fromJSDate(deadline).toSeconds())

      const tx = await callContract({
        contract: marketplaceContract,
        method: 'updateListing(address,uint256,address,uint256,uint256)',
        args: [contractAddress, tokenID, token.address, priceInEther, deadlineInSeconds],
      })

      await tx.wait()

      toast({ status: 'success', description: `Listed. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const buttonLabel = mode === 'create' ? 'Confirm Listing' : 'Update Listing'

  const deadlineRegister = register('deadline', {
    required: true,
    validate: value => {
      if (DateTime.fromJSDate(value).diff(DateTime.now()).valueOf() <= 0) return 'Invalid deadline'
    },
  })

  const datePickerRef = useRef(null)

  function renderPrice() {
    return (
      <FormControl isRequired isInvalid={!!errors.price}>
        <FormLabel>Price</FormLabel>
        <InputGroup>
          <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} placeholder="Enter amount" />
          <InputRightElement>
            <SelectToken
              chainId={chainId}
              buttonProps={{ borderWidth: 0 }}
              value={watch('paymentToken')}
              onChange={value => setValue('paymentToken', value)}
              withoutIcon
            />
          </InputRightElement>
        </InputGroup>
      </FormControl>
    )
  }

  function renderQuantity() {
    return (
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
    )
  }

  function renderDeadline() {
    return (
      <FormControl isRequired isInvalid={!!errors.deadline}>
        <FormLabel>End Date</FormLabel>
        <DatePicker
          name={deadlineRegister.name}
          ref={deadlineRegister.ref}
          selected={watch('deadline')}
          onChange={(date, e) => {
            if (e) deadlineRegister.onChange(e)
            const endTime = getFirst(date)
            if (endTime) setValue('deadline', endTime, { shouldValidate: true })
          }}
          onBlur={deadlineRegister.onBlur}
          minDate={new Date()}
          showTimeInput
          showTimeSelect
          popperProps={{
            strategy: 'fixed',
          }}
          dateFormat="MM/dd/yyyy h:mm aa"
          width="100%"
          height="40px"
        />
        <Box position="relative" ref={datePickerRef} />
        <FormErrorMessage>{errors.deadline?.message}</FormErrorMessage>
      </FormControl>
    )
  }

  function renderMoreOptions() {
    return (
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton px={0}>
            More Options
            <Spacer />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pl={0} pr={0}>
            <Stack spacing={4}>
              <Text color="note">
                Reserve NFT for a specific buyer. Check the box below and key in the Wallet Address. This NFT can be
                purchased as soon as it is listed.
              </Text>
              <Checkbox checked={watch('isPrivateSale')} onChange={e => setValue('isPrivateSale', e.target.checked)}>
                <Badge variant="tag" ml={3}>
                  PRIVATE LISTING
                </Badge>
              </Checkbox>
              {watch('isPrivateSale') && (
                <Input
                  placeholder="Wallet Address"
                  type="text"
                  {...register('reservedAddress', {
                    shouldUnregister: true,
                    validate: value => isAddress(value || '') || 'Invalid Address',
                  })}
                />
              )}
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  function renderForm() {
    return (
      <chakra.form onSubmit={onSubmit}>
        <ModalBody>
          <Stack spacing={6}>
            {renderPrice()}
            {mode === 'create' && tokenType === TokenType.Erc1155 && renderQuantity()}
            {renderDeadline()}
            {renderMoreOptions()}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Stack w="full" spacing={5}>
            <Button
              type="submit"
              variant="outline"
              color="primary"
              w="100%"
              disabled={!isDirty || !isValid}
              isLoading={isLoadingApproved || isSubmitting}
            >
              {buttonLabel}
            </Button>
            <Button variant="outline" color="primary" w="100%" onClick={() => onClose()}>
              Cancel
            </Button>
          </Stack>
        </ModalFooter>
      </chakra.form>
    )
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent>
        <Image position="absolute" right={4} zIndex="modal" w={7} h={7} src="/assets/icons/ico-auctionbid-56x56.svg" />
        <ModalHeader>List NFT for sale</ModalHeader>
        <EnsureConsistencyChain expectedChainId={chainId}>{renderForm()}</EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
