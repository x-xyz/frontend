import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Stack } from '@chakra-ui/layout'
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
import { verifyMessage } from '@ethersproject/wallet'
import { fetchNonce } from '@x/apis/dist/fn'
import SelectCollection from 'components/input/SelectCollection'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import useToast from 'hooks/useToast'
import { capitalize } from 'lodash'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useBanTokenMutation, useUnbanTokenMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'
import { useMutation } from 'react-query'

export interface BanNftItemModalProps extends Omit<ModalProps, 'children'> {
  mode: 'ban' | 'unban'
}

interface FormData {
  collection: { chainId: ChainId; contractAddress: string }
  tokenId: string | number
}

export default function BanNftItemModal({ mode, isOpen, ...props }: BanNftItemModalProps) {
  const toast = useToast({ title: 'Nft Item' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const [ban] = useBanTokenMutation()

  const [unban] = useUnbanTokenMutation()

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ mode: 'onChange' })

  useEffect(reset, [reset, isOpen, isSubmitSuccessful])

  const isLoading = isLoadingAuthToken || isSubmitting

  const disabled = isLoading || !isDirty || !isValid

  const onSubmit = handleSubmit(async data => {
    if (!account || !library || !authToken) return

    try {
      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const {
        collection: { chainId, contractAddress: contract },
        tokenId,
      } = data

      const resp =
        mode === 'ban'
          ? await ban({ chainId, contract, tokenId, authToken, signature, signatureAddress })
          : await unban({ chainId, contract, tokenId, authToken, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status !== 'success') throw new Error(`${capitalize(mode)} failed`)

      toast({ status: 'success', description: `${capitalize(mode)} succeeded` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  return (
    <Modal isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textTransform="capitalize">
          {mode} Nft Item
          <ModalCloseButton />
        </ModalHeader>
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Collection</FormLabel>
                <SelectCollection
                  value={watch('collection')}
                  onChange={v => v && setValue('collection', v, { shouldDirty: true, shouldTouch: true })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Token Id</FormLabel>
                <Input {...register('tokenId')} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              variant="outline"
              w="100%"
              isLoading={isLoading}
              disabled={disabled}
              textTransform="capitalize"
            >
              {mode}
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  )
}
