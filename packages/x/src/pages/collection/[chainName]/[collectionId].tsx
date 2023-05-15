import CollectionCard from 'components/collection/CollectionCard'
import Layout from 'components/Layout/v2'
import NftCardPage, { NftCardFilterPanel } from 'components/token/NftCardPage'
import keys from 'lodash/keys'
import { useRouter } from 'next/router'
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import { CheckboxGroup, Checkbox, Stack, Text } from '@chakra-ui/react'
import { ChainId, getChainIdFromUrl, goapiUrl } from '@x/constants'
import {
  FetchTokensProvider,
  parseFetchTokensParamsFromQuery,
  useFetchTokens,
  useFetchTokensParamsQuery,
} from '@x/hooks'
import { Collection, ResponseOf } from '@x/models'
import { getFirst, isAddress } from '@x/utils'
import { isFeatureEnabled } from 'flags'
import { useEffect } from 'react'

export interface Props {
  chainId: ChainId
  collectionId: string
  collection: Collection
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const chainName = getFirst(ctx.params?.chainName)

  const collectionId = getFirst(ctx.params?.collectionId)

  if (!chainName || !collectionId) return { notFound: true }

  const chainId = (chainName && getChainIdFromUrl(chainName)) || ChainId.Fantom

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
})

export default function CollectionPage({ chainId, collection }: Props) {
  const { query } = useRouter()

  const fetchTokensParams = useFetchTokens({ defaultValue: parseFetchTokensParamsFromQuery(query), id: 'collection' })

  const { attrFilters, setAttrFilters, setChainId, setCollections } = fetchTokensParams

  useEffect(() => {
    setChainId(chainId)
    setCollections([collection.erc721Address])
  }, [chainId, collection, setChainId, setCollections])

  useFetchTokensParamsQuery(fetchTokensParams, { ignores: ['chainId', 'category', 'collections'] })

  // @todo remove hardcode
  collection.isRegistered = true

  function renderAttribute(traitType: string) {
    if (!collection.attributes) return null

    const { attributes } = collection

    const traitValues = keys(attributes[traitType]).slice(0, 100)

    const currentValue = attrFilters.find(af => af.name === traitType)?.values

    return (
      <AccordionItem key={traitType}>
        {({ isExpanded }) => (
          <>
            <AccordionButton bg="#2E2F43" borderRadius="4px">
              <Text flex="1" textAlign="left" fontSize="xs">
                {traitType} ({traitValues.length || 0})
              </Text>
              {isExpanded ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
            </AccordionButton>
            <AccordionPanel>
              <CheckboxGroup value={currentValue} onChange={v => setAttrFilters(traitType, v.map(String))}>
                {traitValues.map(value => (
                  <Checkbox variant="ghost" key={value} value={value} w="100%" overflow="hidden" my={1}>
                    <Text fontSize="xs" fontWeight="medium" textTransform="capitalize">
                      {value.replace(/"/g, '').replace(/-/g, ' ') || '<empty>'} ({attributes[traitType]?.[value] || 0})
                    </Text>
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    )
  }

  function renderAttributePanel() {
    if (!collection.attributes) return null

    const traitTypes = keys(collection.attributes)

    if (traitTypes.length === 0) return

    return (
      <NftCardFilterPanel title="Properties">
        <Accordion allowToggle>
          <Stack>{traitTypes.map(renderAttribute)}</Stack>
        </Accordion>
      </NftCardFilterPanel>
    )
  }

  return (
    <Layout title={collection.collectionName}>
      <CollectionCard collection={collection} w="100%" />
      <FetchTokensProvider value={fetchTokensParams} id="collection">
        <NftCardPage hidePanels={['collections', 'category', 'chain']}>
          {isFeatureEnabled('trait-filter') && renderAttributePanel()}
        </NftCardPage>
      </FetchTokensProvider>
    </Layout>
  )
}
