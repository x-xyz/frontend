import { DateTime } from 'luxon'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Button } from '@chakra-ui/button'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input'
import { parseUnits } from '@ethersproject/units'
import { ContractTransaction } from '@ethersproject/contracts'
import { findToken } from '@x/constants'
import { useErc721Contract, useMarketplaceContract } from '@x/hooks'
import { useToast } from '@x/hooks'
import { useErc721ApprovalForAll } from '@x/hooks'
import SelectToken from 'components/input/SelectToken'
import { addresses } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { handleError } from '@x/web3'
import { ChainId } from '@x/constants'
import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import { BigNumberish } from '@ethersproject/bignumber'
import TokenBalance from 'components/wallet/TokenBalance'

export interface SellModalProps extends Omit<ModalProps, 'children'> {
  mode: 'create' | 'update'
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  defaultValues?: Partial<FormData>
}

interface FormData {
  paymentToken: string
  price: string
}

export default function SellModal({
  mode,
  chainId,
  contractAddress,
  tokenID,
  onClose,
  isOpen,
  defaultValues,
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
  } = useForm<FormData>({ mode: 'onChange', defaultValues })

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

  const onSubmit = handleSubmit(async ({ paymentToken, price }) => {
    try {
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

      const token = findToken(paymentToken, chainId)

      if (!token) throw new Error(`unknown token: ${paymentToken}`)

      if (!account) throw new Error('cannot get account')

      if (!marketplaceContract) throw new Error('cannot get marketplace contract')

      const priceInEther = parseUnits(price, token.decimals)

      let tx: ContractTransaction

      if (mode === 'create') {
        const startingTime = Math.floor(DateTime.now().toSeconds())

        tx = await callContract({
          contract: marketplaceContract,
          method: 'listItem(address,uint256,uint256,address,uint256,uint256)',
          args: [contractAddress, tokenID, 1, token.address, priceInEther, startingTime],
        })
      } else {
        tx = await callContract({
          contract: marketplaceContract,
          method: 'updateListing(address,uint256,address,uint256)',
          args: [contractAddress, tokenID, token.address, priceInEther],
        })
      }

      await tx.wait()

      toast({ status: 'success', description: `Listed. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const buttonLabel = mode === 'create' ? 'List Item' : 'Update Listing'

  return (
    <Modal onClose={onClose} isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sell your item</ModalHeader>
        <ModalCloseButton />
        <EnsureConsistencyChain expectedChainId={chainId}>
          <chakra.form onSubmit={onSubmit}>
            <ModalBody>
              <FormControl isInvalid={!!errors.price}>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <InputLeftAddon>
                    <SelectToken
                      chainId={chainId}
                      buttonProps={{ borderWidth: 0 }}
                      value={watch('paymentToken')}
                      onChange={value => setValue('paymentToken', value)}
                    />
                  </InputLeftAddon>
                  <Input {...register('price', { required: true, pattern: /\d+(\.\d+)?/ })} placeholder="0.00" />
                </InputGroup>
                <FormHelperText textAlign="right">
                  <TokenBalance chainId={chainId} tokenId={watch('paymentToken')} />
                </FormHelperText>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                variant="outline"
                w="100%"
                disabled={!isDirty || !isValid}
                isLoading={isLoadingApproved || isSubmitting}
              >
                {isApproved ? buttonLabel : `Approve & ${buttonLabel}`}
              </Button>
            </ModalFooter>
          </chakra.form>
        </EnsureConsistencyChain>
      </ModalContent>
    </Modal>
  )
}
