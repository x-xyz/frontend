import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import useToast from 'hooks/useToast'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
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
import { HStack, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { chakra } from '@chakra-ui/system'
import { BigNumberish } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import { ChainId } from '@x/constants'
import { useActiveWeb3React, useErc1155Contract, useErc721Contract } from '@x/hooks'
import { TokenType } from '@x/models'
import { compareAddress, isAddress } from '@x/utils'
import { handleError } from '@x/web3'

import OnChainListing from './OnChainListing'
import Overlay from '../marketplace/signature-base/Overlay'

export interface TransferOverlayProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
  tokenSpec?: TokenType
  onTransferred?: (to: string) => void
}

interface FormData {
  to: string
  quantity?: number
}

export default function TransferOverlay({
  chainId,
  contractAddress,
  tokenId,
  tokenSpec = TokenType.Erc721,
  isOpen,
  onClose,
  onTransferred,
  ...props
}: TransferOverlayProps) {
  const toast = useToast({ title: 'Transfer' })

  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

  const { account } = useActiveWeb3React()

  const erc721 = useErc721Contract(contractAddress, chainId)

  const erc1155 = useErc1155Contract(contractAddress, chainId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange', defaultValues: { to: '' } })

  const to = watch('to')

  const onSubmit = handleSubmit(async ({ to, quantity = 1 }) => {
    try {
      if (!account) throw new Error('cannot get account')

      let tx: ContractTransaction

      switch (tokenSpec) {
        case TokenType.Erc721:
          if (!erc721) throw new Error('cannot get erc 721 contract')
          tx = await erc721.safeTransferFrom(account, to, tokenId)
          break
        case TokenType.Erc1155:
          if (!erc1155) throw new Error('cannot get erc 1155 contract')
          tx = await erc1155.safeTransferFrom(account, to, tokenId, quantity, '0x00')
          break
        default:
          throw new Error(`unknown token spec ${tokenSpec}`)
      }

      await tx.wait()

      toast({ status: 'success', description: `Token transferred. ${tx.hash}` })

      if (onTransferred) onTransferred(to)
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  useEffect(() => {
    if (isOpen) reset({ to: '' })
  }, [isOpen, reset])

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  return (
    <Overlay title="Transfer" isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <chakra.form onSubmit={onSubmit}>
        <Stack spacing={8}>
          <FormControl isInvalid={!!errors.to}>
            <FormLabel>
              <Text variant="caption">Enter Wallet Address</Text>
            </FormLabel>
            <Input
              placeholder="0x..."
              {...register('to', {
                required: 'Address is required',
                validate: value => {
                  if (!isAddress(value)) return 'Invalid address'
                  if (compareAddress(account, value)) return 'This is your current account'
                },
              })}
            />
            <FormErrorMessage>{errors.to?.message}</FormErrorMessage>
          </FormControl>
          {tokenSpec === TokenType.Erc1155 && (
            <FormControl isRequired isInvalid={!!errors.quantity}>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                min={1}
                {...register('quantity', { required: true, pattern: /\d+/, min: 1, valueAsNumber: true })}
                placeholder="1"
              />
            </FormControl>
          )}
          {account && (
            <OnChainListing
              chainId={chainId}
              contract={contractAddress}
              tokenId={`${tokenId}`}
              owner={account}
              prefixLabel="Source Address: "
            />
          )}
          {to && (
            <OnChainListing
              chainId={chainId}
              contract={contractAddress}
              tokenId={`${tokenId}`}
              owner={to}
              prefixLabel="Destination Address: "
            />
          )}
          <Stack direction="row" w="full" spacing={4}>
            <Button type="submit" variant="outline" onClick={onClose} flex="1 0 auto">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              isLoading={isSubmitting}
              disabled={isSubmitting || !isDirty || !isValid}
              flex="1 0 auto"
            >
              Transfer
            </Button>
          </Stack>
        </Stack>
      </chakra.form>
    </Overlay>
  )
}
