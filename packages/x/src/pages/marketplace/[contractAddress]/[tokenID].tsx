import Layout from 'components/Layout/v3'
import NftInfo from 'components/token/v3/NftInfo'
import NftInfoDetail from 'components/token/v3/NftInfoDetail'
import NftInfoProvider from 'components/token/NftInfoProvider'
import Head from 'next/head'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Container } from '@chakra-ui/layout'
import { fetchToken, fetchTokenMetadata, fetchCollection } from '@x/apis/fn'
import { ChainId, getChainIdFromUrl, getChainNameForUrl } from '@x/constants'
import { Collection, NftItem, TokenMetadata } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'

interface Props {
  contract: string
  tokenId: string
  chainId: ChainId
  prefetchData: NftItem | null
  prefetchMetadata: TokenMetadata | null
  prefetchCollection: Collection | null
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const contract = getFirst(ctx.query.contract || ctx.query.contractAddress)

  const tokenId = getFirst(ctx.query.tokenId || ctx.query.tokenID)

  const chainName = getFirst(ctx.query.chainName)

  const chainId = (chainName && getChainIdFromUrl(chainName)) || ChainId.Fantom

  if (!contract || !isAddress(contract) || !tokenId) return { redirect: { destination: '/404', permanent: false } }

  const authToken = ctx.req.cookies['auth-token']

  const [token, collection] = await Promise.all([
    call(() => fetchToken({ chainId, contract, tokenId, authToken }).catch(() => null), {
      maxAttempt: 5,
      timeout: 500,
    }),
    call(() => fetchCollection({ chainId, contract }).catch(() => null), { maxAttempt: 5, timeout: 500 }),
  ])

  const metadata = token?.data?.tokenUri
    ? await fetchTokenMetadata(token.data.hostedTokenUri || token.data.tokenUri).catch(() => null)
    : null

  return {
    props: {
      contract: contract,
      tokenId: tokenId,
      chainId,
      prefetchData: token?.data || null,
      prefetchMetadata: metadata || null,
      prefetchCollection: collection?.data || null,
    },
  }
})

export default function Info({
  contract: contractAddress,
  tokenId: tokenID,
  chainId,
  prefetchData,
  prefetchMetadata,
  prefetchCollection,
}: Props) {
  function renderHead(token: NftItem, metadata: TokenMetadata | null, collection: Collection | null) {
    const titleParts = [token.name, collection?.collectionName].filter(Boolean)
    const title = `${titleParts.join(' - ')} | X`
    const description = metadata?.description || collection?.description
    const image = token.hostedImageUrl
    const url = `https://x.xyz/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${tokenID}`
    return (
      <Head>
        <title key="title">{title}</title>
        {description && <meta key="description" name="description" content={description} />}
        <meta key="og:title" property="og:title" content={title} />
        {description && <meta key="og:description" property="og:description" content={description} />}
        {image && <meta key="og:image" property="og:image" content={image} />}
        <meta key="og:url" property="og:url" content={url} />
        <meta key="twitter:title" name="twitter:title" content={title} />
        {description && <meta key="twitter:description" name="twitter:description" content={description} />}
        {image && <meta key="twitter:image" name="twitter:image" content={image} />}
      </Head>
    )
  }

  return (
    <NftInfoProvider
      chainId={chainId}
      contractAddress={contractAddress}
      tokenId={tokenID}
      initialNftItem={prefetchData ?? void 0}
    >
      {prefetchData && renderHead(prefetchData, prefetchMetadata, prefetchCollection)}
      <Layout>
        <Container maxWidth="container.xl" pt={4} px={{ base: 0, sm: 4 }}>
          <NftInfo />
          <NftInfoDetail mt="15" mb="5rem" />
          {/*<NftInfo2 />*/}
          {/*<NftInfoDetail2 />*/}
        </Container>
      </Layout>
    </NftInfoProvider>
  )
}
