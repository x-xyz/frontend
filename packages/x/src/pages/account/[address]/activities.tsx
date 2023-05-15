import { Box, Container, Stack, Text } from '@chakra-ui/layout'
import Address from 'components/Address'
import AccountNavBar from 'components/account/AccountNavBar'
import BuyAndSellBanner from 'components/BuyAndSellBanner'
import Layout from 'components/Layout/v2'
import Price from 'components/Price'
import SimpleTable from 'components/SimpleTable'
import NftThumbnail from 'components/token/NftThumbnail'
import { DateTime } from 'luxon'
import { Activity } from '@x/models'
import { useEffect, useState } from 'react'
import { useLazyActivitiesQuery } from '@x/apis'
import { getFirst } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

interface Props {
  address: string
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.query.address)

  if (!address) return { redirect: { destination: '/404', permanent: false } }

  return { props: { address } }
})

const batchSize = 10

export default function AccountActivity({ address }: Props) {
  const [from, setFrom] = useState(0)

  const [activities, setActivities] = useState<Activity[]>([])

  const [fetch, { data, isLoading }] = useLazyActivitiesQuery()

  useEffect(() => {
    setActivities(prev => {
      if (!data?.data?.activities) return prev
      return [...prev, ...data?.data?.activities]
    })
  }, [data])

  useEffect(() => setFrom(0), [address])

  useEffect(() => {
    fetch({ address, limit: batchSize, offset: from })
  }, [fetch, address, from])

  return (
    <Layout>
      <Container maxWidth="container.xl" overflowX="auto">
        <BuyAndSellBanner />
        <AccountNavBar account={address} />
        <Box overflowX="auto" w="100%">
          <SimpleTable
            data={activities}
            isLoading={isLoading}
            hasMore={(data?.data?.count || 0) > activities.length}
            onMore={() => !isLoading && setFrom(prev => prev + batchSize)}
            fields={[
              { key: 'type', name: 'Type', render: item => item.type },
              {
                key: 'item',
                name: 'Item',
                render: item => (
                  <NftThumbnail
                    thumbnail={item.token.thumbnailPath || item.token.imageUrl}
                    chainId={item.token.chainId}
                    contractAddress={item.token.contract}
                    tokenId={item.token.tokenId}
                    name={item.token.name}
                  />
                ),
              },
              {
                key: 'price',
                name: 'Price',
                render: item => (
                  <Price chainId={item.token.chainId} tokenId={item.paymentToken}>
                    {item.price}
                  </Price>
                ),
              },
              { key: 'quantity', name: 'Quantity', render: item => item.quantity },
              {
                key: 'owner',
                name: 'Owner',
                render: item => (
                  <Stack>
                    {item.owner?.alias && <Text>{item.owner.alias}</Text>}
                    {item.owner?.address ? <Address type="account">{item.owner.address}</Address> : '-'}
                  </Stack>
                ),
              },
              {
                key: 'date',
                name: 'Date',
                render: item =>
                  DateTime.fromISO(item.createdAt).toLocaleString({ dateStyle: 'short', timeStyle: 'short' }),
              },
            ]}
          />
        </Box>
      </Container>
    </Layout>
  )
}
