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
    <Stack w="360px" bg="panel" border="1px solid" borderColor="divider" spacing={0} {...props}>
      <Link href={collection && collectionUrl(collection)}>
        <Center w="full" h="360px" borderBottom="1px solid" borderColor="divider">
          <Image src={collection?.logoImageUrl || collection?.logoImageHash} isLoaded={!!collection} />
        </Center>
      </Link>
      <Stack px={5} py={4} spacing={5}>
        <Stack direction="row" align="center" spacing={1}>
          <Link href={collection && collectionUrl(collection)}>
            <Skeleton fontWeight="bold" minW="40%" isLoaded={!!collection}>
              {collection?.collectionName}
            </Skeleton>
          </Link>
          <Spacer />
          {count && (
            <>
              <Text color="divider">{count}</Text>
              <StackIcon color="divider" w={4} h={4} />
            </>
          )}
        </Stack>
        <SkeletonText h="5rem" isLoaded={!!collection}>
          <Text as={Markdown} color="note" isTruncated noOfLines={3} whiteSpace="break-spaces">
            {collection?.description.replace(/\n/g, ' ')}
          </Text>
        </SkeletonText>
        <Stack direction="row" align="center">
          {collection?.owner ? (
            <AccountAvatar account={collection.owner} w="30px" h="30px" isLoaded={!!collection} />
          ) : (
            <Box h="30px" />
          )}
          <SkeletonText w="40%" noOfLines={1} isLoaded={!isLoading && !!collection}>
            {data?.alias ? (
              <Text fontSize="sm" fontWeight="bold">
                {data?.alias}
              </Text>
            ) : (
              <Address fontSize="sm" fallback="Not found" type="account">
                {collection?.owner}
              </Address>
            )}
          </SkeletonText>
        </Stack>
        <Stack direction="row" spacing={0} align="center">
          <SkeletonCircle
            as={Center}
            w="30px"
            h="30px"
            borderRadius="15px"
            overflow="hidden"
            bg="reaction"
            flexShrink={0}
            isLoaded={!!collection}
          >
            {collection && <ChainIcon chainId={collection.chainId} />}
          </SkeletonCircle>
          <Divider />
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
            {collection && (
              <Link color="primary" href={collection && collectionUrl(collection)} pb={3}>
                View
              </Link>
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
