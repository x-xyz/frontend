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
import { chakra } from '@chakra-ui/system'
import { BigNumberish } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useErc1155Contract, useErc721Contract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { TokenType } from '@x/models'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { handleError } from '@x/web3'
import { isAddress } from '@x/utils'

export interface TransferModalProps extends Omit<ModalProps, 'children'> {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
  tokenSpec: TokenType
  onTransferred?: (to: string) => void
}

interface FormData {
  to: string
}

export default function TransferModal({
  chainId,
  contractAddress,
  tokenId,
  tokenSpec,
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
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onBlur', defaultValues: { to: '' } })

  const onSubmit = handleSubmit(async ({ to }) => {
    try {
      if (!account) throw new Error('cannot get account')

      let tx: ContractTransaction

      switch (tokenSpec) {
        case 721:
          if (!erc721) throw new Error('cannot get erc 721 contract')
          tx = await erc721.safeTransferFrom(account, to, tokenId)
          break
        case 1155:
          throw new Error('erc 1155 is not supported')
        default:
          throw new Error(`unknonw token spec ${tokenSpec}`)
      }

      await tx.wait()

      toast({ status: 'success', description: `Token transfered. ${tx.hash}` })

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
        <ModalHeader>Transfer</ModalHeader>
        <ModalCloseButton />
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <FormControl isRequired isInvalid={!!errors.to}>
                <FormLabel>To</FormLabel>
                <Input
                  {...register('to', {
                    required: 'Address is required',
                    validate: value => {
                      if (!isAddress(value)) return 'Invalid address'
                    },
                  })}
                />
                <FormErrorMessage>{errors.to?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                variant="outline"
                isLoading={isSubmitting}
                disabled={isSubmitting || !isDirty || !isValid}
              >
                Transfer
              </Button>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
