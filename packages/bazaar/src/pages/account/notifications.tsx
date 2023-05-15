import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@chakra-ui/button'
import { Checkbox } from '@chakra-ui/checkbox'
import { FormControl, FormHelperText } from '@chakra-ui/form-control'
import { Flex, Heading, Stack, Text } from '@chakra-ui/layout'
import { chakra } from '@chakra-ui/system'
import { verifyMessage } from '@ethersproject/wallet'
import Layout from 'components/Layout'
import Section from 'components/Section'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { useToast } from '@x/hooks'
import { NotificationSettings } from '@x/models'
// import {
//   // useNonceMutation,
//   // useLazyNotificationSettingsQuery,
//   // useUpdateNotificationSettingsMutation,
// } from '@x/apis'
import { useNonceMutation, useLazyNotificationSettingsQuery, useUpdateNotificationSettingsMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

export const getServerSideProps = createServerSidePropsGetter(void 0, { requrieAuth: true })

interface UISetting {
  value: keyof Omit<NotificationSettings, 'address'>
  title: string
  description: string
}

const selfSettings: UISetting[] = [
  {
    value: 'sBundleBuy',
    title: 'Bundle Purchased',
    description: 'You have purchased a bundle.',
  },
  {
    value: 'sBundleSell',
    title: 'Bundle Sold',
    description: 'Your bundle is sold.',
  },
  {
    value: 'sBundleOffer',
    title: 'Get a new offer for your bundle',
    description: 'You get an offer for your bundle.',
  },
  {
    value: 'sBundleOfferCancel',
    title: 'An offer to you bundle called off',
    description: 'An offer to your bundle is canceled.',
  },
  {
    value: 'sNftAuctionPrice',
    title: "Your bid's Auction Price update",
    description: 'The bid price to your auction is updated.',
  },
  {
    value: 'sNftBidToAuction',
    title: 'A bid to your NFT auction',
    description: 'You get a bid to your auction.',
  },
  {
    value: 'sNftBidToAuctionCancel',
    title: 'A bid to your NFT called off',
    description: 'A bid to your auction is canceled.',
  },
  {
    value: 'sAuctionWin',
    title: 'You won the auction',
    description: 'You purchased an nft in auction.',
  },
  {
    value: 'sAuctionOfBidCancel',
    title: "Your bid's auction called off",
    description: 'An auction you made a bid is canceled.',
  },
  {
    value: 'sNftSell',
    title: 'NFT Sold',
    description: 'Your nft item is sold.',
  },
  {
    value: 'sNftBuy',
    title: 'NFT Purchased',
    description: 'You purchased a new nft item.',
  },
  {
    value: 'sNftOffer',
    title: 'Get a new offer for your NFT',
    description: 'You get an offer to your nft item.',
  },
  {
    value: 'sNftOfferCancel',
    title: 'An offer to your NFT called off',
    description: 'An offer to your nft item is canceled.',
  },
]

const followerSettings: UISetting[] = [
  {
    value: 'fBundleCreation',
    title: 'New bundle creation by follower',
    description: 'Created a new bundle.',
  },
  {
    value: 'fBundleList',
    title: 'Bundle Listing by follower',
    description: 'Listed a bundle for sale.',
  },
  {
    value: 'fBundlePrice',
    title: 'Bundle Price Update by follower',
    description: 'Updated the bundle sale price.',
  },
  {
    value: 'fNftAuctionPrice',
    title: 'NFT Auction Price update by follower',
    description: 'Updated auction price.',
  },
  {
    value: 'fNftList',
    title: 'NFT Listing by follower',
    description: 'Listed an nft item for sale.',
  },
  {
    value: 'fNftAuction',
    title: 'New NFT Auction',
    description: 'Started a new auction.',
  },
  {
    value: 'fNftPrice',
    title: 'NFT Price Update by follower',
    description: 'Updated nft item price on sale.',
  },
]

export default function Notifications() {
  const toast = useToast({ title: 'Notifications' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [fetchNonce, { isLoading: isLoadingNonce }] = useNonceMutation()

  const [fetch, { data, isLoading: isLoadingData }] = useLazyNotificationSettingsQuery()

  const [update] = useUpdateNotificationSettingsMutation()

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isSubmitting },
    control,
  } = useForm<Omit<NotificationSettings, 'address'>>({ mode: 'onChange' })

  const onSubmit = handleSubmit(async settings => {
    try {
      if (!account || !library) throw new Error('cannot get account')

      if (!authToken) throw new Error('cannot get auth token')

      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status !== 'success') throw new Error('cannot get nonce')

      const message = makeSignatureMessage(nonceResp.data.data)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const resp = await update({ authToken, address: account, ...settings, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status === 'fail') throw new Error('Update notification settings failed')

      toast({ status: 'success', description: 'Notification settings updated' })

      reset(settings)
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  })

  useEffect(() => {
    if (data?.status === 'success') reset(data.data)
  }, [data, reset])

  useEffect(() => {
    if (authToken) fetch({ authToken })
  }, [authToken, fetch])

  const isLoading = isLoadingAuthToken || isLoadingNonce || isLoadingData || isSubmitting

  const disabled = isLoading || !isDirty

  const values = useWatch({ control })

  useEffect(() => {
    if (!values.sNotification) selfSettings.forEach(setting => setValue(setting.value, false))
  }, [values.sNotification, setValue])

  useEffect(() => {
    if (!values.fNotification) followerSettings.forEach(setting => setValue(setting.value, false))
  }, [values.fNotification, setValue])

  function renderUISetting({ value, title, description }: UISetting, disabled?: boolean) {
    return (
      <FormControl key={value} borderColor="white" _notLast={{ borderBottomWidth: '1px' }} p={4}>
        <Checkbox
          isChecked={values[value]}
          onChange={e => !disabled && setValue(value, e.target.checked, { shouldDirty: true, shouldTouch: true })}
          disabled={disabled}
        >
          {title}
        </Checkbox>
        <FormHelperText pl={6}>{description}</FormHelperText>
      </FormControl>
    )
  }

  return (
    <Layout>
      <Section maxW="container.md" mx="auto">
        <Heading mx={4} mb={8}>
          Notification Settings
        </Heading>
        <chakra.form onSubmit={onSubmit}>
          <Flex wrap="wrap">
            <Stack m={4} flexGrow={1} spacing={6} minW={72}>
              <FormControl px={4}>
                <Checkbox
                  isChecked={values.sNotification}
                  onChange={e => setValue('sNotification', e.target.checked, { shouldDirty: true, shouldTouch: true })}
                  disabled={isLoading}
                >
                  <Text fontSize="xl">Your Activity Notifications</Text>
                </Checkbox>
              </FormControl>
              <Stack borderColor="white" borderWidth="1px" borderRadius="10px">
                {selfSettings.map(setting => renderUISetting(setting, isLoading || !values.sNotification))}
              </Stack>
            </Stack>
            <Stack m={4} flexGrow={1} spacing={6} minW={72}>
              <FormControl px={4}>
                <Checkbox
                  isChecked={values.fNotification}
                  onChange={e => setValue('fNotification', e.target.checked, { shouldDirty: true, shouldTouch: true })}
                  disabled={isLoading}
                >
                  <Text fontSize="xl">Follower Activity Notifications</Text>
                </Checkbox>
              </FormControl>
              <Stack borderColor="white" borderWidth="1px" borderRadius="10px">
                {followerSettings.map(setting => renderUISetting(setting, isLoading || !values.fNotification))}
              </Stack>
            </Stack>
          </Flex>

          <Button variant="outline" type="submit" isLoading={isLoading} disabled={disabled} m={4}>
            Save
          </Button>
        </chakra.form>
      </Section>
    </Layout>
  )
}
