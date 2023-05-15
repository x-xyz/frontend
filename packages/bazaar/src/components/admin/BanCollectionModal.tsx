import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
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
import { useToast } from '@chakra-ui/toast'
import { verifyMessage } from '@ethersproject/wallet'
import SelectCollection from 'components/input/SelectCollection'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { capitalize } from 'lodash'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNonceMutation } from '@x/apis'
import { useBanCollectionMutation, useUnbanCollectionMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'

export interface BanCollectionModalProps extends Omit<ModalProps, 'children'> {
  mode: 'ban' | 'unban'
}

interface FormData {
  chainId: ChainId
  contract: string
}

export default function BanCollectionModal({ mode, isOpen, ...props }: BanCollectionModalProps) {
  const toast = useToast({ title: 'Collection' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [fetchNonce] = useNonceMutation()

  const [ban] = useBanCollectionMutation()

  const [unban] = useUnbanCollectionMutation()

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<FormData>({ mode: 'onChange' })

  const isLoading = isLoadingAuthToken || isSubmitting

  const disabled = isLoading || !isDirty || !isValid

  useEffect(() => {
    if (isOpen) reset()
  }, [isOpen, reset])

  const onSubmit = handleSubmit(async ({ chainId, contract }) => {
    if (!account || !library || !authToken) return

    try {
      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

      const message = makeSignatureMessage(nonceResp.data.data)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const resp =
        mode === 'ban'
          ? await ban({ chainId, contract, authToken, signature, signatureAddress })
          : await unban({ chainId, contract, authToken, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status !== 'success') throw new Error(`${capitalize(mode)} failed`)

      toast({ status: 'success', description: `${capitalize(mode)} succeeded` })

      reset()
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  return (
    <Modal isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{capitalize(mode)} Collection</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl>
              <FormLabel>Collection</FormLabel>
              <SelectCollection
                value={{ chainId: watch('chainId'), contractAddress: watch('contract') }}
                onChange={value => {
                  if (value?.chainId && value?.contractAddress) {
                    setValue('chainId', value?.chainId, { shouldDirty: true })
                    setValue('contract', value?.contractAddress, { shouldDirty: true })
                  } else {
                    reset()
                  }
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" variant="outline" w="100%" isLoading={isLoading} disabled={disabled}>
              {capitalize(mode)}
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  )
}
