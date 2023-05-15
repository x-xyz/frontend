import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Image } from '@chakra-ui/image'
import { Input } from '@chakra-ui/input'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps } from '@chakra-ui/modal'
import { chakra } from '@chakra-ui/system'
import { BigNumberish } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useErc1155Contract, useErc721Contract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { TokenType } from '@x/models'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { handleError } from '@x/web3'
import { compareAddress, isAddress } from '@x/utils'
import OnChainListing from '../OnChainListing'
import { Stack } from '@chakra-ui/react'
import { isFeatureEnabled } from 'flags'

export interface TransferModalProps extends Omit<ModalProps, 'children'> {
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

export default function TransferModal({
  chainId,
  contractAddress,
  tokenId,
  tokenSpec = TokenType.Erc721,
  isOpen,
  onClose,
  onTransferred,
  ...props
}: TransferModalProps) {
  const toast = useToast({ title: 'Transfer' })

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
          throw new Error(`unknonw token spec ${tokenSpec}`)
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
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <Image position="absolute" right={4} zIndex="modal" w={7} h={7} src="/assets/icons/ico-transfer-56x56.svg" />
        <ModalHeader>Transfer NFT</ModalHeader>
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <Stack>
                <FormControl isRequired isInvalid={!!errors.to}>
                  <FormLabel>Transfer To</FormLabel>
                  <Input
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
                {isFeatureEnabled('checking-listing-when-transfering') && account && (
                  <OnChainListing
                    chainId={chainId}
                    contract={contractAddress}
                    tokenId={`${tokenId}`}
                    owner={account}
                    prefixLabel="Source Address: "
                  />
                )}
                {isFeatureEnabled('checking-listing-when-transfering') && to && (
                  <OnChainListing
                    chainId={chainId}
                    contract={contractAddress}
                    tokenId={`${tokenId}`}
                    owner={to}
                    prefixLabel="Destination Address: "
                  />
                )}
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Stack w="full" spacing={5}>
                <Button
                  type="submit"
                  variant="outline"
                  color="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !isDirty || !isValid}
                >
                  Confirm Transfer
                </Button>
                <Button variant="outline" color="primary" onClick={() => onClose()}>
                  Cancel
                </Button>
              </Stack>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
