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
import { useToast } from '@x/hooks'
import { useIpfsImage } from '@x/hooks'
// import { useNonceMutation, useUpdateAccountDetailMutation } from '@x/apis'
import { useNonceMutation, useUpdateAccountMutation, useUpdateAvatarMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'
import { Account } from '@x/models'
import values from 'lodash/values'

export interface EditProfileModalProps extends Omit<ModalProps, 'children'> {
  defaultValues?: Partial<Pick<Account, 'alias' | 'bio' | 'email' | 'imageHash'>>
  onChange?: () => void
}

export interface FormData {
  alias: string
  email: string
  bio: string
  imgData?: string
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

  const [fetchNonce, { isLoading: isLoadingNonce }] = useNonceMutation()

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

  const [updateAvatar] = useUpdateAvatarMutation()

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

  const onSubmit = handleSubmit(async ({ imgData, ...data }) => {
    try {
      if (!account || !library) throw new Error('cannot get account')

      if (!authToken) throw new Error('cannot get auth token')

      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

      const message = makeSignatureMessage(nonceResp.data.data)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      if (values(dirtyFields).some(isDirty => isDirty)) {
        const resp = await updateAccountDetail({ ...data, authToken, signature, signatureAddress })

        if (isErrorResponse(resp)) throw resp.error

        if (resp.data.status === 'fail') throw new Error('Update profile failed')
      }

      if (imgData) {
        const resp = await updateAvatar({ authToken, imgData, signature, signatureAddress })

        if (isErrorResponse(resp)) throw resp.error

        if (resp.data.status === 'fail') throw new Error('Update avatar failed')
      }

      toast({ status: 'success', description: 'Profile updated' })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const isLoading = isLoadingAuthToken || isLoadingNonce || isSubmitting

  const disabled = isLoading || !isDirty || !isValid

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Avatar</FormLabel>
                <ImageUploader
                  {...imageUploader}
                  image={imageUploader.image || imageData}
                  w="100px"
                  h="100px"
                  borderRadius="50px"
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
