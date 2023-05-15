import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { Avatar } from '@chakra-ui/avatar'
import { Button, IconButton } from '@chakra-ui/button'
import { useClipboard, useDisclosure } from '@chakra-ui/hooks'
import { CopyIcon } from '@chakra-ui/icons'
import { Stack, StackProps, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/react'
import { SkeletonCircle } from '@chakra-ui/skeleton'
import { Tab, TabList, Tabs } from '@chakra-ui/tabs'
import Address from 'components/Address'
import { useActiveWeb3React } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useLazyAccountQuery, useAccountStatQuery } from '@x/apis'
import { compareAddress } from '@x/utils'
import AccountBanner from './AccountBanner'
import EditProfileButton from './EditProfileButton'
import FollowButton from './FollowButton'
import FollowingListModal from './FollowingListModal'
import FollowerListModal from './FollowerListModal'
import Image from 'components/Image'

export interface AccountLayoutProps extends StackProps {
  address: string
}

export default function AccountLayout({ children, address, ...props }: AccountLayoutProps) {
  const { pathname } = useRouter()

  const { account, chainId } = useActiveWeb3React()

  const toast = useToast({ title: 'Account' })

  const [fetchAccountDetail, { data: accountDetail, isLoading: isLoadingAccountDetail }] = useLazyAccountQuery()

  useEffect(() => {
    fetchAccountDetail({ address })
  }, [fetchAccountDetail, address])

  const { data: stat, isLoading: isLoadingUserFigures } = useAccountStatQuery({ address })

  const { onCopy: onCopyAddress, hasCopied: hasCopiedAddress } = useClipboard(address)

  const isMe = compareAddress(account, address)

  const followerListModal = useDisclosure()

  const followingListModal = useDisclosure()

  const tabOptions = [
    {
      label: (
        <Stack direction="row" alignItems="center" spacing={4}>
          <Text>Collected</Text>
          <SkeletonText fontSize="md" noOfLines={1} minW={8} isLoaded={!isLoadingUserFigures}>
            {stat?.data?.single}
          </SkeletonText>
        </Stack>
      ),
      path: `/account/${address}`,
      pathname: '/account/[address]',
    },
    {
      label: (
        <Stack direction="row" alignItems="center" spacing={4}>
          <Text>Favorites</Text>
          <SkeletonText fontSize="md" noOfLines={1} minW={8} isLoaded={!isLoadingUserFigures}>
            {stat?.data?.favorite}
          </SkeletonText>
        </Stack>
      ),
      path: `/account/${address}/favorites`,
      pathname: '/account/[address]/favorites',
    },
    { label: 'Activity', path: `/account/${address}/activities`, pathname: '/account/[address]/activities' },
    {
      label: 'Pending Offers',
      path: `/account/${address}/pending-offers`,
      pathname: '/account/[address]/pending-offers',
    },
    { label: 'Placed Offers', path: `/account/${address}/placed-offers`, pathname: '/account/[address]/placed-offers' },
  ]

  const activeTabIndex = tabOptions.findIndex(tab => tab.pathname === pathname)

  const tabListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tabListRef.current) return

      const list = tabListRef.current

      const activeTab = tabListRef.current.children[activeTabIndex]

      const offset = list.scrollLeft + activeTab.getBoundingClientRect().x

      list.scrollTo({ left: offset, behavior: 'smooth' })
    }, 100)

    return () => clearTimeout(timer)
  }, [activeTabIndex])

  useEffect(() => {
    if (hasCopiedAddress) toast({ status: 'success', description: 'Address copied' })
  }, [hasCopiedAddress, toast])

  function renderAvatar() {
    return (
      <SkeletonCircle width={24} height={24} isLoaded={!isLoadingAccountDetail}>
        <Image as={Avatar} src={accountDetail?.data?.imageUrl || accountDetail?.data?.imageHash} />
      </SkeletonCircle>
    )
  }

  function renderAlias() {
    return (
      <SkeletonText noOfLines={1} isLoaded={!isLoadingAccountDetail}>
        <Text fontSize="5xl" fontWeight="bold" color="primary">
          {accountDetail?.data?.alias || 'Noname'}
        </Text>
      </SkeletonText>
    )
  }

  function renderBio() {
    return (
      <SkeletonText noOfLines={1} isLoaded={!isLoadingAccountDetail}>
        <Text>{accountDetail?.data?.bio}</Text>
      </SkeletonText>
    )
  }

  function renderAddress() {
    return (
      <Stack direction="row" alignItems="center">
        <Address type="address" chainId={chainId} fontSize="4xl" fontWeight="bold">
          {address}
        </Address>
        <IconButton size="sm" icon={<CopyIcon />} aria-label="Copy address" onClick={onCopyAddress} />
      </Stack>
    )
  }

  function renderFollowers() {
    return (
      <Button variant="unstyled" onClick={followerListModal.onOpen}>
        <Stack direction="row">
          <SkeletonText noOfLines={1} isLoaded={!isLoadingAccountDetail}>
            <Text>{accountDetail?.data?.followers}</Text>
          </SkeletonText>
          <Text>Followers</Text>
        </Stack>
      </Button>
    )
  }

  function renderFollowings() {
    return (
      <Button variant="unstyled" onClick={followingListModal.onOpen}>
        <Stack direction="row">
          <SkeletonText noOfLines={1} isLoaded={!isLoadingAccountDetail}>
            <Text>{accountDetail?.data?.followings}</Text>
          </SkeletonText>
          <Text>Followings</Text>
        </Stack>
      </Button>
    )
  }

  function renderEditProfileButton() {
    return (
      <EditProfileButton
        defaultValues={{
          alias: accountDetail?.data?.alias,
          email: accountDetail?.data?.email,
          bio: accountDetail?.data?.bio,
          imageHash: accountDetail?.data?.imageHash,
        }}
        onChange={() => fetchAccountDetail({ address })}
      />
    )
  }

  return (
    <>
      <Stack alignItems="center" px={0} {...props}>
        <Stack
          direction={{ base: 'column-reverse', md: 'row' }}
          spacing={{ base: 24, md: 2 }}
          w="100%"
          py={12}
          maxW="container.xl"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack p={{ base: 4, md: 8 }} alignItems={{ base: 'center', md: 'flex-start' }}>
            {renderAvatar()}
            {renderAddress()}
            {renderAlias()}
            {renderBio()}
            <Stack direction="row" spacing={8}>
              {renderFollowers()}
              {renderFollowings()}
              {account && !isMe && <FollowButton to={address} onChange={() => fetchAccountDetail({ address })} />}
              {isMe && renderEditProfileButton()}
            </Stack>
          </Stack>
          <AccountBanner
            p={8}
            maxW="600px"
            w="100%"
            h="400px"
            bannerHash={accountDetail?.data?.bannerHash}
            isLoading={isLoadingAccountDetail}
            isEditable={isMe}
          />
        </Stack>
        <Tabs index={activeTabIndex} w="100%">
          <TabList overflowX="auto" ref={tabListRef}>
            {tabOptions.map(tab => (
              <Link key={tab.path} href={tab.path} passHref>
                <Tab as="a" flexShrink={0}>
                  {tab.label}
                </Tab>
              </Link>
            ))}
          </TabList>
        </Tabs>
      </Stack>
      {children}
      <FollowerListModal address={address} isOpen={followerListModal.isOpen} onClose={followerListModal.onClose} />
      <FollowingListModal address={address} isOpen={followingListModal.isOpen} onClose={followingListModal.onClose} />
    </>
  )
}
