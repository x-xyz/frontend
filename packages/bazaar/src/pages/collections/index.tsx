import Image from 'components/Image'
import SelectCategory from 'components/input/SelectCategory'
import Layout from 'components/Layout'
import Link from 'components/Link'
import MarketNav from 'components/marketplace/MarketNav'
import ReactWindowScroller from 'components/ReactWindowScroller'
import throttle from 'lodash/throttle'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import { layout } from 'theme'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import Icon from '@chakra-ui/icon'
import { CheckIcon } from '@chakra-ui/icons'
import { Box, Center, Grid, GridItem, Spacer, Stack, StackProps, Text } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { Input } from '@chakra-ui/react'
import { Skeleton } from '@chakra-ui/skeleton'
import { useTheme } from '@chakra-ui/system'
import { getColor, transparentize } from '@chakra-ui/theme-tools'
import { useCollectionsQuery } from '@x/apis'
import { defaultNetwork } from '@x/constants'
import { Category, Collection } from '@x/models'
import { getFirst } from '@x/utils'
import { useIpfsImage } from '@x/hooks'
import HeadMeta from 'components/HeadMeta'

interface Props {
  defaultCategory?: Category
}

interface ItemData {
  items: Collection[]
  columnCount: number
  isLoading?: boolean
}

export const getServerSideProps = createServerSidePropsGetter(
  async ctx => {
    const props: Props = {}

    const category = getFirst(ctx.query.category)

    if (category) {
      const value = parseInt(category, 10)
      if (!isNaN(value)) props.defaultCategory = value
    }

    return { props }
  },
  { requrieAuth: true },
)

export default function Collections({ defaultCategory = Category.All }: Props) {
  const theme = useTheme()

  const { locale, replace, query } = useRouter()

  const [category, setCategory] = useState(defaultCategory)

  const [search, setSearch] = useState('')

  const { data, isLoading } = useCollectionsQuery({ chainId: defaultNetwork, category, includeUnregistered: false })

  const [registered] = useMemo(() => {
    if (!data?.data) return [[], []]
    const registered: Collection[] = []
    const unregistered: Collection[] = []
    for (const collection of data?.data) {
      if (search) {
        const searchInLowerCase = search.toLowerCase()
        const nameInLowerCase = collection.collectionName.toLowerCase()
        const addressInLowerCase = collection.erc721Address.toLowerCase()
        if (!nameInLowerCase.includes(searchInLowerCase) && !addressInLowerCase.includes(searchInLowerCase)) {
          continue
        }
      }
      if (collection.isRegistered) registered.push(collection)
      else unregistered.push(collection)
    }
    return [registered, unregistered]
  }, [data, search])

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect>()

  useEffect(() => {
    const resize = throttle(() => {
      if (!containerRef.current) return
      setContainerRect(containerRef.current.getBoundingClientRect())
    }, 10)

    if (!containerRef.current) return

    resize()

    const observer = new ResizeObserver(resize)

    observer.observe(containerRef.current)

    return () => {
      resize.cancel()
      observer.disconnect()
    }
  }, [])

  const columnCount = useBreakpointValue({ base: 1, md: 2, xl: 3, '2xl': 4, '3xl': 5 }) || 1

  const columnWidth = useMemo(() => Math.floor((containerRect?.width || 0) / columnCount), [containerRect, columnCount])

  const rowCount = useMemo(
    () => Math.ceil(registered.length / columnCount) + (isLoading ? 1 : 0),
    [registered, columnCount, isLoading],
  )

  const rowHeight = useMemo(() => Math.floor(columnWidth * 1.16), [columnWidth])

  useEffect(() => {
    const newQuery: ParsedUrlQuery = { ...query }

    let isDirty = false

    if (query.category !== category.toString()) {
      newQuery.category = category.toString()
      isDirty = true
    }

    if (isDirty) {
      replace({ query: newQuery }, undefined, { shallow: true })
    }
  }, [category, replace, query])

  const isMobileView = useBreakpointValue({ base: true, sm: false })

  const [expended, setExpended] = useState<number | number[]>([])

  useEffect(() => {
    setExpended(isMobileView ? [] : [0])
  }, [isMobileView])

  function renderPanel(label: string, children: React.ReactNode) {
    return (
      <AccordionItem>
        {({ isExpanded }) => (
          <>
            <h4>
              <AccordionButton>
                <Text flex="1" textAlign="left">
                  {label}
                </Text>
                {isExpanded ? <FiMinus /> : <FiPlus />}
              </AccordionButton>
            </h4>
            <AccordionPanel>{children}</AccordionPanel>
          </>
        )}
      </AccordionItem>
    )
  }

  return (
    <Layout>
      <HeadMeta
        subtitle="Explore Collections"
        description="Access to massive collections of BNB Chain NFTs, GameFi, DeFi and Metaverse assets.\"
      />
      <MarketNav />
      <Grid
        templateRows="auto 1fr"
        templateColumns={{ sm: '300px 1fr' }}
        gap={8}
        mx={layout.offsetPadding}
        pr={{ sm: 2 }}
      >
        <GridItem rowSpan={2}>
          <Accordion
            allowToggle
            allowMultiple
            index={expended}
            onChange={setExpended}
            position="sticky"
            top={layout.headerHeight}
            maxH={{ sm: `calc(100vh - ${layout.headerHeight})` }}
            overflowY="auto"
          >
            {renderPanel('Search', <Input value={search} onChange={e => setSearch(e.target.value)} />)}
            {renderPanel('Category', <SelectCategory value={category} onValueChange={setCategory} />)}
          </Accordion>
        </GridItem>
        <GridItem
          position="sticky"
          top="72px"
          py={2}
          zIndex={9}
          bg={transparentize(getColor(theme, 'background'), 0.7)(theme)}
        >
          <Stack direction={{ base: 'column', sm: 'row' }} alignItems="center">
            <Skeleton isLoaded={!isLoading} flexShrink={0}>
              <Text color="primary">{data?.data?.length.toLocaleString(locale)} results</Text>
            </Skeleton>
            <Spacer display={{ base: 'none', sm: 'block' }} />
          </Stack>
        </GridItem>
        <GridItem ref={containerRef}>
          <ReactWindowScroller isGrid>
            {scrollerProps => (
              <FixedSizeGrid<ItemData>
                columnCount={columnCount}
                columnWidth={columnWidth}
                rowCount={rowCount}
                rowHeight={rowHeight}
                height={process.browser ? window.innerHeight : 0}
                width={process.browser ? window.innerWidth : 0}
                itemData={{ items: registered, columnCount, isLoading }}
                overscanRowCount={4}
                {...scrollerProps}
                style={{
                  ...scrollerProps.style,
                  overflow: 'hidden',
                  boxSizing: 'content-box',
                }}
              >
                {Item}
              </FixedSizeGrid>
            )}
          </ReactWindowScroller>
        </GridItem>
      </Grid>
    </Layout>
  )
}

