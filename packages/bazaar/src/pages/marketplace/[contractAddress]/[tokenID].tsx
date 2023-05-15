import { Container } from '@chakra-ui/layout'
import Layout from 'components/Layout'
import NftInfo from 'components/token/NftInfo'
import NftInfoProvider from 'components/token/NftInfoProvider'
import { ChainId, defaultNetwork } from '@x/constants'
import { isAddress, getFirst, isErrorResponse } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import HeadMeta from 'components/HeadMeta'
import { Collection, NftItem, TokenMetadata } from '@x/models'
import { fetchToken, fetchTokenMetadata, fetchCollection } from '@x/apis/fn'

interface Props {
  contract: string
  tokenId: string
  chainId: ChainId
  token: NftItem
  collection: Collection
  tokenMetadata?: TokenMetadata
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const contract = getFirst(ctx.query.contractAddress)

    const tokenId = getFirst(ctx.query.tokenID)

    const chainId = defaultNetwork

    if (!contract || !isAddress(contract) || !tokenId) return { notFound: true }

    const [collectionResp, tokenResp] = await Promise.all([
      fetchCollection({ chainId, contract }),
      fetchToken({ chainId, contract, tokenId }),
    ])

    if (isErrorResponse(collectionResp) || collectionResp.status === 'fail') return { notFound: true }

    if (isErrorResponse(tokenResp) || tokenResp.status === 'fail') return { notFound: true }

    const tokenMetadata = await fetchTokenMetadata(tokenResp.data.hostedTokenUri || tokenResp.data.tokenUri)

    return {
      props: {
        contract,
        tokenId,
        chainId,
        collection: collectionResp.data,
        token: tokenResp.data,
        tokenMetadata,
      },
    }
  },
  { requrieAuth: true },
)

export default function Info({ contract, tokenId, chainId, collection, token, tokenMetadata }: Props) {
  return (
    <NftInfoProvider chainId={chainId} contractAddress={contract} tokenId={tokenId} enableEventListener>
      <HeadMeta
        subtitle={[token.name, collection.collectionName]}
        description={tokenMetadata?.description || collection.description}
      />
      <Layout>
        <Container maxWidth="container.xl" pt={4} px={{ base: 0, sm: 4 }}>
          <NftInfo />
        </Container>
      </Layout>
    </NftInfoProvider>
  )
}
