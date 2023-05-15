import AppliedTokenFilters from 'components/filters/AppliedTokenFilters'
import AppliedTokenSortor from 'components/filters/AppliedTokenSortor'
import TokenFilters, { TokenFiltersProps } from 'components/filters/TokenFilters'
import TokenSortor from 'components/filters/TokenSortor'
import { useRouter } from 'next/router'

import { Badge, Container, Flex, SkeletonText, Stack } from '@chakra-ui/react'
import { Collection } from '@x/models'
import { tokensv2, useAppSelector } from '@x/store/dist'

export interface NftListHeaderProps {
  tokenV2Id: string
  collection?: Collection
  hideFilters?: TokenFiltersProps['hideFilters']
  collectionWhitelist?: TokenFiltersProps['collectionWhitelist']
  useSignalCollectionSelector?: TokenFiltersProps['useSignalCollectionSelector']
}

export default function NftListHeader({
  tokenV2Id,
  collection,
  hideFilters,
  collectionWhitelist,
  useSignalCollectionSelector,
}: NftListHeaderProps) {
  const { locale } = useRouter()
  const total = useAppSelector(tokensv2.selectors.total(tokenV2Id))
  const isLoading = useAppSelector(tokensv2.selectors.isLoading(tokenV2Id))
  return (
    <Container maxW="container.xl">
      <Flex direction="row" py={5} wrap="wrap" justify="center" sx={{ '&>*': { mx: 2.5, mb: 5 } }}>
        <TokenFilters
          id={tokenV2Id}
          collection={collection}
          hideFilters={hideFilters}
          collectionWhitelist={collectionWhitelist}
          useSignalCollectionSelector={useSignalCollectionSelector}
        />
        <TokenSortor id={tokenV2Id} />
        <AppliedTokenSortor id={tokenV2Id} />
        <Badge>
          <SkeletonText mr={1} noOfLines={1} isLoaded={!isLoading}>
            {total.toLocaleString(locale)}
          </SkeletonText>
          Results
        </Badge>
      </Flex>
      <Stack direction="row" pb={10}>
        <AppliedTokenFilters id={tokenV2Id} hideFilters={hideFilters} collectionWhitelist={collectionWhitelist} />
      </Stack>
    </Container>
  )
}