function Item({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { items, columnCount, isLoading } = data

  const index = rowIndex * columnCount + columnIndex

  function render() {
    if (index < items.length) {
      const { chainId = defaultNetwork, erc721Address } = items[index]

      return (
        <Link
          key={`${chainId}-${erc721Address}`}
          href={`/collection/${erc721Address}`}
          variant="container"
          borderRadius="10px"
          overflow="hidden"
          color="primary"
          borderColor="primary"
          borderWidth="1px"
          display="block"
          w="100%"
          h="100%"
        >
          <CollectionCard w="100%" h="100%" collection={items[index]} />
        </Link>
      )
    }

    if (isLoading) {
      return <CollectionCard h="100%" isLoading />
    }
  }

  return (
    <Box p={2} style={style}>
      {render()}
    </Box>
  )
}

function CollectionCard({
  collection,
  isLoading,
  ...props
}: { collection?: Collection; isLoading?: boolean } & StackProps) {
  const [coverFromIpfs] = useIpfsImage(collection?.coverImageHash)

  if (isLoading || !collection) return null

  const { collectionName, logoImageHash, logoImageUrl, coverImageUrl, description, isVerified, owner } = collection
  const coverImage = coverImageUrl || coverFromIpfs
  const logoImage = logoImageUrl || logoImageHash

  return (
    <Stack spacing={0} align="center" {...props}>
      <Box w="100%" h="57.5%" pos="relative" mb="24px">
        <Box
          w="100%"
          h="100%"
          overflow="hidden"
          bg={`url(${coverImage}),grey`}
          bgRepeat="no-repeat"
          bgSize="contain"
          bgPos="center"
        />
        <Box
          w="48px"
          h="48px"
          pos="absolute"
          bottom="-24px"
          left="50%"
          ml="-24px"
          borderRadius="24px"
          borderColor="primary"
          borderWidth="1px"
          overflow="hidden"
        >
          <Image src={logoImage} />
        </Box>
      </Box>
      <Stack p={2} flexGrow={1} align="center">
        <Stack direction="row" alignItems="center" p={2}>
          <Text color="currentcolor" isTruncated noOfLines={1} fontWeight="medium">
            {collectionName}
          </Text>
          {isVerified && (
            <Center bg="#C07DFE" w="16px" h="16px" borderRadius="16px">
              <Icon as={CheckIcon} color="white" w="10px" h="10px" />
            </Center>
          )}
        </Stack>
        {description && (
          <Text color="currentcolor" isTruncated noOfLines={3} whiteSpace="break-spaces" fontSize="sm" align="center">
            {description}
          </Text>
        )}
        <Spacer />
        {owner && (
          <Stack direction="row" fontSize="xs" justify="center" mt={3}>
            <Text color="#89A1A1">by</Text>
            <Text color="#C07DFE">{owner.slice(0, 6)}</Text>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
