import { Input, InputGroup, InputGroupProps, InputRightElement } from '@chakra-ui/input'
import { Center, List, ListItem, Stack, Text } from '@chakra-ui/layout'
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/popover'
import { Portal } from '@chakra-ui/portal'
import { Spinner } from '@chakra-ui/spinner'
import { useDebouncedValue } from '@x/hooks'
import { useEffect, useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { useLazySearchQuery } from '@x/apis'
import { shortenAddress } from '@x/utils'
import Link from './Link'
import Image from './Image'

interface Option {
  key: string
  label: React.ReactNode
  url: string
  icon?: string
}

interface Group {
  label: string
  options?: Option[]
}

interface FormData {
  keyword: string
}

export default function Searchbar(props: InputGroupProps) {
  const { register, watch } = useForm<FormData>({ mode: 'onChange' })

  const keywordProps = register('keyword')

  const [search, { data, isLoading }] = useLazySearchQuery()

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
        label: 'Accounts',
        options: data.data?.accounts?.map(account => ({
          key: account.address,
          label: (
            <Stack spacing={0}>
              <Text>{account.alias}</Text>
              <Text>{shortenAddress(account.address)}</Text>
            </Stack>
          ),
          url: `/account/${account.address}`,
          icon: account.imageHash,
        })),
      },
      {
        label: 'Collection',
        options: data.data?.collections?.map(collection => ({
          key: collection.erc721Address,
          label: collection.collectionName,
          url: `/assets?collections=${collection.erc721Address}`,
          icon: collection.logoImageHash,
        })),
      },
      {
        label: 'NFT',
        options: data.data?.tokens?.map(token => ({
          key: `${token.contract}-${token.tokenId}`,
          label: token.name,
          url: `/asset/${token.contract}/${token.tokenId}`,
          icon: token.hostedImageUrl || token.imageUrl,
        })),
      },
    ])
  }, [data, keyword])

  function renderGroup({ label, options }: Group) {
    if (!options || options.length === 0) return

    return (
      <Stack key={label} mt={6}>
        <Text px={3} borderTopWidth="1px" borderBottomWidth="1px" borderColor="divider">
          {label}
        </Text>
        <List>{options.map(renderOption)}</List>
      </Stack>
    )
  }

  function renderOption({ key, label, url, icon }: Option) {
    return (
      <ListItem key={key}>
        <Link p={3} href={url} display="flex" flexDirection="row" w="100%" alignItems="center" _hover={{ bg: 'panel' }}>
          <Stack direction="row" alignItems="center">
            {icon && <Image src={icon} w={12} h={12} />}
            {typeof label === 'string' ? <Text>{label}</Text> : label}
          </Stack>
        </Link>
      </ListItem>
    )
  }

  return (
    <Popover autoFocus={false} isLazy returnFocusOnClose closeOnBlur closeOnEsc isOpen={debouncedIsOpen}>
      <PopoverTrigger>
        <InputGroup {...props}>
          <Input
            variant="solid"
            placeholder="Search"
            autoComplete="off"
            {...keywordProps}
            onFocus={() => setFocus(true)}
            onBlur={e => {
              keywordProps.onBlur(e)
              setFocus(false)
            }}
          />
          <InputRightElement>{isLoading ? <Spinner /> : <FiSearch color="#A2A6B8" />}</InputRightElement>
        </InputGroup>
      </PopoverTrigger>

      <Portal>
        <PopoverContent onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
          <PopoverArrow />
          <PopoverCloseButton
            onClick={() => {
              setOpen(false)
              setFocus(false)
            }}
          />
          <PopoverBody>
            {groups.map(renderGroup)}
            {count === 0 && <Center h={8}>{isLoading ? <Spinner /> : 'No result'}</Center>}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
