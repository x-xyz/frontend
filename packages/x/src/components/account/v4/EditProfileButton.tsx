import SettingIcon from 'components/icons/SettingIcon'
import ImageUploader from 'components/input/v3/ImageUploader'
import useToast from 'hooks/useToast'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'

import {
  Button,
  Center,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { fetchNonce, updateAccount } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken, useImageUploader, useIpfsImage } from '@x/hooks'
import { Account, PatchableAccount } from '@x/models'
import { handleError, makeSignatureMessage } from '@x/web3'
import { signMessage } from '@x/utils'
import { useEffect } from 'react'

export interface EditProfileButtonProps {
  defaultValues?: Account
}

export default function EditProfileButton({ defaultValues }: EditProfileButtonProps) {
  const toast = useToast({ title: 'Edit Profile' })
  const { account, library } = useActiveWeb3React()
  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [defaultAvatar, isLoadingDefaultAvatar] = useIpfsImage(defaultValues?.imageHash)
  const [defaultBanner, isLoadingDefaultBanner] = useIpfsImage(defaultValues?.bannerHash)
  const avatarUploader = useImageUploader(defaultValues?.imageUrl || defaultAvatar)
  const bannerUploader = useImageUploader(defaultValues?.bannerUrl || defaultBanner)
  const { register, setValue, handleSubmit, formState } = useForm<PatchableAccount>({
    mode: 'onChange',
    defaultValues: {
      alias: defaultValues?.alias,
      email: defaultValues?.email,
      bio: defaultValues?.bio,
      website: defaultValues?.website,
      twitter: defaultValues?.twitter,
      instagram: defaultValues?.instagram,
      discord: defaultValues?.discord,
    },
  })
  const isLoading = isLoadingAuthToken || isLoadingDefaultAvatar || isLoadingDefaultBanner || formState.isSubmitting
  const isDisabled = isLoading

  const queryClient = useQueryClient()
  const nonceMutation = useMutation(fetchNonce)
  const updateMutation = useMutation(updateAccount, {
    onSuccess: account => {
      queryClient.setQueryData(['account', account.address], account)
    },
  })

  useEffect(() => {
    if (defaultAvatar === avatarUploader.image) {
      setValue('imgData', void 0, { shouldDirty: false })
      setValue('avatarImgData', void 0, { shouldDirty: false })
    } else {
      setValue('imgData', avatarUploader.image, { shouldDirty: true })
      setValue('avatarImgData', avatarUploader.image, { shouldDirty: true })
    }
  }, [defaultAvatar, avatarUploader.image, setValue])

  useEffect(() => {
    if (defaultBanner === bannerUploader.image) {
      setValue('bannerImgData', void 0, { shouldDirty: false })
    } else {
      setValue('bannerImgData', bannerUploader.image, { shouldDirty: true })
    }
  }, [defaultBanner, bannerUploader.image, setValue])

  const onSubmit = handleSubmit(async data => {
    try {
      if (!account || !library) throw new Error('cannot get account')
      if (!authToken) throw new Error('cannot get auth token')

      const nonce = await nonceMutation.mutateAsync(authToken)
      const message = makeSignatureMessage(nonce)
      const signature = await signMessage(library.getSigner(), account, message)
      const fields = Object.keys(data) as (keyof PatchableAccount)[]
      const params: PatchableAccount = {}
      for (const field of fields) {
        if (data[field] !== void 0) params[field] = data[field]
      }
      await updateMutation.mutateAsync({ queryKey: [authToken, { ...params, signature }], meta: {} })
      toast({ status: 'success', description: 'Profile updated' })
    } catch (error) {
      handleError(error, { toast })
      throw error
    }
  })

  return (
    <Popover variant="panel" placement="bottom-end" isLazy lazyBehavior="unmount">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <IconButton
              variant="icon"
              w={10}
              h={10}
              icon={<SettingIcon w="full" h="full" />}
              aria-label="Edit profile"
            />
          </PopoverTrigger>
          <PopoverContent w="380px">
            <form onSubmit={onSubmit}>
              <PopoverHeader>
                <Heading size="sm">Profile Settings</Heading>
              </PopoverHeader>
              <PopoverBody>
                <Stack spacing={5}>
                  <FormControl>
                    <FormLabel>Profile Image</FormLabel>
                    <FormHelperText>Recommended size 320x320 px</FormHelperText>
                    <Center w="full" mt={5}>
                      <ImageUploader w="160px" h="160px" borderRadius="80px" {...avatarUploader} />
                    </Center>
                  </FormControl>
                  {/* <FormControl>
                    <FormLabel>Profile Banner</FormLabel>
                    <FormHelperText>Recommanded size 1200x300 px</FormHelperText>
                    <ImageUploader mt={5} w="300px" h="75px" {...bannerUploader} />
                  </FormControl> */}
                  <FormControl>
                    <FormLabel>Profile Name</FormLabel>
                    <Input {...register('alias')} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Your Bio</FormLabel>
                    <Textarea {...register('bio')} />
                  </FormControl>
                  {/* <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input {...register('email')} />
                  </FormControl>
                  <Text>Social Links</Text>
                  <Divider />
                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input {...register('website')} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Twitter</FormLabel>
                    <Input {...register('twitter')} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Instagram</FormLabel>
                    <Input {...register('instagram')} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Discord</FormLabel>
                    <Input {...register('discord')} />
                  </FormControl> */}
                </Stack>
              </PopoverBody>
              <PopoverFooter>
                <Stack w="full">
                  <Button type="submit" isLoading={isLoading} disabled={isDisabled}>
                    Save
                  </Button>
                  <Button type="button" onClick={onClose}>
                    Cancel
                  </Button>
                </Stack>
              </PopoverFooter>
            </form>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
