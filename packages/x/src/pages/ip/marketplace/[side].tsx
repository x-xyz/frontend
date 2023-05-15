import Address from 'components/Address'
import EmailIcon from 'components/icons/EmailIcon'
import TwitterIcon from 'components/icons/TwitterIcon'
import SelectCollection from 'components/input/SelectCollection'
import Layout from 'components/ip/marketplace/Layout'
import Link from 'components/Link'
import Media from 'components/Media'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiTrash } from 'react-icons/fi'
import { useQuery } from 'react-query'

import { ChevronDownIcon, TriangleDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  Checkbox,
  CloseButton,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Radio,
  RadioGroup,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  Textarea,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { fetchCollectionV2, fetchNonce, fetchTokenV2 } from '@x/apis/fn'
import { ChainId, goapiUrl } from '@x/constants'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { NftItem, ResponseOf } from '@x/models'
import { compareAddress, makeQueryParams, signMessage } from '@x/utils'
import { handleError, makeSignatureMessage } from '@x/web3'
import SelectNft from 'components/input/SelectNft'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import ClickToEnlarge from 'components/ClickToEnlarge'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

const breakpoint = 'md'

const validCollections: { chainId: ChainId; contract: string }[] = [
  { chainId: ChainId.Ethereum, contract: '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623' },
  { chainId: ChainId.Ethereum, contract: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb' },
  { chainId: ChainId.Ethereum, contract: '0x60e4d786628fea6478f785a6d7e704777c86a7c6' },
  { chainId: ChainId.Ethereum, contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d' },
  { chainId: ChainId.Ethereum, contract: '0xed5af388653567af2f388e6224dc7c4b3241c544' },
  { chainId: ChainId.Ethereum, contract: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7' },
  { chainId: ChainId.Ethereum, contract: '0x2a459947f0ac25ec28c197f09c2d88058a83f3bb' },
  { chainId: ChainId.Ethereum, contract: '0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949' },
  { chainId: ChainId.Ethereum, contract: '0x26badf693f2b103b021c670c852262b379bbbe8a' },
  { chainId: ChainId.Ethereum, contract: '0x5a0121a0a21232ec0d024dab9017314509026480' },
  { chainId: ChainId.Ethereum, contract: '0xe785e82358879f061bc3dcac6f0444462d4b5330' },
  { chainId: ChainId.Ethereum, contract: '0xf61f24c2d93bf2de187546b14425bf631f28d6dc' },
  { chainId: ChainId.Ethereum, contract: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b' },
  { chainId: ChainId.Ethereum, contract: '0x95784f7b5c8849b0104eaf5d13d6341d8cc40750' },
]

export const getServerSideProps = createServerSidePropsGetter(null, { requrieAuth: false })

export default function IpMarketplaceSell() {
  const { query } = useRouter()
  const side = `${query.side}` || 'sell'
  const [showForm, setShowForm] = useState(true)
  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })
  const templateColumns = useMobileLayout ? '1fr' : `${showForm ? '380px' : '140px'} 1fr`
  const [selectedCollection, setSelectedCollection] = useState<{ chainId: ChainId; contractAddress: string }>()
  const { data, isLoading, refetch } = useQuery<ResponseOf<IpListing[]>>(
    `/ip/listings?${makeQueryParams({
      isIpOwner: side === 'buy',
      chainId: selectedCollection?.chainId,
      contractAddress: selectedCollection?.contractAddress,
    })}`,
  )
  const { account } = useActiveWeb3React()

  useEffect(() => {
    if (side === 'sell') setSelectedCollection(void 0)
  }, [side])

  const formDisclosure = useDisclosure()

  useEffect(() => {
    if (useMobileLayout) setShowForm(true)
  }, [useMobileLayout])

  function renderLeft() {
    if (!showForm)
      return (
        <Button variant="unstyled" onClick={() => setShowForm(true)} m={5}>
          <TriangleDownIcon transform="rotate(90deg)" mr={4} pos="relative" top="-1px" />
          Create
        </Button>
      )

    if (!account)
      return (
        <Stack direction="row" align="center" p={5}>
          <Image src="/assets/ico-wallet.png" w={8} />
          <ConnectWalletButton>
            <Text color="primary" fontWeight="bold">
              Connect Wallet to list
            </Text>
          </ConnectWalletButton>
        </Stack>
      )

    return <Form onSubmitSuccessful={refetch} />
  }

  return (
    <Layout
      templateColumns={templateColumns}
      appendNav={
        !useMobileLayout && side === 'buy' ? (
          <Box pb={3} flexGrow={1}>
            <SelectCollection
              optionWhitelist={validCollections}
              value={selectedCollection}
              onChange={setSelectedCollection}
              addOptions={[
                {
                  label: 'CryptoPunks',
                  value: { chainId: ChainId.Ethereum, contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb' },
                },
              ]}
            />
          </Box>
        ) : (
          void 0
        )
      }
    >
      {useMobileLayout && (
        <Box pb={3}>
          <SelectCollection
            optionWhitelist={validCollections}
            value={selectedCollection}
            onChange={setSelectedCollection}
            addOptions={[
              {
                label: 'CryptoPunks',
                value: { chainId: ChainId.Ethereum, contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb' },
              },
            ]}
          />
        </Box>
      )}
      <Grid w="full" h="full" templateColumns={templateColumns} columnGap={5}>
        {!useMobileLayout && (
          <GridItem p={0} borderRight="1px solid" borderColor="divider">
            {showForm && (
              <Stack p={5}>
                <Heading as="h4" fontSize="md">
                  Create IP Listing
                </Heading>
                <CloseButton onClick={() => setShowForm(false)} pos="absolute" top={0} right={0} />
                <Text>
                  This is a platform for IP discovery: License the IP of your NFT or find the right IP to license for
                  your project. Select one of the below options to post your listing or browse our existing listings to
                  the right.
                </Text>
              </Stack>
            )}
            {renderLeft()}
          </GridItem>
        )}
        <GridItem p={useMobileLayout ? 0 : 5} pr={0}>
          <Stack divider={<Divider />} spacing={5}>
            {!isLoading && data ? (
              data.data?.map(item =>
                item.tokenIds?.length > 0 ? (
                  <IpListingItem key={item.id} ipListing={item} onDeleteSuccessful={refetch} />
                ) : (
                  <IpListingItemWithoutThumbnail key={item.id} ipListing={item} onDeleteSuccessful={refetch} />
                ),
              )
            ) : (
              <>
                <IpListingItem />
                <IpListingItem />
                <IpListingItem />
              </>
            )}
          </Stack>
        </GridItem>
      </Grid>
      {useMobileLayout && (
        <Button
          variant="outline"
          bg="#000"
          color="primary"
          fontWeight="extrabold"
          fontSize="2xl"
          w="270px"
          h="50px"
          pos="fixed"
          bottom={10}
          left="50%"
          transform="translateX(-50%)"
          onClick={formDisclosure.onOpen}
          display={formDisclosure.isOpen ? 'none' : 'block'}
        >
          Create Listing
        </Button>
      )}
      {useMobileLayout && (
        <Modal size="2lg" onClose={formDisclosure.onClose} isOpen={formDisclosure.isOpen}>
          <ModalContent mt={0} h="100%">
            <ModalCloseButton color="#fff" />
            <ModalBody>
              <Stack p={5}>
                <Heading as="h4" fontSize="md">
                  Create IP Listing
                </Heading>
                <Text>
                  This is a platform for IP discovery: License the IP of your NFT or find the right IP to license for
                  your project. Select one of the below options to post your listing or browse our existing listings to
                  the right.
                </Text>
              </Stack>
              {renderLeft()}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  )
}

interface IpListing {
  id: string
  username: string
  twitter: string
  contactEmail: string
  chainId: ChainId
  contractAddress: string
  tokenIds: string[]
  title: string
  listingDetail: string
  licensingPeriod: string
  licensingFee: string
  exclusivity: string
  isIpOwner: boolean
  owner: string
  createdAt: string
}

interface IpListingItemProps {
  ipListing?: IpListing
  onDeleteSuccessful?: () => void
}

function IpListingItem({ ipListing, onDeleteSuccessful }: IpListingItemProps) {
  const [isOpened, setOpened] = useState(false)
  const { data, isLoading } = useQuery(
    ['collection', ipListing?.chainId || ChainId.Ethereum, ipListing?.contractAddress || ''],
    fetchCollectionV2,
    { enabled: !!ipListing && !!ipListing.chainId && !!ipListing.contractAddress },
  )
  const { account } = useActiveWeb3React()
  const isOwner = compareAddress(account, ipListing?.owner)

  function renderThumbnail() {
    if (!ipListing) return <NftThumbnail />

    if (!ipListing.tokenIds?.length) return

    if (isOpened)
      return ipListing.tokenIds.map(tokenId => (
        <NftThumbnail
          key={tokenId}
          chainId={ipListing.chainId}
          contractAddress={ipListing.contractAddress}
          tokenId={tokenId}
        />
      ))

    return (
      <>
        <NftThumbnail
          key={ipListing.tokenIds[0]}
          chainId={ipListing.chainId}
          contractAddress={ipListing.contractAddress}
          tokenId={ipListing.tokenIds[0]}
        />
        {ipListing.tokenIds.length > 1 && (
          <Center w={10} h={10} border="1px solid" borderColor="divider" fontWeight="extrabold" color="#52d9f6">
            +{ipListing.tokenIds.length - 1}
          </Center>
        )}
      </>
    )
  }

  function renderCreatedAt() {
    return (
      <Text as="span" color="value">
        {ipListing?.createdAt &&
          DateTime.fromISO(ipListing?.createdAt).toLocaleString({ dateStyle: 'long', timeStyle: 'long' })}
      </Text>
    )
  }

  return (
    <Grid
      templateColumns="auto 1fr 230px"
      templateRows={isOpened ? 'repeat(5, auto)' : 'repeat(2, auto)'}
      rowGap={3}
      fontSize="sm"
    >
      <GridItem colStart={2} colSpan={2}>
        <SkeletonText noOfLines={1} isLoaded={!!ipListing && !isLoading}>
          {data?.collectionName}
        </SkeletonText>
      </GridItem>
      <GridItem>
        <IconButton
          variant="icon"
          icon={<ChevronDownIcon transform={`rotate(${isOpened ? 180 : 0}deg)`} />}
          aria-label="show more"
          onClick={() => setOpened(prev => !prev)}
          disabled={!ipListing}
        />
      </GridItem>
      <GridItem>
        <Stack direction="row">
          {renderThumbnail()}
          {!isOpened && (
            <SkeletonText isLoaded={!!ipListing}>
              {ipListing?.title}
              <br />
              {renderCreatedAt()}
            </SkeletonText>
          )}
        </Stack>
      </GridItem>
      <GridItem borderLeft="1px solid" borderLeftColor="divider" pl={5}>
        <SkeletonText isLoaded={!!ipListing}>
          <Address>{ipListing?.owner || ''}</Address>
          {ipListing?.username}
        </SkeletonText>
      </GridItem>
      {isOpened && (
        <>
          <GridItem colStart={2}>
            {ipListing?.title}
            <br />
            {renderCreatedAt()}
          </GridItem>
          <GridItem borderLeft="1px solid" borderLeftColor="divider" pl={5}>
            <Stack direction="row" spacing={5}>
              {ipListing?.twitter && (
                <Link href={ipListing.twitter}>
                  <Center w={10} h={10} borderRadius="20px" border="1px solid" borderColor="divider">
                    <Icon as={TwitterIcon} color="primary" w={6} h={6} />
                  </Center>
                </Link>
              )}
              {ipListing?.contactEmail && (
                <Link href={`mailto:${ipListing.contactEmail}`}>
                  <Center w={10} h={10} borderRadius="20px" border="1px solid" borderColor="divider" overflow="hidden">
                    <Icon as={EmailIcon} color="primary" w={10} h={10} />
                  </Center>
                </Link>
              )}
              {ipListing && isOwner && (
                <DeleteIpListingButton ipLising={ipListing} onDeleteSuccessful={onDeleteSuccessful} />
              )}
            </Stack>
          </GridItem>
          <GridItem colStart={2} colSpan={2}>
            {ipListing?.listingDetail}
          </GridItem>
          <GridItem colSpan={3} overflowX="auto">
            <Grid
              templateColumns={{ base: 'repeat(3, minmax(240px, 1fr))', [breakpoint]: 'repeat(3, 1fr)' }}
              templateRows="auto 1fr"
              border="1px solid #4c4c4c"
              bg="#262b2c"
              p={5}
              w={{ base: 'fit-content', [breakpoint]: 'auto' }}
            >
              <GridItem fontSize="xs" color="tableHeader">
                Licensing Period
              </GridItem>
              <GridItem fontSize="xs" color="tableHeader">
                Licensing Fee
              </GridItem>
              <GridItem fontSize="xs" color="tableHeader">
                Exclusivity
              </GridItem>
              <GridItem>{ipListing?.licensingPeriod || '-'}</GridItem>
              <GridItem>{ipListing?.licensingFee || '-'}</GridItem>
              <GridItem>{ipListing?.exclusivity || '-'}</GridItem>
            </Grid>
          </GridItem>
        </>
      )}
    </Grid>
  )
}

function IpListingItemWithoutThumbnail({ ipListing, onDeleteSuccessful }: IpListingItemProps) {
  const [isOpened, setOpened] = useState(false)
  const { account } = useActiveWeb3React()
  const isOwner = compareAddress(account, ipListing?.owner)

  function renderCreatedAt() {
    return (
      <Text as="span" color="value">
        {ipListing?.createdAt &&
          DateTime.fromISO(ipListing?.createdAt).toLocaleString({ dateStyle: 'long', timeStyle: 'long' })}
      </Text>
    )
  }

  return (
    <Grid
      templateColumns="auto 1fr 230px"
      templateRows={isOpened ? 'repeat(3, auto)' : 'auto'}
      rowGap={3}
      fontSize="sm"
    >
      <GridItem>
        <IconButton
          variant="icon"
          icon={<ChevronDownIcon transform={`rotate(${isOpened ? 180 : 0}deg)`} />}
          aria-label="show more"
          onClick={() => setOpened(prev => !prev)}
          disabled={!ipListing}
        />
      </GridItem>
      <GridItem>
        <SkeletonText noOfLines={1} isLoaded={!!ipListing}>
          {ipListing?.title}
          <br />
          {renderCreatedAt()}
        </SkeletonText>
      </GridItem>
      <GridItem borderLeft="1px solid" borderLeftColor="divider" pl={5}>
        <SkeletonText isLoaded={!!ipListing}>
          <Address>{ipListing?.owner || ''}</Address>
          {ipListing?.username}
        </SkeletonText>
      </GridItem>
      {isOpened && (
        <>
          <GridItem colStart={2}>{ipListing?.listingDetail}</GridItem>
          <GridItem borderLeft="1px solid" borderLeftColor="divider" pl={5}>
            <Stack direction="row" spacing={5}>
              {ipListing?.twitter && (
                <Link href={`https://twitter.com/${ipListing.twitter}`}>
                  <Center w={10} h={10} borderRadius="20px" border="1px solid" borderColor="divider">
                    <Icon as={TwitterIcon} color="primary" w={6} h={6} />
                  </Center>
                </Link>
              )}
              {ipListing?.contactEmail && (
                <Link href={`mailto:${ipListing.contactEmail}`}>
                  <Center w={10} h={10} borderRadius="20px" border="1px solid" borderColor="divider" overflow="hidden">
                    <Icon as={EmailIcon} color="primary" w={10} h={10} />
                  </Center>
                </Link>
              )}
              {ipListing && isOwner && (
                <DeleteIpListingButton ipLising={ipListing} onDeleteSuccessful={onDeleteSuccessful} />
              )}
            </Stack>
          </GridItem>
          <GridItem colSpan={3}>
            <Grid
              templateColumns="repeat(3, 1fr)"
              templateRows="auto 1fr"
              border="1px solid #4c4c4c"
              bg="#262b2c"
              p={5}
            >
              <GridItem fontSize="xs" color="tableHeader">
                Licensing Period
              </GridItem>
              <GridItem fontSize="xs" color="tableHeader">
                Licensing Fee
              </GridItem>
              <GridItem fontSize="xs" color="tableHeader">
                Exclusivity
              </GridItem>
              <GridItem>{ipListing?.licensingPeriod || '-'}</GridItem>
              <GridItem>{ipListing?.licensingFee || '-'}</GridItem>
              <GridItem>{ipListing?.exclusivity || '-'}</GridItem>
            </Grid>
          </GridItem>
        </>
      )}
    </Grid>
  )
}

interface NftThumbnailProps {
  chainId?: ChainId
  contractAddress?: string
  tokenId?: string
}

function NftThumbnail({ chainId, contractAddress, tokenId }: NftThumbnailProps) {
  const enabled = !!chainId && !!contractAddress && !!tokenId
  const { data, isLoading } = useQuery(
    ['tokken', chainId || ChainId.Ethereum, contractAddress || '', tokenId || ''],
    fetchTokenV2,
    { enabled },
  )

  return (
    <Skeleton isLoaded={enabled && !isLoading} w={10} h={10} overflow="hidden">
      <ClickToEnlarge>
        <Media
          mimetype={data?.animationUrlMimeType}
          contentType={data?.animationUrlContentType || data?.contentType}
          src={data?.animationUrl || data?.imageUrl}
          isLoading={isLoading}
          maxW="600px"
          maxH="600px"
        />
      </ClickToEnlarge>
    </Skeleton>
  )
}

interface DeleteIpListingButtonProps {
  ipLising: IpListing
  onDeleteSuccessful?: () => void
}

function DeleteIpListingButton({ ipLising, onDeleteSuccessful }: DeleteIpListingButtonProps) {
  const { account, library } = useActiveWeb3React()
  const [authToken] = useAuthToken()
  const toast = useToast({ title: 'Delete Ip Listing' })
  const [isLoading, setLoading] = useState(false)
  async function onClick() {
    setLoading(true)

    try {
      if (!account) throw new Error('cannot get account')
      if (!library) throw new Error('cannot get library')
      if (!authToken) throw new Error('cannot get authToken')
      const nonce = await fetchNonce(authToken)
      const message = makeSignatureMessage(nonce)
      const signature = await signMessage(library.getSigner(), account, message)
      await fetch(`${goapiUrl}/ip/listing/${ipLising.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ signature }),
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
      onDeleteSuccessful?.()
    } catch (error) {
      handleError(error, { toast })
    } finally {
      setLoading(false)
    }
  }
  return (
    <IconButton
      variant="unstyled"
      w={10}
      h={10}
      borderRadius="20px"
      border="1px solid"
      borderColor="divider"
      display="flex"
      alignItems="center"
      justifyContent="center"
      icon={<FiTrash color="#e55f40" transform="scale(1.4)" />}
      aria-label="delete ip listing"
      onClick={onClick}
      isLoading={isLoading}
    />
  )
}

interface FormProps {
  onSubmitSuccessful: () => void
}

interface FormData {
  id: string
  username: string
  twitter: string
  contactEmail: string
  chainId: ChainId
  contractAddress: string
  tokenIds: string[]
  title: string
  listingDetail: string
  licensingPeriod: string
  licensingFee: string
  exclusivity: string
  isIpOwner: boolean
  owner: string
  createdAt: string
}

function Form({ onSubmitSuccessful }: FormProps) {
  const { account, library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const toast = useToast({ title: 'IP Listing' })

  const [side, setSide] = useState('sell')

  const [termsAccepted, setTermsAccepted] = useState(false)

  const [selectedNfts, setSelectedNfts] = useState<readonly NftItem[]>([])

  const { register, setValue, getValues, watch, formState, handleSubmit, reset } = useForm<FormData>({
    mode: 'onChange',
  })

  const { isValid, isDirty, isSubmitting, errors } = formState

  useEffect(() => {
    setValue(
      'tokenIds',
      selectedNfts.map(v => v.tokenId),
    )
  }, [selectedNfts, setValue])

  const onSubmit = handleSubmit(async data => {
    try {
      if (!account) throw new Error('cannot get account')
      if (!library) throw new Error('cannot get library')
      if (!authToken) throw new Error('cannot get authToken')

      const nonce = await fetchNonce(authToken)
      const message = makeSignatureMessage(nonce)
      const signature = await signMessage(library.getSigner(), account, message)

      data.owner = account
      data.isIpOwner = side === 'sell'

      await fetch(`${goapiUrl}/ip/listings`, {
        method: 'POST',
        body: JSON.stringify({ ...data, signature }),
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      reset({}, { keepIsSubmitted: false })

      onSubmitSuccessful()
    } catch (error) {
      handleError(error, { toast })
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack pos="relative" p={5} spacing={5}>
        <RadioGroup as={VStack} alignItems="flex-start" value={side} onChange={setSide}>
          <Radio value="sell">License my IP</Radio>
          <Radio value="buy">Find IP to License</Radio>
        </RadioGroup>
        <Divider />
        {account ? <Address>{account}</Address> : '-'}
        <Divider />
        <FormControl>
          <FormLabel>User Name</FormLabel>
          <Input {...register('username')} />
        </FormControl>
        <Stack border="1px solid" borderColor="divider" p={5} spacing={5}>
          <FormControl isRequired={!watch('contactEmail')}>
            <FormLabel>Twitter</FormLabel>
            <Input {...register('twitter', { required: !watch('contactEmail') })} />
          </FormControl>
          <Text
            textAlign="center"
            color="value"
            fontSize="xs"
            pos="relative"
            _before={{
              content: '""',
              display: 'block',
              bg: 'divider',
              h: '1px',
              w: '45%',
              pos: 'absolute',
              left: 0,
              bottom: '50%',
            }}
            _after={{
              content: '""',
              display: 'block',
              bg: 'divider',
              h: '1px',
              w: '45%',
              pos: 'absolute',
              right: 0,
              bottom: '50%',
            }}
          >
            OR
          </Text>
          <FormControl isRequired={!watch('twitter')} isInvalid={!!errors.contactEmail}>
            <FormLabel>Contact Email</FormLabel>
            <Input
              {...register('contactEmail', {
                required: !watch('twitter'),
                pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
              })}
            />
          </FormControl>
          <Text color="value" fontSize="xs">
            Fill in at least one communication channel, Twitter or Email.
          </Text>
        </Stack>
        {side === 'sell' && (
          <>
            <FormControl isRequired isInvalid={!getValues('chainId') || !getValues('contractAddress')}>
              <FormLabel>Collection</FormLabel>
              <SelectCollection
                optionWhitelist={validCollections}
                value={{ chainId: getValues('chainId'), contractAddress: getValues('contractAddress') }}
                onChange={c => {
                  setValue('chainId', c?.chainId || ChainId.Ethereum)
                  setValue('contractAddress', c?.contractAddress || '')
                }}
                hideOptionAll
                onlyErc721
                addOptions={[
                  {
                    label: 'CryptoPunks',
                    value: { chainId: ChainId.Ethereum, contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb' },
                  },
                ]}
              />
            </FormControl>
            <FormControl isRequired isInvalid={!getValues('tokenIds')?.length}>
              <FormLabel>NFT(s)</FormLabel>
              <SelectNft
                chainId={getValues('chainId')}
                collections={getValues('contractAddress') ? [getValues('contractAddress')] : void 0}
                belongsTo={account ?? void 0}
                value={selectedNfts}
                onValueChange={setSelectedNfts}
                disabled={!watch('contractAddress')}
              />
            </FormControl>
          </>
        )}
        <FormControl isRequired isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title', { required: true })} placeholder="Briefly describe the IP you want to license" />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.listingDetail}>
          <FormLabel>Listing Detail</FormLabel>
          <Textarea
            {...register('listingDetail', { required: true })}
            placeholder="Describe what IP you are offering and what you’re looking to achieve"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Licensing Period</FormLabel>
          <Input {...register('licensingPeriod')} placeholder="How long do you want the license your IP?" />
        </FormControl>
        <FormControl>
          <FormLabel>Licensing Fee</FormLabel>
          <Input {...register('licensingFee')} placeholder="Describe your commercial terms" />
        </FormControl>
        <FormControl>
          <FormLabel>Exclusivity</FormLabel>
          <Input {...register('exclusivity')} placeholder="Are you willing to offer exclusive use of your IP?" />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.contactEmail}>
          <Checkbox isChecked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}>
            Exercise due diligence. Do your own research before engaging in any direct interactions. This is a directory
            for NFT IPs, there are no transactions to be processed.
          </Checkbox>
        </FormControl>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={
            !termsAccepted || !isDirty || !isValid || isSubmitting || (side === 'sell' && selectedNfts.length === 0)
          }
        >
          POST
        </Button>
      </Stack>
    </form>
  )
}
