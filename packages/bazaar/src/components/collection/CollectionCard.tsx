import { AspectRatio, Box, Grid, GridItem, GridItemProps, Stack, StackProps, Text } from '@chakra-ui/layout'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { Tooltip } from '@chakra-ui/tooltip'
import { BscScanIcon } from '@x/components/icons'
import { Collection } from '@x/models'
import Address from 'components/Address'
import Image from 'components/Image'
import Link from 'components/Link'
import SocialIcons from './SocialIcons'
import { defaultNetwork, getChain } from '@x/constants'

const chainMetadata = getChain(defaultNetwork)

export interface CollectionCardProps extends StackProps {
  collection?: Collection
  isLoading?: boolean
}

export default function CollectionCard({ collection, ...props }: CollectionCardProps) {
  function renderInfo() {
    return (
      <Stack direction={{ base: 'row', md: 'column' }} spacing={{ base: 4, md: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Image
            w="64px"
            h="64px"
            borderRadius="50%"
            src={collection?.logoImageUrl || collection?.logoImageHash}
            overflow="hidden"
            flexShrink={0}
          />
          <SocialIcons display={{ base: 'none', md: 'flex' }} collection={collection} />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Text
            color="currentColor"
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight="bold"
            isTruncated
            noOfLines={1}
            whiteSpace="pre-wrap"
          >
            {collection?.collectionName}
          </Text>

          {collection?.isVerified && (
            <Tooltip
              hasArrow
              bg="white"
              borderRadius="6px"
              p={3}
              label="Collections with the Verified mark have been verified as authentic, high-volume, or notable."
            >
              <CheckCircleIcon color="#C07DFE" w={6} h={6} />
            </Tooltip>
          )}
        </Stack>
      </Stack>
    )
  }

  function renderDescription() {
    return (
      <Text
        pt={{ base: 6, md: 3 }}
        color="currentcolor"
        fontWeight={500}
        align="justify"
        isTruncated
        noOfLines={4}
        whiteSpace="pre-wrap"
        lineHeight="18px"
      >
        {collection?.description}
      </Text>
    )
  }

  function renderBscScan() {
    return (
      <Stack direction="row" pt={{ base: '28px', md: '14px' }} spacing={3}>
        <Text color="inactive">Contract:</Text>

        <Link href={`${chainMetadata.blockExplorerUrl}/address/${collection?.erc721Address}`} isExternal>
          <Stack direction="row" spacing={1.5}>
            <Text color="currentcolor" fontWeight={500}>
              View
            </Text>
            <BscScanIcon color="currentColor" w={6} h={6} />
          </Stack>
        </Link>
      </Stack>
    )
  }

  function renderContractOwner() {
    return (
      <Stack direction="row" pt={{ base: 6, md: '18px' }}>
        <Text color="inactive">Contract Owner:</Text>

        <Address color="currentcolor" textTransform="uppercase" fontWeight={500} type="address">
          {collection?.owner || '-'}
        </Address>
      </Stack>
    )
  }

  function renderCoverImage() {
    return (
      <AspectRatio ratio={600 / 400} maxWidth="600px" width="100%">
        <Image w="100%" h="100%" borderRadius="10px" src={collection?.coverImageUrl || collection?.coverImageHash} />
      </AspectRatio>
    )
  }

  function renderTradingInfo() {
    return (
      <Grid
        mt={5}
        templateColumns="repeat(auto-fit, minmax(165px, 1fr))"
        borderRadius="16px"
        outline="1px solid #1C1C1F"
        overflow="hidden"
      >
        <TradingInfoBox title="Assets" value={collection?.supply || '--'} />

        <TradingInfoBox title="Owners" value="--" />
        <TradingInfoBox title="Volume" value="--" showIcon />
        <TradingInfoBox title="Floor Price" value="--" showIcon />
      </Grid>
    )
  }

  return (
    <Stack
      borderRadius="12px"
      direction={{ base: 'column-reverse', md: 'row' }}
      my={{ base: 6, md: '56px' }}
      {...props}
    >
      <Box w="100%" p={4} color="primary">
        {renderInfo()}
        {renderDescription()}
        <SocialIcons display={{ base: 'flex', md: 'none' }} pt={6} collection={collection} />
        {renderContractOwner()}
        {renderBscScan()}

        {renderTradingInfo()}
      </Box>

      {renderCoverImage()}
    </Stack>
  )
}

interface TradingInfoBox extends GridItemProps {
  title: string
  value: string | number
  showIcon?: boolean
}

function TradingInfoBox({ title, value, showIcon, ...props }: TradingInfoBox) {
  return (
    <GridItem p={4} outline="1px solid #1C1C1F" {...props}>
      <Stack>
        <Text color="inactive">{title}</Text>
        <Stack direction="row" alignItems="center">
          {showIcon && <Image src="/assets/bazaar/BNB.png" height="24px" width="24px" />}
          <Text fontSize="3xl" fontWeight="bold" color="primary">
            {value}
          </Text>
        </Stack>
      </Stack>
    </GridItem>
  )
}
