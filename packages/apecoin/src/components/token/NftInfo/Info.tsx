import { Stack, Text } from '@chakra-ui/layout'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId, Collection, TokenType } from '@x/models/dist'
import { getChainName } from '@x/constants'
import Address from 'components/Address'
import { useRouter } from 'next/router'
import { HStack, useBreakpointValue } from '@chakra-ui/react'
import text from '../../../theme/components/Text'

const breakpoint = 'lg'

interface InfoProps {
  collection?: Collection
  chainId: ChainId
  tokenId: BigNumberish
  contractAddress: string
  tokenType?: TokenType
}

function Info({ collection, chainId, tokenId, contractAddress, tokenType = TokenType.Erc721 }: InfoProps) {
  const { locale } = useRouter()
  const royalty = collection ? `${collection.royalty}%` : '-'

  const textVariant = useBreakpointValue({ base: 'body2', [breakpoint]: 'body1' })

  const stats = [
    {
      title: 'Contract Address',
      value: (
        <Address type="address" chainId={chainId} color="primary" variant={textVariant}>
          {contractAddress}
        </Address>
      ),
    },
    {
      title: 'Token ID',
      value: `#${tokenId.toString()}`,
    },
    {
      title: 'Token Standard',
      value: `ERC-${tokenType}`,
    },
    {
      title: 'Blockchain',
      value: getChainName(chainId),
    },
    {
      title: 'Creator Royalties',
      value: royalty,
    },
    {
      title: 'Collection Size',
      value: collection?.supply?.toLocaleString(locale) || '-',
      ignore: tokenType === TokenType.Erc1155,
    },
    // {
    //   title: 'Owned',
    //   value: '-',
    // },
    // {
    //   title: 'Minted',
    //   value: '#########',
    // },
  ]

  return (
    <Stack spacing={3}>
      {stats
        .filter(s => !s.ignore)
        .map(s => (
          <HStack key={s.title} justifyContent="space-between" pb={3} borderBottom="1px solid" borderBottomColor="bg2">
            <Text color="textSecondary" variant={textVariant}>
              {s.title}
            </Text>
            <Text variant={textVariant}>{s.value}</Text>
          </HStack>
        ))}
    </Stack>
  )
}

export default Info
