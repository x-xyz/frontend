import AccountLayout from 'components/account/v3/AccountLayout'
import FolderCard from 'components/account/v3/FolderCard'
import Link from 'components/Link'
import { isFeatureEnabled } from 'flags'
import { throttle } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import ResizeObserver from 'resize-observer-polyfill'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  SkeletonText,
  Spacer,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { fetchAccount, fetchAccountFolders, fetchCollectionSummary } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account } from '@x/models'
import { call, compareAddress, getFirst, isAddress, isErrorResponse } from '@x/utils'
import StackIcon from 'components/icons/StackIcon'
import Price from 'components/v3/Price'
import StatValue from 'components/v3/StatValue'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const resp = await call(() => fetchAccount(address), { maxAttempt: 5, timeout: i => i * 300 })
    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
    return { props: { account: resp.data } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountPortfolio({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: currentAccount } = useActiveWeb3React()
  const { data: folders = [] } = useQuery(['accountFolders', account.address, { authToken }], fetchAccountFolders)
  const { data: collectionSummary } = useQuery(['account-collection-summary', account.address], fetchCollectionSummary)
  const builtInPublic = useMemo(() => folders.find(folder => folder.isBuiltIn && !folder.isPrivate), [folders])
  const buildInPrivate = useMemo(() => folders.find(folder => folder.isBuiltIn && folder.isPrivate), [folders])
  const customFolders = useMemo(() => folders.filter(folder => !folder.isBuiltIn), [folders])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerRect, setContainerRect] = useState<DOMRect>()
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const resize = throttle(() => setContainerRect(container.getBoundingClientRect()))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => {
      resize.cancel()
      observer.disconnect()
    }
  }, [])
  const columnCount = useBreakpointValue({ base: 3, '2xl': 5 }) || 3
  const containerPaddingX = useMemo(() => {
    const v = ((containerRect?.width || 0) - columnCount * 400) / 2
    if (v < 0) return ((containerRect?.width || 0) - 3 * 400) / 2
    return v
  }, [containerRect, columnCount])
  return (
    <AccountLayout account={account} pageTitle="NFT Folders">
      <Container
        ref={containerRef}
        px={`${containerPaddingX}px`}
        maxW={{ base: 'container.xl', '2xl': 'container.3xl' }}
      >
        <Flex wrap="wrap" sx={{ '&>*': { m: 5 } }}>
          <CollectionFolder
            owner={account.address}
            nftCount={collectionSummary?.nftCount}
            collectionValue={collectionSummary?.totalCollectionValue}
          />
          {builtInPublic && (
            <FolderCard
              owner={account.address}
              folder={builtInPublic}
              folderTitle="Public NFTs"
              folderSubtitle="View all individual NFTs"
            />
          )}
          {buildInPrivate && (
            <FolderCard
              owner={account.address}
              folder={buildInPrivate}
              folderTitle="Private NFTs"
              folderSubtitle="Select & manage which NFTs to make private"
              isOwner={compareAddress(account.address, currentAccount)}
            />
          )}
          {compareAddress(account.address, currentAccount) && (
            <Link href={`/account/${account.address}/create-folder`}>
              <Center w="360px" h="500px" borderWidth="1px" borderColor="divider" boxSizing="border-box">
                <Button>Create Custom Folder</Button>
              </Center>
            </Link>
          )}
          {customFolders.map(folder => (
            <FolderCard
              owner={account.address}
              key={folder.id}
              folder={folder}
              isOwner={compareAddress(account.address, currentAccount)}
            />
          ))}
        </Flex>
      </Container>
    </AccountLayout>
  )
}

function CollectionFolder({
  owner,
  nftCount = 0,
  collectionValue = 0,
}: {
  owner: string
  nftCount?: number
  collectionValue?: number
}) {
  return (
    <Link href={`/account/${owner}/portfolio/collections`}>
      <Box w="360px" h="500px" borderWidth="1px" borderColor="divider" boxSizing="border-box">
        <Center
          w="full"
          h="360px"
          borderBottomWidth="1px"
          borderBottomColor="divider"
          flexDirection="column"
          overflow="hidden"
        >
          <Text fontSize="5xl" fontWeight="extrabold" color="primary">
            Collections
          </Text>
          <Text fontWeight="bold" color="primary">
            View NFTs organised by collection.
          </Text>
        </Center>
        <Stack p={5} spacing={5}>
          <Stack direction="row" align="center" spacing={1}>
            <Badge variant="tag" bg="success">
              PUBLIC
            </Badge>
            <Spacer />
            <Text color="divider" lineHeight={0.8}>
              {nftCount}
            </Text>
            <StackIcon color="divider" w={4} h={4} />
          </Stack>
          <Stack direction="row" align="flex-start">
            <Price label="Total Collection Value" price={collectionValue} unit="USD" />
            <Spacer />
            <Link color="primary" href={`/account/${owner}//portfolio/collections`}>
              View
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Link>
  )
}
