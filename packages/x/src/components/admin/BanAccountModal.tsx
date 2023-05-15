import { Button } from '@chakra-ui/button'
import { CloseButton } from '@chakra-ui/close-button'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
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
import { Stack } from '@chakra-ui/react'
import { chakra } from '@chakra-ui/system'
import { verifyMessage } from '@ethersproject/wallet'
import { fetchNonce } from '@x/apis/dist/fn'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import useToast from 'hooks/useToast'
import { capitalize } from 'lodash'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useBanAccountMutation, useUnbanAccountMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'
import { useMutation } from 'react-query'

export interface BanAccountModalProps extends Omit<ModalProps, 'children'> {
  mode: 'ban' | 'unban'
}

interface FormData {
  addresses: { value: string }[]
}

export default function BanAccountModal({ mode, isOpen, ...props }: BanAccountModalProps) {
  const toast = useToast({ title: 'Account' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const [ban] = useBanAccountMutation()

  const [unban] = useUnbanAccountMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ mode: 'onChange' })

  useEffect(() => reset(), [reset, isOpen, isSubmitSuccessful])

  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' })

  const onSubmit = handleSubmit(async data => {
    if (!account || !library || !authToken) return

    try {
      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const addresses = data.addresses.map(field => field.value)

      const resp =
        mode === 'ban'
          ? await ban({ addresses, authToken, signature, signatureAddress })
          : await unban({ addresses, authToken, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status !== 'success') throw new Error(`${capitalize(mode)} failed`)

      toast({ status: 'success', description: `${capitalize(mode)} succeeded` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const isLoading = isLoadingAuthToken || isSubmitting

  const disabled = isLoading || !isDirty || !isValid

  function renderField(field: typeof fields[number], index: number) {
    return (
      <InputGroup key={field.id}>
        <Input placeholder="Account address" {...register(`addresses.${index}.value`)} />
        <InputRightElement>
          <CloseButton onClick={() => remove(index)} />
        </InputRightElement>
      </InputGroup>
    )
  }

  return (
    <Modal isOpen={isOpen} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textTransform="capitalize">
          {mode} Account
          <ModalCloseButton />
        </ModalHeader>
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Stack>
              {fields.map(renderField)}
              <Button onClick={() => append({ value: '' })}>Add</Button>
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
