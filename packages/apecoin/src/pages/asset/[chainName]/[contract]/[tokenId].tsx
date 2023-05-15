import Layout from 'components/Layout'
import NftInfo from 'components/token/NftInfo'
import Head from 'next/head'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Container } from '@chakra-ui/layout'
import { fetchCollectionV2, fetchTokenMetadata, fetchTokenV2 } from '@x/apis/fn'
import { getChainIdFromUrl, getChainNameForUrl } from '@x/constants'
import { Collection, NftItem, TokenMetadata } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'

interface Props {
  nftItem: NftItem
  collection: Collection
  metadata?: TokenMetadata
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const chainName = getFirst(ctx.params?.chainName)
  const contract = getFirst(ctx.params?.contract)
  const tokenId = getFirst(ctx.params?.tokenId)
  if (!chainName || !contract || !tokenId) return { notFound: true }
  const chainId = getChainIdFromUrl(chainName)
  if (!chainId || !isAddress(contract)) return { notFound: true }
  const [nftItem, collection] = await Promise.all([
    call(() => fetchTokenV2({ queryKey: ['token', chainId, contract, tokenId], meta: {} }), {
      maxAttempt: 5,
      timeout: 500,
    }),
    call(() => fetchCollectionV2({ queryKey: ['collection', chainId, contract], meta: {} }), {
      maxAttempt: 5,
      timeout: 500,
    }),
  ])
  const metadata = await fetchTokenMetadata(nftItem.hostedTokenUri || nftItem.tokenUri).catch()
  return { props: { nftItem, collection, metadata } }
})

export default function Asset({ nftItem, collection, metadata }: Props) {
  const { chainId, contractAddress, tokenId } = nftItem

  function renderHead() {
    const titleParts = [nftItem.name, collection.collectionName].filter(Boolean)
    const title = `${titleParts.join(' - ')}`
    const description = metadata?.description || collection.description
    const image = nftItem.hostedImageUrl
    const url = `https://apecoin.x.xyz/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${tokenId}`
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
    <>
      {renderHead()}
      <Layout>
        <Container maxWidth="container.xl" pt={5} px={{ base: 0, lg: 4 }}>
          <NftInfo collection={collection} nftItem={nftItem} />
        </Container>
      </Layout>
    </>
  )
}
