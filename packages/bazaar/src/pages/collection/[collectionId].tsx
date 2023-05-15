import { goapiUrl } from '@x/constants'
import { ChainId, defaultNetwork } from '@x/constants'
import { ResponseOf } from '@x/models'
import { Collection } from '@x/models'
import { getFirst } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { isAddress } from '@x/utils'
import { useRouter } from 'next/router'
import { useFetchTokens, FetchTokensProvider, parseFetchTokensParamsFromQuery } from '@x/hooks'
import Layout from 'components/Layout'
import CollectionCard from 'components/collection/CollectionCard'
import NftCardPage, { NftCardFilterPanel } from 'components/token/NftCardPage'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
} from '@chakra-ui/react'
import keys from 'lodash/keys'
import { FiMinus, FiPlus } from 'react-icons/fi'
import HeadMeta from 'components/HeadMeta'

export interface Props {
  chainId: ChainId
  collectionId: string
  collection: Collection
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const collectionId = getFirst(ctx.params?.collectionId)

    if (!collectionId) return { notFound: true }

    const chainId = defaultNetwork

    if (isAddress(collectionId)) {
      const resp = await fetch(`${goapiUrl}/collection/${chainId}/${collectionId}`)

      const data: ResponseOf<Collection> = await resp.json()

      if (data.status === 'fail') return { notFound: true }

      return { props: { chainId, collectionId, collection: data.data } }
    }

    const resp = await fetch(`${goapiUrl}/collections`)

    const data: ResponseOf<Collection[]> = await resp.json()

    if (data.status === 'fail') return { notFound: true }

    const collection = data.data.find(
      collection => collection.collectionName?.toLowerCase().replace(/\s/g, '-') === collectionId.toLowerCase(),
    )

    if (!collection) return { notFound: true }

    return { props: { chainId, collectionId, collection } }
  },
  { requrieAuth: true },
)

export default function CollectionList({ collection }: Props) {
  const { query } = useRouter()

  const fetchTokensParams = useFetchTokens({
    defaultValue: {
      sortBy: 'createdAt',
      ...parseFetchTokensParamsFromQuery(query),
      chainId: defaultNetwork,
      collections: [collection.erc721Address],
    },
    id: 'collection',
  })

  const { attrFilters, setAttrFilters } = fetchTokensParams

  // useFetchTokensParamsQuery(fetchTokensParams, { ignores: ['chainId', 'category', 'collections'] })

  function renderAttribute(traitType: string) {
    if (!collection.attributes) return null

    const { attributes } = collection

    const traitValues = keys(attributes[traitType]).slice(0, 100)

    return (
      <Box key={traitType} borderWidth="1px" borderColor="inactive" borderRadius="10px">
        <AccordionItem>
          {({ isExpanded }) => (
            <>
              <AccordionButton>
                <Text flex="1" textAlign="left">
                  {traitType}
                </Text>
                {isExpanded ? <FiMinus /> : <FiPlus />}
              </AccordionButton>
              <AccordionPanel>
                <CheckboxGroup
                  value={attrFilters.find(af => af.name === traitType)?.values || []}
                  onChange={v => setAttrFilters(traitType, v.map(String))}
                >
                  {traitValues.map(value => (
                    <Checkbox variant="solid" key={value} value={value} w="100%" overflow="hidden">
                      <Stack w="100%" direction="row">
                        <Text maxW="140px" isTruncated>
                          {value.replace(/"/g, '').replace(/-/g, ' ') || '<empty>'}
                        </Text>
                        <Text>({attributes[traitType]?.[value] || 0})</Text>
                      </Stack>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Box>
    )
  }

  function renderAttributePanel() {
    if (!collection.attributes) return null

    const traitTypes = keys(collection.attributes)

    if (traitTypes.length === 0) return

    return (
      <NftCardFilterPanel title="Attributes">
        <Accordion allowToggle>
          <Stack>{traitTypes.map(renderAttribute)}</Stack>
        </Accordion>
      </NftCardFilterPanel>
    )
  }

  return (
    <Layout>
      <HeadMeta subtitle={collection.collectionName} description={collection.description} />
      <CollectionCard collection={collection} w="100%" />
      <FetchTokensProvider value={fetchTokensParams} id="collection">
        <NftCardPage hidePanels={['collections', 'category', 'chain']}>{renderAttributePanel()}</NftCardPage>
      </FetchTokensProvider>
    </Layout>
  )
}
