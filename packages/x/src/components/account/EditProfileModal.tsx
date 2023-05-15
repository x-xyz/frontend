import { fetchNonce } from '@x/apis/dist/fn'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@chakra-ui/textarea'
import { verifyMessage } from '@ethersproject/wallet'
import ImageUploader from 'components/input/ImageUploader'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { useImageUploader } from '@x/hooks'
import { useSyncRef } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useIpfsImage } from '@x/hooks'
import { useUpdateAccountMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'
import { Account } from '@x/models'
import values from 'lodash/values'
import { useMutation } from 'react-query'

export interface EditProfileModalProps extends Omit<ModalProps, 'children'> {
  defaultValues?: Partial<Pick<Account, 'alias' | 'bio' | 'email' | 'imageHash'>>
  onChange?: () => void
}

export interface FormData {
  alias: string
  email: string
  bio: string
  imgData?: string
  imageHash?: string
}

export default function EditProfileModal({
  onClose,
  isOpen,
  defaultValues,
  onChange = () => void 0,
  ...props
}: EditProfileModalProps) {
  const toast = useToast({ title: 'Edit Profile' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, dirtyFields },
  } = useForm<FormData>({ mode: 'onChange', defaultValues })

  const [imageData] = useIpfsImage(defaultValues?.imageHash)

  const defaultValuesRef = useSyncRef(defaultValues)

  const imageUploader = useImageUploader()

  const [updateAccountDetail] = useUpdateAccountMutation()

  useEffect(() => {
    if (imageUploader.image) setValue('imgData', imageUploader.image, { shouldDirty: true, shouldTouch: true })
  }, [imageUploader.image, setValue])

  useEffect(() => {
    if (isSubmitSuccessful) onClose()
  }, [isSubmitSuccessful, onClose])

  useEffect(() => {
    if (isSubmitSuccessful) onChange()
  }, [isSubmitSuccessful]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen) reset(defaultValuesRef.current)
  }, [isOpen, reset, defaultValuesRef])

  const onSubmit = handleSubmit(async data => {
    try {
      if (!account || !library) throw new Error('cannot get account')

      if (!authToken) throw new Error('cannot get auth token')

      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      if (values(dirtyFields).some(isDirty => isDirty)) {
        if (data.imgData) delete data.imageHash

        const resp = await updateAccountDetail({ ...data, authToken, signature, signatureAddress })

        if (isErrorResponse(resp)) throw resp.error

        if (resp.data.status === 'fail') throw new Error('Update profile failed')
      }

      toast({ status: 'success', description: 'Profile updated' })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const isLoading = isLoadingAuthToken || nonceMutation.isLoading || isSubmitting

  const disabled = isLoading || !isDirty || !isValid

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent
        containerProps={{ justifyContent: 'flex-start', ml: { sm: 24 } }}
        borderTopLeftRadius="0px !important"
      >
        <ModalHeader>
          Edit Profile
          <ModalCloseButton />
        </ModalHeader>
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Stack spacing={4} alignItems="center">
              <FormControl w="fit-content">
                <ImageUploader
                  {...imageUploader}
                  image={imageUploader.image || imageData}
                  w="200px"
                  h="200px"
                  borderRadius="100px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input {...register('alias')} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input {...register('email')} />
              </FormControl>
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea {...register('bio')} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" isLoading={isLoading} disabled={disabled} w="100%" variant="outline">
              Save
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  )
}
