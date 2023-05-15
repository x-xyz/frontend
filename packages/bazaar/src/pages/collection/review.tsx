import { Avatar } from '@chakra-ui/avatar'
import { Button } from '@chakra-ui/button'
import { Checkbox } from '@chakra-ui/checkbox'
import { FormControl } from '@chakra-ui/form-control'
import { Center, Divider, Grid, GridItem, Stack, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { chakra } from '@chakra-ui/system'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs'
import { Textarea } from '@chakra-ui/textarea'
import { VisuallyHidden } from '@chakra-ui/visually-hidden'
import Address from 'components/Address'
import Image from 'components/Image'
import SelectCategories from 'components/input/SelectCategories'
import Layout from 'components/Layout'
import Link from 'components/Link'
import { getChainName } from '@x/constants'
import { useAuthToken } from '@x/hooks'
import { useToast } from '@x/hooks'
import { toCategories } from '@x/models'
import { Collection } from '@x/models'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
// import { useLazyPendingCollectionsQuery, useReviewCollectionMutation } from '@x/apis'
import { useLazyUnreviewedCollectionsQuery, useReviewCollectionMutation } from '@x/apis'
import { handleError } from '@x/web3'
import { compareAddress, getValidAddress } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(void 0, { requrieAuth: true })

export default function Review() {
  const [authToken] = useAuthToken()

  const [fetch, { data, isLoading }] = useLazyUnreviewedCollectionsQuery()

  const [collections, setCollections] = useState<Collection[]>([])

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (authToken) fetch({ authToken })
  }, [authToken, fetch])

  useEffect(() => {
    if (data?.status === 'success') setCollections(data.data)
  }, [data])

  function onReviewed({ erc721Address }: Collection) {
    setCollections(prev => prev.filter(c => !compareAddress(c.erc721Address, erc721Address)))
  }

  function renderTab(collection: Collection) {
    return (
      <Tab key={collection.erc721Address} justifyContent="flex-start">
        <Image as={Avatar} src={collection.logoImageUrl || collection.logoImageHash} w="60px" h="60px" mr={2} />
        <Text textAlign="left">{collection.collectionName || 'Unnamed'}</Text>
      </Tab>
    )
  }

  function renderForm(collection: Collection) {
    return (
      <TabPanel key={collection.erc721Address}>
        <Grid templateColumns="auto 1fr">
          <GridItem p={2}>Description</GridItem>
          <GridItem p={2}>{collection.description}</GridItem>
          <GridItem p={2}>Royalty</GridItem>
          <GridItem p={2}>{collection.royalty}</GridItem>
          <GridItem p={2}>Fee Recipient</GridItem>
          <GridItem p={2}>
            <Address type="address" chainId={collection.chainId}>
              {collection.feeRecipient}
            </Address>
          </GridItem>
          <GridItem p={2}>Categories</GridItem>
          <GridItem p={2}>
            <SelectCategories value={toCategories(collection.categories)} disabled immutable />
          </GridItem>
          <GridItem p={2}>Chain</GridItem>
          <GridItem p={2}>
            {getChainName(collection.chainId)} ({collection.chainId || '-'})
          </GridItem>
          <GridItem p={2}>Contract Address</GridItem>
          <GridItem p={2}>
            <Address type="address" chainId={collection.chainId}>
              {collection.erc721Address}
            </Address>
          </GridItem>
          <GridItem p={2}>Website</GridItem>
          <GridItem p={2}>
            <Link href={collection.siteUrl} disabled={!collection.siteUrl}>
              {collection.siteUrl || '-'}
            </Link>
          </GridItem>
          <GridItem p={2}>Discord</GridItem>
          <GridItem p={2}>{collection.discord || '-'}</GridItem>
          <GridItem p={2}>Twitter</GridItem>
          <GridItem p={2}>{collection.twitterHandle || '-'}</GridItem>
          <GridItem p={2}>Instagram</GridItem>
          <GridItem p={2}>{collection.instagramHandle || '-'}</GridItem>
          <GridItem p={2}>Medium</GridItem>
          <GridItem p={2}>{collection.mediumHandle || '-'}</GridItem>
          <GridItem p={2}>Telegram</GridItem>
          <GridItem p={2}>{collection.telegram || '-'}</GridItem>
        </Grid>
        <Divider my={8} />
        <Form collection={collection} authToken={authToken} onReviewed={onReviewed} />
      </TabPanel>
    )
  }

  return (
    <Layout>
      <Tabs variant="line" orientation="vertical" isManual isLazy index={index} onChange={setIndex} h="100%">
        <TabList>
          <VisuallyHidden>
            <Tab />
          </VisuallyHidden>
          {collections.map(renderTab)}
        </TabList>
        <TabPanels>
          <TabPanel h="100%">
            <Center h="100%">{isLoading ? <Spinner /> : 'Select collection from left'}</Center>
          </TabPanel>
          {collections.map(renderForm)}
        </TabPanels>
      </Tabs>
    </Layout>
  )
}

interface FormProps {
  collection: Collection
  authToken: string | null
  onReviewed: (collection: Collection) => void
}

interface FormData {
  approved: boolean
  reason: string
}

function Form({ collection, authToken, onReviewed }: FormProps) {
  const toast = useToast({ title: 'Review Collection' })

  const [review] = useReviewCollectionMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isValid, isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({ mode: 'onChange' })

  useEffect(() => {
    if (isSubmitSuccessful) onReviewed(collection)
  }, [isSubmitSuccessful, onReviewed, collection])

  const onSubmit = handleSubmit(async ({ approved, reason }) => {
    if (!authToken) return

    try {
      const contractAddress = collection.erc721Address

      if (!contractAddress) throw new Error('invalid address')

      if (approved) {
        await review({ accept: true, authToken, contract: contractAddress, chainId: collection.chainId })
      } else {
        await review({ accept: false, reason, authToken, contract: contractAddress, chainId: collection.chainId })
      }

      toast({ status: 'success', description: 'Collection reviewd' })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  return (
    <chakra.form onSubmit={onSubmit}>
      <Stack>
        <FormControl isInvalid={!!errors.approved}>
          <Checkbox
            {...register('approved')}
            isChecked={watch('approved')}
            onChange={e =>
              setValue('approved', e.target.checked, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
            }
          >
            Approve
          </Checkbox>
        </FormControl>
        <FormControl isInvalid={!!errors.reason}>
          <Textarea {...register('reason')} disabled={watch('approved')} />
        </FormControl>
        <Button
          type="submit"
          variant="outline"
          isLoading={isSubmitting}
          disabled={!isDirty || !isValid || isSubmitting || isSubmitSuccessful}
        >
          {isSubmitSuccessful ? 'Submitted' : 'Submit'}
        </Button>
      </Stack>
    </chakra.form>
  )
}
