import { Box, BoxProps, Stack, Text } from '@chakra-ui/layout'
import { SkeletonText, SkeletonCircle } from '@chakra-ui/skeleton'
import ChainIcon from 'components/ChainIcon'
import GradientBox from 'components/GradientBox'
import Image from 'components/Image'
import { Collection } from '@x/models'
import { defaultNetwork } from '@x/constants'

export interface CollectionCardProps extends BoxProps {
  collection?: Collection
  dark?: boolean
  isLoading?: boolean
}

export default function CollectionCard({ collection, dark, isLoading, ...props }: CollectionCardProps) {
  return (
    <Stack pos="relative" bg={dark ? '#696B79' : 'white'} borderRadius="12px" overflow="hidden" {...props}>
      <Image
        pos="relative"
        w="100%"
        flexGrow={1}
        borderRadius="4px"
        overflow="hidden"
        src={collection?.logoImageUrl || collection?.logoImageHash}
      >
        {data => (
          <>
            <GradientBox w="100%" h="100%" pos="absolute" top={0} left={0} />
            <Box
              w="100%"
              h="100%"
              pos="absolute"
              top={0}
              left={0}
              bg={`url(${data})`}
              bgSize="contain"
              bgPos="center center"
              bgRepeat="no-repeat"
            />
          </>
        )}
      </Image>
      <Stack w="100%" h="160px" color={dark ? 'text' : 'background'} align="center" p={4}>
        <Stack direction="row" align="center" spacing={2}>
          <SkeletonCircle h="22px" w="22px" isLoaded={!isLoading}>
            <ChainIcon h="100%" chainId={collection?.chainId || defaultNetwork} />
          </SkeletonCircle>
          <SkeletonText w={isLoading ? '100px' : void 0} isLoaded={!isLoading} noOfLines={1}>
            <Text color="currentcolor" fontSize="lg" fontWeight="bold" isTruncated noOfLines={1} whiteSpace="pre-wrap">
              {collection?.collectionName}
            </Text>
          </SkeletonText>
        </Stack>
        <SkeletonText minH="100px" w={isLoading ? '80%' : void 0} maxW="80%" isLoaded={!isLoading}>
          <Text color="currentcolor" fontSize="xs" align="justify" isTruncated noOfLines={4} whiteSpace="pre-wrap">
            {collection?.description}
          </Text>
        </SkeletonText>
      </Stack>
    </Stack>
  )
}
