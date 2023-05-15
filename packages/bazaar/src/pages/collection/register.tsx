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
import { useToast } from '@x/hooks'
import { useActiveWeb3React } from '@x/hooks'
import { Category } from '@x/models'
import { useNonceMutation } from '@x/apis'
import { useRegisterCollectionMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { fetchImage, clipImage } from '@x/utils'
import { isErrorResponse } from '@x/utils'
import { isAddress, signMessage } from '@x/utils'
import { defaultNetwork, getChain } from '@x/constants'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import HeadMeta from 'components/HeadMeta'

export const getServerSideProps = createServerSidePropsGetter()

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

  const { account, library, chainId = defaultNetwork } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [registerCollection] = useRegisterCollectionMutation()

  const logoUploader = useImageUploader()

  const coverUploader = useImageUploader()

  const [fetchNonce, { isLoading: isLoadingNonce }] = useNonceMutation()

  const onSubmit = handleSubmit(async ({ collectionName, erc721Address, categories, ...rest }) => {
    if (!authToken || !logoUploader.image || !coverUploader.image) return

    try {
      if (!account || !library) throw new Error('cannot get account')

      if (!authToken) throw new Error('cannot get auth token')

      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

      const signature = await signMessage(library.getSigner(), account, makeSignatureMessage(nonceResp.data.data))

      const logo = await fetchImage(logoUploader.image)

      const logoSize = Math.min(logo.width, logo.height)

      const logoImage = clipImage(
        logo,
        (logo.width - logoSize) / 2,
        (logo.height - logoSize) / 2,
        logoSize,
        logoSize,
        300,
        300,
      )

      const cover = await fetchImage(coverUploader.image)

      const coverAspectRatio = cover.width / cover.height

      const expectedCoverAspectRatio = 1.5 // 600 / 400

      const coverWidth =
        coverAspectRatio > expectedCoverAspectRatio ? cover.height * expectedCoverAspectRatio : cover.width

      const coverHeight = coverWidth / expectedCoverAspectRatio

      const coverImage = clipImage(
        cover,
        (cover.width - coverWidth) / 2,
        (cover.height - coverHeight) / 2,
        coverWidth,
        coverHeight,
        600,
        400,
      )

      const resp = await registerCollection({
        authToken,
        chainId,
        collectionName,
        erc721Address,
        categories: categories?.map(c => c.toString()) || [],
        ...rest,
        logoImage,
        coverImage,
        signature,
      })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status === 'fail') throw new Error(resp.data.data)

      toast({ status: 'success', description: 'Collection registered' })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  const isLoading = isLoadingAuthToken || isLoadingNonce || logoUploader.isLoading || isSubmitting

  const disabled = isLoading || !isDirty || !isValid || !logoUploader.image || isSubmitSuccessful

  return (
    <Layout>
      <HeadMeta subtitle="Register your collection" />
      <Container>
        <chakra.form onSubmit={onSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Logo Image</FormLabel>
              <ImageUploader {...logoUploader} />
              <FormHelperText>This image will also be used for navigation. 300x300 recommended</FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Featured Image</FormLabel>
              <ImageUploader
                width={{ base: '360px', md: '540px' }}
                height={{ base: '240px', md: '360px' }}
                {...coverUploader}
              />
              <FormHelperText>This image will also be used as collection banner. 600x400 recommended</FormHelperText>
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
