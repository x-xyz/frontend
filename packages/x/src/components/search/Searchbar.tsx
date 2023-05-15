import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiSearch } from 'react-icons/fi'

import { Input, InputGroup, InputGroupProps, InputLeftElement, InputRightElement } from '@chakra-ui/input'
import { Box, Center, Stack, Text } from '@chakra-ui/layout'
import { Popover, PopoverBody, PopoverContent, PopoverTrigger } from '@chakra-ui/popover'
import { Spinner } from '@chakra-ui/spinner'
import { useLazySearchQuery } from '@x/apis'
import { getChainNameForUrl } from '@x/constants'
import { useDebouncedValue } from '@x/hooks'
import { shortenAddress } from '@x/utils'

import ResultGroup from './ResultGroup'
import { Group, FormData } from './types'

export default function Searchbar(props: InputGroupProps) {
  const { register, watch } = useForm<FormData>({ mode: 'onChange' })

  const keywordProps = register('keyword')

  const [search, { data, isLoading, isFetching }] = useLazySearchQuery()

  const keyword = useDebouncedValue(watch('keyword'), 500)

  const [groups, setGroups] = useState<Group[]>([])

  const count = useMemo(() => groups.reduce((acc, group) => acc + (group.options?.length || 0), 0), [groups])

  const [isOpen, setOpen] = useState(false)

  const [isFocus, setFocus] = useState(false)

  const debouncedIsOpen = useDebouncedValue(isOpen, 50)

  useEffect(() => {
    setOpen(isFocus)
  }, [isFocus])

  useEffect(() => {
    if (keyword) search({ keyword })
    else setGroups([])
  }, [keyword, search])

  useEffect(() => {
    if (!keyword || !data?.data) {
      setGroups([])
      return
    }

    setGroups([
      {
        label: 'Collection',
        options: data.data?.collections?.slice(0, 3).map(collection => ({
          key: collection.erc721Address,
          label: collection.collectionName,
          url: `/collection/${getChainNameForUrl(collection.chainId)}/${collection.erc721Address}`,
          icon: collection.logoImageUrl || collection.logoImageHash,
          labelRight: (
            <Text fontSize="sm" color="value">
              {collection.supply}
            </Text>
          ),
        })),
        titleRight: <Text color="note">Items</Text>,
      },
      {
        label: 'NFT',
        options: data.data?.tokens?.slice(0, 3).map(token => ({
          key: `${token.contract}-${token.tokenId}`,
          label: token.name,
          url: `/asset/${getChainNameForUrl(token.chainId)}/${token.contract}/${token.tokenId}`,
          icon: token.hostedImageUrl || token.imageUrl,
        })),
      },
      {
        label: 'User',
        options: data.data?.accounts?.slice(0, 3).map(account => ({
          key: account.address,
          label: (
            <Stack spacing={0}>
              <Text>{account.alias}</Text>
              <Text>{shortenAddress(account.address)}</Text>
            </Stack>
          ),
          url: `/account/${account.address}`,
          icon: account.imageUrl || account.imageHash,
        })),
      },
    ])
  }, [data, keyword])

  function renderGroup(group: Group) {
    return <ResultGroup key={group.label} group={group} />
  }

  function render() {
    if (isLoading || isFetching)
      return (
        <Center h={8}>
          <Spinner />
        </Center>
      )

    if (count === 0) return <Center h={8}>No result</Center>

    return (
      <>
        {groups.filter(group => !!group.options?.length).map(renderGroup)}
        {/*<Center p={3}>*/}
        {/*  <Button>All Results</Button>*/}
        {/*</Center>*/}
      </>
    )
  }

  return (
    <Box pos="relative" w="full" maxW="380px">
      <Popover autoFocus={false} isLazy returnFocusOnClose closeOnBlur closeOnEsc isOpen={debouncedIsOpen} matchWidth>
        <PopoverTrigger>
          <InputGroup {...props}>
            <InputLeftElement>
              <FiSearch color="#A2A6B8" />
            </InputLeftElement>
            <Input
              placeholder="Collection, NFT or User"
              autoComplete="off"
              {...keywordProps}
              onFocus={() => setFocus(true)}
              onBlur={e => {
                keywordProps.onBlur(e)
                setFocus(false)
              }}
            />
            {(isLoading || isFetching) && (
              <InputRightElement>
                <Spinner />
              </InputRightElement>
            )}
          </InputGroup>
        </PopoverTrigger>

        {/* <Portal> */}
        <PopoverContent w="full" onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
          <PopoverBody>{render()}</PopoverBody>
        </PopoverContent>
        {/* </Portal> */}
      </Popover>
    </Box>
  )
}
