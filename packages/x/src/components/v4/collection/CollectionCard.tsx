import { fetchAccountV2 } from '@x/apis/dist/fn'
import AccountAvatar from 'components/account/AccountAvatar'
import Address from 'components/Address'
import ChainIcon from 'components/ChainIcon'
import Image from 'components/Image'
import Link from 'components/Link'
import Markdown from 'components/Markdown'

import {
  Box,
  Center,
  Divider,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import { getChain, getChainNameForUrl } from '@x/constants'
import { Collection } from '@x/models'
import Price from 'components/v3/Price'
import { useQuery } from 'react-query'
import StackIcon from 'components/icons/StackIcon'

export interface CollectionCardProps extends StackProps {
  collection?: Collection
  hideFloorPrice?: boolean
  collectionUrl?: (collection: Collection) => string
}

export default function CollectionCard({
  collection,
  hideFloorPrice,
  collectionUrl = collection => `/collection/${getChainNameForUrl(collection.chainId)}/${collection.erc721Address}`,
  ...props
}: CollectionCardProps) {
  const { data, isLoading } = useQuery(['account', collection?.owner || ''], fetchAccountV2, {
    enabled: !!collection?.owner,
  })
  const chain = collection && getChain(collection.chainId)
  const count = collection?.holdingBalance || collection?.holdingCount || 0

  return (
    <Stack w="240px" bg="panel" spacing={0} pos="relative" {...props}>
      <Link href={collection && collectionUrl(collection)}>
        <Center w="full" h="240px">
          <Image src={collection?.logoImageUrl || collection?.logoImageHash} isLoaded={!!collection} />
        </Center>
      </Link>
      {collection?.owner && (
        <AccountAvatar
          account={collection.owner}
          pos="absolute"
          top="240px"
          left="16px"
          w="40px"
          h="40px"
          transform="translateY(-50%)"
          isLoaded={!!collection}
        />
      )}
      <Box h="20px" />
      <Stack p={4} spacing={3}>
        <Stack direction="row" align="center" spacing={1}>
          <Box w="full">
            <Link href={collection && collectionUrl(collection)}>
              <Skeleton w="full" isLoaded={!!collection}>
                <Link fontWeight="bold" fontSize="sm" noOfLines={1} href={collection && collectionUrl(collection)}>
                  {collection?.collectionName}
                </Link>
              </Skeleton>
            </Link>
            <Stack direction="row" fontSize="xs" align="center">
              <Text>by</Text>
              <Skeleton isLoaded={!isLoading} h="12px">
                {data?.alias ? (
                  <Link color="primary" href={`/account/${data.address}`}>
                    {data.alias}
                  </Link>
                ) : (
                  <Address color="primary" type="account">{collection?.owner}</Address>
                )}
              </Skeleton>
            </Stack>
          </Box>
          <Spacer />
          {count && (
            <>
              <Text color="divider">{count}</Text>
              <StackIcon color="divider" w={4} h={4} />
            </>
          )}
        </Stack>
        {!hideFloorPrice && (
          <Stack direction="row" align="center">
            <Price
              price={collection?.floorPrice}
              priceInUsd={collection?.usdFloorPrice}
              unit={chain?.nativeCurrency.symbol}
              isLoading={!collection}
            />
            <Spacer />
            <Price
              label="Total Collection Value"
              price={(collection?.floorPrice || 0) * (collection?.supply || 0)}
              priceInUsd={(collection?.usdFloorPrice || 0) * (collection?.supply || 0)}
              unit={chain?.nativeCurrency.symbol}
              isLoading={!collection}
            />
          </Stack>
        )}
        <Stack direction="row" align="center">
          <StackIcon color="divider" w={4} h={4} />
          <Text color="divider">{(collection?.supply || 0).toLocaleString()}</Text>
        </Stack>
      </Stack>
    </Stack>
  )
}
