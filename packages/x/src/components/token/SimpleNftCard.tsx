import Media from 'components/Media'
import { forwardRef } from 'react'
import { useQuery } from 'react-query'

import { AspectRatio, Box, BoxProps, Checkbox, SkeletonText, Spacer, Stack, useCallbackRef } from '@chakra-ui/react'
import { fetchCollectionV2 } from '@x/apis/fn'
import { findToken, getChain } from '@x/constants'
import { Collection, NftItem } from '@x/models'

export interface SimpleNftCardProps extends BoxProps {
  item?: NftItem
  collection?: Collection
  selectable?: boolean
  selected?: boolean
  onSelectItem?: (item: NftItem, selected: boolean) => void
  price?: number
  paymentToken?: string
  imageSize?: BoxProps['w']
  hidePrice?: boolean
}

export default forwardRef<HTMLDivElement, SimpleNftCardProps>(function SimpleNftCard(
  {
    item,
    collection: initialCollection,
    selectable,
    selected,
    onSelectItem,
    price,
    paymentToken,
    imageSize = '80px',
    hidePrice,
    ...props
  },
  ref,
) {
  const { data: collection = initialCollection, isLoading } = useQuery(
    ['collection', item?.chainId || 0, item?.contractAddress || ''],
    fetchCollectionV2,
    { enabled: !!item },
  )

  const onChange = useCallbackRef(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (item) onSelectItem?.(item, e.target.checked)
    },
    [onSelectItem, item],
  )

  function renderPrice() {
    let displayPrice = 0
    let displayUnit = 'ETH'

    if (price && paymentToken) {
      displayPrice = price
      displayUnit = findToken(paymentToken, item?.chainId)?.symbol || 'ETH'
    } else if (item) {
      displayPrice = item.price || 0
      displayUnit = findToken(item.paymentToken, item.chainId)?.symbol || getChain(item.chainId).nativeCurrency.symbol
    }

    return `${displayPrice} ${displayUnit}`
  }

  function renderContent() {
    return (
      <Stack direction="row" w="full">
        <AspectRatio ratio={1} w={imageSize} h={imageSize} flexShrink={0} overflow="hidden">
          <Media
            contentType={item?.animationUrlContentType || item?.contentType}
            mimetype={item?.animationUrlMimeType}
            src={item?.hostedAnimationUrl || item?.animationUrl || item?.hostedImageUrl || item?.imageUrl}
            isLoading={!item}
            w="full"
            h="full"
          />
        </AspectRatio>
        <Stack spacing={0} flexGrow={1}>
          <SkeletonText noOfLines={1} isLoaded={!isLoading} fontSize="sm" fontWeight="bold">
            {collection?.collectionName}
          </SkeletonText>
          <SkeletonText noOfLines={1} isLoaded={!!item} fontSize="xs" fontWeight="bold" color="note">
            {item?.name}
          </SkeletonText>
          {item?.balance && (
            <SkeletonText noOfLines={1} isLoaded={!!item} fontSize="xs" fontWeight="bold" color="value">
              You own: {item.balance}
            </SkeletonText>
          )}
          <Spacer />
          <SkeletonText noOfLines={1} isLoaded={!!item} textAlign="right">
            {!hidePrice && renderPrice()}
          </SkeletonText>
        </Stack>
      </Stack>
    )
  }

  function render() {
    if (!selectable) return renderContent()
    return (
      <Checkbox variant="container" w="full" h="full" isChecked={selected} onChange={onChange}>
        {renderContent()}
      </Checkbox>
    )
  }

  return (
    <Box
      ref={ref}
      border="1px solid"
      borderColor="divider"
      bg="panel"
      w="360px"
      h="100px"
      p={2}
      pos="relative"
      cursor="grab"
      {...props}
    >
      {render()}
    </Box>
  )
})
