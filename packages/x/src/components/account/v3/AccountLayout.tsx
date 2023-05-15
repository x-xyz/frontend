import Address from 'components/Address'
import CollapsedBox from 'components/CollapsedBox'
import Layout, { LayoutProps } from 'components/Layout/v3'
import Markdown from 'components/Markdown'
import Nav from 'components/v3/Nav'
import Price from 'components/v3/Price'
import StatValue from 'components/v3/StatValue'
import { isFeatureEnabled } from 'flags'
import { DateTime } from 'luxon'
import { useQuery } from 'react-query'

import { Badge, Box, Center, CenterProps, Container, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { fetchAccountV2, fetchCollectionSummary } from '@x/apis/fn'
import { useActiveWeb3React } from '@x/hooks'
import { Account } from '@x/models'
import { compareAddress } from '@x/utils'

import AccountAvatar from '../AccountAvatar'
import AccountNavBar from './AccountNavBar'
import EditProfileButton from './EditProfileButton'
import ShareAccountButton from './ShareAccountButton'
import Link from 'components/Link'
import Dropdown from 'components/v3/Dropdown'

export interface AccountLayoutProps extends LayoutProps {
  account: Account
  pageTitle: string
}

export default function AccountLayout({ account: initialData, pageTitle, children, ...props }: AccountLayoutProps) {
  const { account: activeAccountAddress } = useActiveWeb3React()
  const { data: account = initialData } = useQuery(['account', initialData.address], fetchAccountV2, { initialData })
  const { data: summary, isLoading: isLoadingSummary } = useQuery(
    ['account-collection-summary', account.address],
    fetchCollectionSummary,
  )
  return (
    <Layout {...props}>
      {/* <Container maxW="container.xl" p={0}>
        <AspectRatio ratio={4} h="300px">
          <Image src={account.bannerHash}>
            {data => <Box w="full" h="full" bg={`url(${data})`} bgRepeat="no-repeat" bgSize="contain" bgPos="center" />}
          </Image>
        </AspectRatio>
      </Container> */}
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
              <Price
                label="Total Collection Value"
                price={summary?.totalCollectionValue}
                unit="USD"
                center
                isLoading={isLoadingSummary}
              />
            </Stat>
            <Stat>
              <StatValue
                label="NFT Counts"
                value={summary?.nftCount}
                center
                numberFormatOption={{ minimumFractionDigits: 0 }}
                isLoading={isLoadingSummary}
              />
            </Stat>
            <Stat>
              <StatValue
                label="Collection Count"
                value={summary?.collectionCount}
                center
                numberFormatOption={{ minimumFractionDigits: 0 }}
                isLoading={isLoadingSummary}
              />
            </Stat>
            <Stat>
              <StatValue
                label="Total Collection Value Change"
                value={(summary?.totalCollectionValueChange || 0) * 100}
                unit="%"
                center
                isLoading={isLoadingSummary}
              />
            </Stat>
            <Stat>
              <Price
                label="Instant Liquidity Value"
                price={summary?.instantLiquidityValue}
                unit="USD"
                center
                isLoading={isLoadingSummary}
                tooltip="The combined value of all the top offers made on the NFTs in your portfolio"
              />
            </Stat>
            <Stat>
              <StatValue
                label="Instant Liquidity Ratio"
                value={(summary?.instantLiquidityRatio || 0) * 100}
                unit="%"
                center
                isLoading={isLoadingSummary}
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
          <Heading>{pageTitle}</Heading>
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
