import { Box, Flex, Grid, GridItem, Stack, Text } from '@chakra-ui/react'
import { fetchAccountV2, fetchCollectionSummary } from '@x/apis/fn'
import { useActiveWeb3React } from '@x/hooks/dist'
import { Account } from '@x/models'
import Address from 'components/Address'
import CollapsedBox from 'components/v4/CollapsedBox'
import Layout, { LayoutProps } from 'components/Layout/v4'
import Markdown from 'components/Markdown'
import Media from 'components/Media'
import Price from 'components/v3/Price'
import StatValue from 'components/v3/StatValue'
import { useQuery } from 'react-query'
import AccountNavBar from './AccountNavBar'
import EditProfileButton from './EditProfileButton'
import ShareAccountButton from './ShareAccountButton'

export interface AccountLayoutProps extends LayoutProps {
  account: Account
}

const breakpoint = 'lg'

export default function AccountLayout({ account: initialData, children, ...props }: AccountLayoutProps) {
  const { data: account = initialData } = useQuery(['account', initialData.address], fetchAccountV2, { initialData })
  const { data: summary, isLoading: isLoadingSummary } = useQuery(
    ['account-collection-summary', account.address],
    fetchCollectionSummary,
  )

  return (
    <Layout disableTransparentBlackOnBackground px={{ base: 5, [breakpoint]: 6 }} {...props}>
      <Grid
        templateColumns={{ base: 'auto 1fr', [breakpoint]: 'auto 1fr auto' }}
        templateRows={{ base: 'auto auto', [breakpoint]: 'auto' }}
        columnGap={6}
        rowGap={4}
        pt={{ base: 12, [breakpoint]: 14 }}
      >
        <GridItem>
          <Media
            w="120px"
            h="120px"
            borderRadius="8px"
            overflow="hidden"
            contentType="image"
            src={account.imageUrl || account.imageHash}
          />
        </GridItem>
        <GridItem>
          <Address type="copy">{account.address}</Address>
          <Stack direction="row" ml={-2.5}>
            <EditProfileButton defaultValues={account} />
            <ShareAccountButton account={account} />
          </Stack>
          <CollapsedBox collapsedHeight={120} color="note">
            <Markdown>{account.bio}</Markdown>
          </CollapsedBox>
        </GridItem>
        <GridItem colSpan={{ base: 2, [breakpoint]: 1 }}>
          <Flex
            sx={{
              '&>*': {
                py: 2,
                pos: 'relative',
                '&:not(:last-child)': {
                  pr: '20px',
                  ':after': {
                    content: '""',
                    display: 'block',
                    w: '1px',
                    h: 'full',
                    bg: 'divider',
                    pos: 'absolute',
                    top: '0px',
                    right: '10px',
                  },
                },
              },
            }}
          >
            <Price
              label="Total Collection Value"
              price={summary?.totalCollectionValue}
              unit="USD"
              center
              isLoading={isLoadingSummary}
            />
            <StatValue
              label="NFT Count"
              value={summary?.nftCount}
              center
              numberFormatOption={{ minimumFractionDigits: 0 }}
              isLoading={isLoadingSummary}
            />
            <StatValue
              label="Total Collection Value Change"
              value={(summary?.totalCollectionValueChange || 0) * 100}
              unit="%"
              center
              isLoading={isLoadingSummary}
            />
            <Price
              label="Instant Liquidity Value"
              price={summary?.instantLiquidityValue}
              unit="USD"
              center
              isLoading={isLoadingSummary}
              tooltip="The combined value of all the top offers made on the NFTs in your portfolio"
            />
            <StatValue
              label="Instant Liquidity Ratio"
              value={(summary?.instantLiquidityRatio || 0) * 100}
              unit="%"
              center
              isLoading={isLoadingSummary}
              tooltip="The percent of your portfolio value that you can immediate liquidate if all top offers on your portfolio are accepted"
              disablePercentageStyle
            />
          </Flex>
          <Text color="note" textAlign="center" mt={5}>
            Data presented in the above table is updated hourly
          </Text>
        </GridItem>
      </Grid>
      <AccountNavBar account={account} />
      {children}
    </Layout>
  )
}
