import DraggableItem from 'components/token/v3/NftList.v2/DraggableItem'
import DraggableList from 'components/token/v3/NftList.v2/DraggableList'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import Nav from 'components/v3/Nav'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDrop } from 'react-dnd'
import { useForm } from 'react-hook-form'
import { useInfiniteQuery } from 'react-query'

import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  FlexProps,
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Text,
  useCallbackRef,
} from '@chakra-ui/react'
import { fetchTokens } from '@x/apis/fn'
import { useAuthToken } from '@x/hooks'
import { Account, Folder, NftItem, NftItemId, SearchTokenV2Params, TokenV2SortOption } from '@x/models'

export interface ManageFolderLogicProps {
  account: Account
  folder?: Folder
  folderNfts?: NftItem[]
  submit: (data: FormData) => Promise<void>
  actions?: React.ReactNode
  submitLabel: string
}

export interface FormData {
  name: string
  isPrivate: boolean
  nfts: NftItemId[]
}

const batchSize = 10

export default function ManageFolderLogic({
  account,
  folder,
  folderNfts: initialFolderNfts = [],
  submit,
  actions,
  submitLabel,
}: ManageFolderLogicProps) {
  const selectNftsToAdd = useRef<HTMLAnchorElement>(null)

  const [authToken] = useAuthToken()

  const [filter, setFilter] = useState<SearchTokenV2Params>()
  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.CreatedAtDesc)

  const {
    data: searchResult,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ['tokens-folder', { ...filter, sortBy, belongsTo: account.address, authToken, limit: batchSize }],
    fetchTokens,
    {
      getNextPageParam: (lastPage, pages) => {
        const loaded = pages.length * batchSize
        if (lastPage.data.count > loaded) return loaded
      },
    },
  )

  const totalCount = useMemo(
    () => searchResult?.pages && searchResult.pages[searchResult.pages.length - 1].data.count,
    [searchResult],
  )

  const defaultFolderName = useMemo(() => {
    if (!folder) return ''
    if (folder.isPrivate && folder.isBuiltIn) return 'Private NFTs'
    return folder.name
  }, [folder])

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting, errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { name: defaultFolderName, isPrivate: folder?.isPrivate, nfts: initialFolderNfts.map(toNftItemId) },
  })

  // nfts which selected to put into this folder
  const [folderNfts, setFolderNfts] = useState<NftItem[]>(initialFolderNfts)

  // rest nfts which not be selected to put into this folder
  const restNfts = useMemo(() => {
    if (!searchResult) return []
    const selectedMap = folderNfts.reduce(
      (map, item) => ({ ...map, [itemKey(item)]: true }),
      {} as Record<string, boolean>,
    )
    return searchResult.pages.reduce((acc, { data: { items } }) => {
      items = items || []
      return acc.concat(items.filter(item => !selectedMap[itemKey(item)]))
    }, [] as NftItem[])
  }, [searchResult, folderNfts])

  useEffect(() => setValue('nfts', folderNfts.map(toNftItemId), { shouldDirty: true }), [folderNfts, setValue])

  const [selecteds, setSelecteds] = useState<NftItem[]>([])

  const onSelectItem = useCallback((item: NftItem, selected: boolean) => {
    setSelecteds(prev => {
      const index = prev.indexOf(item)

      if (selected) {
        if (index === -1) return [...prev, item]
      } else {
        if (index >= 0) return [...prev.slice(0, index), ...prev.slice(index + 1)]
      }

      return prev
    })
  }, [])

  const onSelectAllRestNfts = useCallbackRef(() => setSelecteds(restNfts), [restNfts])
  const onSelectAllFolderNfts = useCallbackRef(() => setSelecteds(folderNfts), [folderNfts])
  const onUnselectAll = useCallbackRef(() => setSelecteds([]), [])
  const onAddSelected = useCallbackRef(() => {
    setFolderNfts(prev => {
      const map = prev.reduce((map, item) => ({ ...map, [itemKey(item)]: true }), {} as Record<string, boolean>)
      const next = [...prev]
      for (const item of selecteds) !map[itemKey(item)] && next.push(item)
      return next
    })
    setSelecteds([])
  }, [selecteds])
  const onRemoveSelected = useCallbackRef(() => {
    setFolderNfts(prev => {
      const map = selecteds.reduce((map, item) => ({ ...map, [itemKey(item)]: true }), {} as Record<string, boolean>)
      const next = []
      for (const item of prev) !map[itemKey(item)] && next.push(item)
      return next
    })
    setSelecteds([])
  }, [selecteds])

  function renderItem(item: NftItem) {
    return (
      <DraggableItem
        key={itemKey(item)}
        item={item}
        m="5px"
        selectable
        selected={selecteds.includes(item)}
        onSelectItem={onSelectItem}
      />
    )
  }

  const onSubmit = handleSubmit(submit)

  return (
    <>
      <Container maxW="container.xl" pt={5}>
        <Text color="note">Please be aware, folder customizations will not move or delete NFTs on the blockchain.</Text>
        <Text color="note">Changes you make will only impact your front end experience.</Text>
        <Stack direction="row" align="center" mt={5}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel color="note" fontSize="xs" fontWeight="bold">
              Folder Name & Privacy
            </FormLabel>
            <Stack spacing={4}>
              <Input
                maxW="380px"
                {...register('name', { required: true })}
                bg="#1d1d1d"
                placeholder="Folder Name"
                disabled={folder?.isBuiltIn}
              />
              <RadioGroup
                variant="default"
                value={watch('isPrivate') ? 'true' : 'false'}
                onChange={v => setValue('isPrivate', v === 'true', { shouldDirty: true })}
                isDisabled={folder?.isBuiltIn}
              >
                <Stack direction="row" spacing={4}>
                  <Radio value="false">
                    <Badge variant="tag" bg="#40e55b">
                      Public
                    </Badge>
                  </Radio>
                  <Radio value="true">
                    <Badge variant="tag">Private</Badge>
                  </Radio>
                </Stack>
              </RadioGroup>
            </Stack>
          </FormControl>
          <Spacer />
          <Stack direction="row" pb={3} spacing={4}>
            <Button onClick={onSubmit} disabled={!isValid || !isDirty || isSubmitting} isLoading={isSubmitting}>
              {submitLabel}
            </Button>
            {actions}
          </Stack>
        </Stack>
      </Container>
      <Nav.Bar>
        <Nav.Item isActive>
          <Text px={5}>Folder Contents</Text>
        </Nav.Item>
      </Nav.Bar>
      <Container maxW="container.xl" px={0}>
        <Stack direction="row" px={5} mt={5} mb={10}>
          <Menu>
            <MenuButton as={Button}>
              Remove NFT <TriangleDownIcon pos="relative" top={-0.5} left={2} w={2} color="primary" />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onSelectAllFolderNfts}>Select All</MenuItem>
              <MenuItem onClick={onUnselectAll}>Unselect All</MenuItem>
            </MenuList>
          </Menu>
          <Button onClick={onRemoveSelected}>Remove Selected</Button>
          <Button
            onClick={() => {
              selectNftsToAdd.current?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Select NFTs
          </Button>
        </Stack>
        <Box border="1px solid" borderColor="divider" p={5} pl="15px" pt="15px" w="full" h="360px" bg="#2d3132">
          <DroppableBox<NftItem>
            accept={['nft']}
            onItemDrop={item => setFolderNfts(prev => [...new Set([...prev, item])])}
            wrap="wrap"
            alignContent="flex-start"
            overflowY="auto"
            h="100%"
          >
            {folderNfts.length > 0 ? (
              folderNfts.map(renderItem)
            ) : (
              <Text color="note" fontSize="4xl">
                Please Select or Drag the NFTs you would like to include to this area.
              </Text>
            )}
          </DroppableBox>
        </Box>
      </Container>
      <Nav.Bar>
        <a ref={selectNftsToAdd}>
          <Nav.Item as="span" isActive>
            <Text px={5}>Select NFT to add</Text>
          </Nav.Item>
        </a>
      </Nav.Bar>
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={totalCount}
        isLoading={isLoading}
        hideFilters={['belongsTo']}
        appendChildren={
          <>
            <Menu>
              <MenuButton as={Button}>
                Add NFT <TriangleDownIcon pos="relative" top={-0.5} left={2} w={2} color="primary" />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onSelectAllRestNfts}>Select All</MenuItem>
                <MenuItem onClick={onUnselectAll}>Unselect All</MenuItem>
              </MenuList>
            </Menu>
            <Button onClick={onAddSelected}>Add Selected</Button>
          </>
        }
      />
      <Center>
        <DroppableBox<NftItem>
          w="full"
          accept={['nft']}
          onItemDrop={item =>
            setFolderNfts(prev => {
              const index = prev.findIndex(i => itemKey(i) === itemKey(item))
              return [...prev.slice(0, index), ...prev.slice(index + 1)]
            })
          }
        >
          <DraggableList
            w="full"
            h="full"
            items={restNfts}
            isLoading={isLoading}
            hasMore={hasNextPage}
            onLoadMore={fetchNextPage}
            selectable
            selectedItems={selecteds}
            onSelectItem={onSelectItem}
          />
        </DroppableBox>
      </Center>
    </>
  )
}

interface DroppableBoxProps<T> extends FlexProps {
  accept: (string | symbol)[]
  onItemDrop?: (item: T) => void
}

function DroppableBox<T>({ accept, children, onItemDrop, ...props }: DroppableBoxProps<T>) {
  const [{ isOver, canDrop }, ref] = useDrop({
    accept,
    drop: onItemDrop,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  return (
    <Flex ref={ref} {...props} backgroundColor={isOver && canDrop ? 'reaction' : props.backgroundColor}>
      {children}
    </Flex>
  )
}

function itemKey(item: NftItem) {
  return `${item.chainId}:${item.contractAddress}:${item.tokenId}`
}

function toNftItemId({ chainId, contractAddress, tokenId }: NftItem): NftItemId {
  return { chainId, contractAddress, tokenId }
}
