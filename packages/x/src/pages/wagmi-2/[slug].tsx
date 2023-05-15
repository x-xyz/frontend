import Layout, { Project } from 'components/Layout/wagmi'
import projects from 'components/Layout/wagmi/wagmi-2'
import NftCardPage, { NftCardFilterPanel } from 'components/token/NftCardPage'
import { isFeatureEnabled } from 'flags'
import keys from 'lodash/keys'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import { Checkbox, CheckboxGroup, Stack, Text } from '@chakra-ui/react'
import { FetchTokensProvider, useFetchTokens } from '@x/hooks'
import { ChainId } from '@x/models'
import { getFirst } from '@x/utils'
import { useCollectionQuery } from '@x/apis'

interface Props {
  defaultProject: Project
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const slug = decodeURIComponent(getFirst(ctx.query.slug) || '')

    const defaultProject = slug ? projects.find(p => p.name.toLowerCase() === slug) : void 0

    if (!defaultProject) return { notFound: true }

    return { props: { defaultProject } }
  },
  { requrieAuth: !isFeatureEnabled('promotion-page') },
)

export default function Bakc({ defaultProject }: Props) {
  const { query, replace } = useRouter()

  const [project, setProject] = useState<Project | undefined>(defaultProject)

  const address = useMemo(() => project?.address || '', [project])

  const slug = decodeURIComponent(getFirst(query.slug) || '')

  const { data: collectionData } = useCollectionQuery(
    { chainId: ChainId.Ethereum, contract: address },
    { skip: !address },
  )

  const collection = useMemo(() => collectionData?.data, [collectionData])

  useEffect(
    () =>
      setProject(prev => {
        if (prev && prev.name.toLowerCase() === slug) return prev
        return projects.find(p => p.name.toLowerCase() === slug)
      }),
    [slug],
  )

  useEffect(() => {
    if (!project) replace('/404')
  }, [project, replace])

  const fetchTokeParams = useFetchTokens({
    defaultValue: {
      collections: [address],
      sortBy: 'createdAt',
    },
  })

  const { setCollections, setAddress, attrFilters, setAttrFilters } = fetchTokeParams

  useEffect(() => {
    setCollections([address])
    setAddress(void 0)
  }, [address, setCollections, setAddress])

  function renderAttribute(traitType: string) {
    if (!collection || !collection.attributes) return null

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
    if (!collection || !collection.attributes) return null

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
    <Layout title="Monthly Special Promotion" assetsFolder="/assets/wagmi-2" projects={projects}>
      <FetchTokensProvider value={fetchTokeParams}>
        <NftCardPage strewn={false} hidePanels={['collections', 'category', 'chain']}>
          {isFeatureEnabled('trait-filter') && renderAttributePanel()}
        </NftCardPage>
      </FetchTokensProvider>
    </Layout>
  )
}
