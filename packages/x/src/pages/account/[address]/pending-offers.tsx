import { Box, Container, Stack, Text } from '@chakra-ui/layout'
import AccountNavBar from 'components/account/AccountNavBar'
import BuyAndSellBanner from 'components/BuyAndSellBanner'
import Layout from 'components/Layout/v2'
import { getFirst } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import SimpleTable from 'components/SimpleTable'
import NftThumbnail from 'components/token/NftThumbnail'
import Price from 'components/Price'
import Address from 'components/Address'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { PendingOffer } from '@x/models'
import { useLazyPendingOffersQuery } from '@x/apis'

interface Props {
  address: string
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.query.address)

  if (!address) return { redirect: { destination: '/404', permanent: false } }

  return { props: { address } }
})

const batchSize = 10

export default function AccountPendingOffers({ address }: Props) {
  const [from, setFrom] = useState(0)

  const [offers, setOffers] = useState<PendingOffer[]>([])

  const [fetch, { data, isLoading }] = useLazyPendingOffersQuery()

  useEffect(() => {
    setOffers(prev => {
      if (!data?.data?.data) return prev
      return [...prev, ...data.data.data]
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
            data={offers}
            isLoading={isLoading}
            hasMore={(data?.data?.count || 0) > offers.length}
            onMore={() => !isLoading && setFrom(prev => prev + batchSize)}
            fields={[
              {
                key: 'Item',
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
                key: 'Price',
                name: 'Price',
                render: item => (
                  <Price chainId={item.token.chainId} tokenId={item.paymentToken}>
                    {item.price}
                  </Price>
                ),
              },
              {
                key: 'Quantity',
                name: 'Quantity',
                render: item => item.quantity,
              },
              {
                key: 'Offeror',
                name: 'Offeror',
                render: item => (
                  <Stack>
                    {item.offeror.alias && <Text>{item.offeror.alias}</Text>}
                    <Address type="account">{item.offeror.address}</Address>
                  </Stack>
                ),
              },
              {
                key: 'Date',
                name: 'Date',
                render: item =>
                  DateTime.fromISO(item.createdAt).toLocaleString({ dateStyle: 'short', timeStyle: 'short' }),
              },
              {
                key: 'Deadline',
                name: 'Deadline',
                render: item =>
                  DateTime.fromMillis(item.deadline).toLocaleString({ dateStyle: 'short', timeStyle: 'short' }),
              },
            ]}
          />
        </Box>
      </Container>
    </Layout>
  )
}
