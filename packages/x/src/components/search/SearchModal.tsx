import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Center,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useLazySearchQuery } from '@x/apis'
import { getChainNameForUrl } from '@x/constants'
import { useDebouncedValue } from '@x/hooks'
import { shortenAddress } from '@x/utils'

import ResultGroup from './ResultGroup'
import { FormData, Group } from './types'

export type SearchModalProps = Omit<ModalProps, 'children'>

export default function SearchModal(props: SearchModalProps) {
  const [search, { data, isLoading, isFetching }] = useLazySearchQuery()

  const { register, watch } = useForm<FormData>({ mode: 'onChange' })

  const keyword = useDebouncedValue(watch('keyword'), 500)

  const [groups, setGroups] = useState<Group[]>([])

  const count = useMemo(() => groups.reduce((acc, group) => acc + (group.options?.length || 0), 0), [groups])

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
          icon: account.imageUrl ||account.imageHash,
        })),
      },
    ])
  }, [data, keyword])

  function renderGroup(group: Group) {
    return <ResultGroup key={group.label} group={group} border="1px solid" borderColor="divider" />
  }

  function render() {
    if (isLoading || isFetching)
      return (
        <Center h={8}>
          <Spinner />
        </Center>
      )

    if (count === 0) return <Center h={8}>No result</Center>

    return groups.filter(group => !!group.options?.length).map(renderGroup)
  }

  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <form>
            <Input {...register('keyword')} />
          </form>
        </ModalHeader>
        <ModalBody>{render()}</ModalBody>
        {/* <ModalFooter>
          <Button w="full">All Results</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  )
}
