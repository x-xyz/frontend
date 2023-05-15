import { fetchNonce } from '@x/apis/dist/fn'
import { useForm } from 'react-hook-form'
import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input'
import { Center, Container, Stack } from '@chakra-ui/layout'
import { chakra } from '@chakra-ui/system'
import { Textarea } from '@chakra-ui/textarea'
import ImageUploader from 'components/input/ImageUploader'
import Layout from 'components/Layout'
import SelectCategories from 'components/input/SelectCategories'
import { useAuthToken } from '@x/hooks'
import { useImageUploader } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useActiveWeb3React } from '@x/hooks'
import { Category } from '@x/models'
import { useRegisterCollectionMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { fetchImage, clipImage, isErrorResponse } from '@x/utils'
import { isAddress, signMessage } from '@x/utils'
import { ChainId, getChain } from '@x/constants'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useMutation } from 'react-query'

interface FormData {
  collectionName: string
  description: string
  royalty: number
  feeRecipient: string
  categories: Category[]
  erc721Address: string
  siteUrl: string
  twitterHandle: string
  discord: string
  instagramHandle: string
  mediumHandle: string
  telegram: string
  email: string
  logoImageHash: string
}

export default function Register() {
  const toast = useToast({ title: 'Register Collection' })

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onBlur', defaultValues: { royalty: 0 } })

  const { account, library, chainId = ChainId.Fantom } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [registerCollection] = useRegisterCollectionMutation()

  const imageUploader = useImageUploader()

  const nonceMutation = useMutation(fetchNonce)

  const onSubmit = handleSubmit(async ({ collectionName, erc721Address, categories, ...rest }) => {
    if (!authToken || !imageUploader.image) return

    try {
      if (!account || !library) throw new Error('cannot get account')

      if (!authToken) throw new Error('cannot get auth token')

      const nonce = await nonceMutation.mutateAsync(authToken)

      const signature = await signMessage(library.getSigner(), account, makeSignatureMessage(nonce))

      const image = await fetchImage(imageUploader.image)

      const { width, height } = image

      const size = Math.min(width, height)

      const x = (width - size) / 2

      const y = (height - size) / 2

      const logoImage = clipImage(image, x, y, size, size, 128, 128)

      const resp = await registerCollection({
        authToken,
        chainId,
        collectionName,
        erc721Address,
        categories: categories?.map(c => c.toString()) || [],
        ...rest,
        logoImage,
        // logoImageHash: resp0.data.data,
        signature,
      })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status === 'fail') throw new Error(resp.data.data)

      toast({ status: 'success', description: 'Collection registered' })
    } catch (error) {
      if (typeof (error as FetchBaseQueryError).status === 'number') {
        const data = ((error as FetchBaseQueryError).data as any)?.data
        if (typeof data === 'string') {
          if (data.includes('E11000 duplicate key')) {
            toast({
              status: 'error',
              description:
                'The collection has been registered already. Please contact the X team on twitter dm or discord for any questions.',
              duration: null,
            })

            throw error
          }
        }
      }

      handleError(error, { toast })

      throw error
    }
  })

  const isLoading = isLoadingAuthToken || nonceMutation.isLoading || imageUploader.isLoading || isSubmitting

  const disabled = isLoading || !isDirty || !isValid || !imageUploader.image || isSubmitSuccessful

  return (
    <Layout backgroundWatermark>
      <Container>
        <chakra.form onSubmit={onSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Logo Image</FormLabel>
              <ImageUploader {...imageUploader} />
              <FormHelperText>This image will also be used for navigation. 300x300 recommended</FormHelperText>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.collectionName}>
              <FormLabel>Collection Name</FormLabel>
              <Input {...register('collectionName', { maxLength: 32, required: 'Collection name is required' })} />
              <FormHelperText textAlign="right">{watch('collectionName')?.length || 0}/32</FormHelperText>
              <FormErrorMessage>{errors.collectionName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea {...register('description', { maxLength: 200, required: 'Description is required' })} />
              <FormHelperText textAlign="right">{watch('description')?.length || 0}/200</FormHelperText>
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.royalty}>
              <FormLabel>Royalty</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  max={100}
                  {...register('royalty', {
                    min: { value: 0, message: 'Valid range 0.00 ~ 100.00' },
                    max: { value: 100, message: 'Valid range 0.00 ~ 100.00' },
                    valueAsNumber: true,
                  })}
                />
                <InputRightAddon>%</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>{errors.royalty?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.feeRecipient}>
              <FormLabel>Fee Recipient</FormLabel>
              <Input
                {...register('feeRecipient', {
                  required: 'Fee recipient is required',
                  validate: value => {
                    if (!isAddress(value)) return 'Invalid address'
                  },
                })}
              />
              <FormErrorMessage>{errors.feeRecipient?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Category</FormLabel>
              <SelectCategories value={watch('categories')} onChange={value => setValue('categories', value)} />
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.erc721Address}>
              <FormLabel>Contract Address</FormLabel>
              <Input
                {...register('erc721Address', {
                  required: 'Contract address is required',
                  validate: value => {
                    if (!isAddress(value)) return 'Invalid address'
                  },
                })}
              />
              <FormErrorMessage>{errors.erc721Address?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Website</FormLabel>
              <Input {...register('siteUrl')} />
            </FormControl>
            <FormControl>
              <FormLabel>Discord</FormLabel>
              <Input {...register('discord')} />
            </FormControl>
            <FormControl>
              <FormLabel>Twitter</FormLabel>
              <Input {...register('twitterHandle')} />
            </FormControl>
            <FormControl>
              <FormLabel>Instagram</FormLabel>
              <Input {...register('instagramHandle')} />
            </FormControl>
            <FormControl>
              <FormLabel>Medium</FormLabel>
              <Input {...register('mediumHandle')} />
            </FormControl>
            <FormControl>
              <FormLabel>Telegram</FormLabel>
              <Input {...register('telegram')} />
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Contact Email</FormLabel>
              <Input
                {...register('email', {
                  required: 'Contact email is required',
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Invalid email',
                  },
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <Center>
              {account ? (
                <Button type="submit" disabled={disabled} isLoading={isLoading}>
                  Register on {getChain(chainId).name}
                </Button>
              ) : (
                <ConnectWalletButton />
              )}
            </Center>
          </Stack>
        </chakra.form>
      </Container>
    </Layout>
  )
}
