import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Divider, Stack } from '@chakra-ui/layout'
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
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { useToast } from '@x/hooks'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNonceMutation } from '@x/apis'
import { useAddModeratorMutation, useRemoveModeratorMutation, useLazyModeratorsQuery } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { isAddress, signMessage } from '@x/utils'
import ModeratorList from './ModeratorList'

export interface ModeratorModalProps extends Omit<ModalProps, 'children'> {
  mode: 'add' | 'remove'
}

interface FormData {
  name: string
  address: string
}

export default function ModeratorModal({ mode, isOpen, ...props }: ModeratorModalProps) {
  const toast = useToast({ title: 'Moderator' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [add] = useAddModeratorMutation()

  const [remove] = useRemoveModeratorMutation()

  const [fetchNonce] = useNonceMutation()

  const [fetchList, { data: list, isLoading: isLoadingList }] = useLazyModeratorsQuery()

  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange' })

  const isLoading = isLoadingAuthToken || isSubmitting

  const disabled = isLoading || !isDirty || !isValid

  useEffect(reset, [reset, isOpen, isSubmitSuccessful])

  useEffect(() => {
    if (isOpen && authToken) fetchList({ authToken })
  }, [fetchList, isOpen, authToken, isSubmitSuccessful])

  async function onRemove(address: string) {
    if (!account || !library || !authToken) return

    try {
      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

      const message = makeSignatureMessage(nonceResp.data.data)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const resp = await remove({ address, authToken, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status !== 'success') throw new Error('Remove failed')

      toast({ status: 'success', description: 'Remove succeeded' })

      fetchList({ authToken })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  }

  const onSubmit = handleSubmit(async ({ name, address }) => {
    if (!account || !library || !authToken) return

    try {
      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

      const message = makeSignatureMessage(nonceResp.data.data)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const resp = await add({ name, address, authToken, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status !== 'success') throw new Error('Add failed')

      toast({ status: 'success', description: 'Add succeeded' })

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
        <ModalHeader>Moderator</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Stack spacing={4}>
              <ModeratorList moderators={list?.data} isLoading={isLoadingList} onRemove={onRemove} />
              <Divider />
              {mode === 'add' && (
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input {...register('name', { required: 'Name is required' })} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
              )}
              <FormControl isRequired isInvalid={!!errors.address}>
                <FormLabel>Address</FormLabel>
                <Input
                  {...register('address', {
                    required: 'Address is requried',
                    validate: value => {
                      if (!isAddress(value)) return 'Invalid address'
                    },
                  })}
                />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
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
