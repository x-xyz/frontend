import { Box, Flex, Stack, Text } from '@chakra-ui/layout'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId, Collection, TokenType } from '@x/models/dist'
import { getChainName } from '@x/constants'
import Address from 'components/Address'
import { useRouter } from 'next/router'

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

  const stats = [
    // {
    //   title: 'Minted',
    //   value: '#########',
    // },
    {
      title: 'Collection Size',
      value: collection?.supply?.toLocaleString(locale) || '-',
      ignore: tokenType === TokenType.Erc1155,
    },
    // {
    //   title: 'Owned',
    //   value: '-',
    // },
    {
      title: 'Creator Royalties',
      value: royalty,
    },
    {
      title: 'Blockchain',
      value: getChainName(chainId),
    },
    {
      title: 'Token ID',
      value: `#${tokenId.toString()}`,
    },
    {
      title: 'Contract Address',
      value: (
        <Address type="address" chainId={chainId}>
          {contractAddress}
        </Address>
      ),
    },
    {
      title: 'Token Standard',
      value: `ERC-${tokenType}`,
    },
  ]

  return (
    <Box p={5} border="1px solid" borderColor="divider" background="panel">
      <Flex flexWrap="wrap" mt={-5}>
        {stats
          .filter(s => !s.ignore)
          .map((s, idx) => (
            <Stack key={idx} width="33.33%" flex="0 0 auto" spacing={1} mt={5}>
              <Text fontWeight="bold" fontSize="xs" color="note" whiteSpace="nowrap">
                {s.title}
              </Text>
              <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap">
                {s.value}
              </Text>
            </Stack>
          ))}
      </Flex>
    </Box>
  )
}

export default Info
