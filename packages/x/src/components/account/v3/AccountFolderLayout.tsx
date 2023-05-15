import Address from 'components/Address'
import Layout, { LayoutProps } from 'components/Layout/v3'
import Nav from 'components/v3/Nav'
import Price from 'components/v3/Price'
import StatValue from 'components/v3/StatValue'
import { isFeatureEnabled } from 'flags'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { Badge, Box, Center, CenterProps, Container, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { fetchAccountFolder, fetchAccountV2 } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account, Folder } from '@x/models'
import { compareAddress } from '@x/utils'
import CollapsedBox from '../../CollapsedBox'
import Markdown from '../../Markdown'

import AccountAvatar from '../AccountAvatar'
import AccountNavBar from './AccountNavBar'
import EditProfileButton from './EditProfileButton'
import ShareAccountButton from './ShareAccountButton'

export interface AccountFolderLayoutProps extends LayoutProps {
  account: Account
  folder: Folder
}

export default function AccountFolderLayout({
  account: initialAccount,
  folder: initialFolder,
  children,
  ...props
}: AccountFolderLayoutProps) {
  const [authToken] = useAuthToken()
  const { account: activeAccountAddress } = useActiveWeb3React()
  const { data: account = initialAccount } = useQuery(['account', initialAccount.address], fetchAccountV2, {
    initialData: initialAccount,
  })
  const { data: folder = initialFolder, isLoading: isLoadingFolder } = useQuery(
    ['accountFolder', account.address, initialFolder.id, { authToken }],
    fetchAccountFolder,
  )
  const folderName = useMemo(() => {
    if (folder.isBuiltIn) {
      return folder.isPrivate ? 'Private NFTs' : 'Public NFTs'
    }
    return folder.name
  }, [folder])
  return (
    <Layout {...props}>
      <Container pos="relative" maxW="container.xl" py={5} pt="100px">
        <AccountAvatar
          account={account}
          w="120px"
          h="120px"
          pos="absolute"
          left="50%"
          transform="translate(-60px, -30px)"
        />
        <Heading>NFT Portfolio</Heading>
        <Badge pos="absolute">Joined in {DateTime.fromMillis(account.createdAtMs).toFormat('LLL yyyy')}</Badge>
        <Stack pos="absolute" direction="row" right={5} spacing={5}>
          {compareAddress(account.address, activeAccountAddress) && <EditProfileButton defaultValues={account} />}
          <ShareAccountButton account={account} />
        </Stack>
        <Box h={24} />
        <Stack align="center" spacing={10}>
          <Stack align="center" spacing={1}>
            <Text fontSize="4xl" fontWeight="bold">
              {account.alias}
            </Text>
            <Address type="copy" color="value" fontSize="sm" selfSynonym="">
              {account.address}
            </Address>
          </Stack>
          <CollapsedBox maxW="760px" collapsedHeight={144} color="note">
            <Markdown>{account.bio}</Markdown>
          </CollapsedBox>
        </Stack>
      </Container>
      {isFeatureEnabled('v3.portfolio-summary-table') && (
        <Container maxW="container.xl" px={0}>
          <Flex wrap="wrap" justify="center">
            <Stat>
              <StatValue
                label="NFTs Owned"
                value={folder?.nftCount}
                center
                isLoading={isLoadingFolder}
                numberFormatOption={{ minimumFractionDigits: 0 }}
              />
            </Stat>
            <Stat>
              <StatValue
                label="Collection count"
                value={folder?.collectionCount}
                center
                numberFormatOption={{ minimumFractionDigits: 0 }}
                isLoading={isLoadingFolder}
              />
            </Stat>
            <Stat>
              <Price
                label="Total Portfolio Value"
                price={folder?.totalValueInUsd}
                unit="USD"
                center
                isLoading={isLoadingFolder}
              />
            </Stat>
            <Stat>
              <StatValue
                label="Portfolio Value Change"
                value={(folder?.totalValueMovement || 0) * 100}
                unit="%"
                center
                isLoading={isLoadingFolder}
              />
            </Stat>
            <Stat>
              <Price
                label="Instant Liquidity Value"
                price={folder?.instantLiquidityInUsd}
                unit="USD"
                center
                isLoading={isLoadingFolder}
                tooltip="The combined value of all the top offers made on the NFTs in your portfolio"
              />
            </Stat>
            <Stat>
              <StatValue
                label="Instant Liquidity Ratio"
                value={((folder?.instantLiquidityInUsd || 0) / (folder?.totalValueInUsd || 1)) * 100}
                unit="%"
                center
                isLoading={isLoadingFolder}
                tooltip="The percent of your portfolio value that you can immediate liquidate if all top offers on your portfolio are accepted"
                disablePercentageStyle
              />
            </Stat>
          </Flex>
          <Text color="note" textAlign="center" mt={5}>
            Data presented in the above table is updated hourly
          </Text>
        </Container>
      )}
      <AccountNavBar account={account} />
      <Center
        bgColor="##151515"
        bgImg="url(/assets/v3/full_width_banner_2560x80_bg.jpg)"
        bgSize="auto 100%"
        bgRepeat="no-repeat"
        bgPos="center"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="divider"
        w="full"
        h={20}
      >
        <Container maxW="container.xl">
          <Heading>{folderName}</Heading>
        </Container>
      </Center>
      {children}
    </Layout>
  )
}

function Stat({ children, ...props }: CenterProps) {
  return (
    <Center
      w={{ base: '160px', md: '200px' }}
      h="100px"
      flexDir="column"
      justifyContent="flex-start"
      pt={5}
      border="1px solid"
      borderColor="divider"
      mr="-1px"
      mb="-1px"
      {...props}
    >
      {children}
    </Center>
  )
}
