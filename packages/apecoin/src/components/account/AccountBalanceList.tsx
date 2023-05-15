import { Box, Button, Center, Grid, GridItem, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { findToken, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks/dist'
import { ChainId } from '@x/models'
import DisplayBalance from 'components/erc20/DisplayBalance'
import TokenIcon from 'components/icons/TokenIcon'
import WrapNativeModal from 'components/modal/WrapNativeModal'
import { useMemo } from 'react'

export interface AccountBalanceListProps {
  showConvertButton?: boolean
}

export default function AccountBalanceList({ showConvertButton }: AccountBalanceListProps) {
  const wrapNativeModal = useDisclosure()
  const { chainId } = useActiveWeb3React()
  const nativeToken = useMemo(() => (chainId ? getChain(chainId).nativeCurrency : void 0), [chainId])
  const wrapToken = useMemo(
    () => nativeToken && findToken(`W${nativeToken.symbol}`, nativeToken.chainId),
    [nativeToken],
  )
  const apeToken = useMemo(() => (chainId ? findToken('ape', chainId) : void 0), [chainId])
  return (
    <Box>
      <Text fontSize="xs" mb={5}>
        BALANCE
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" templateRows="repeat(2, 1fr)" rowGap={4}>
        <GridItem fontSize="sm">
          <Stack direction="row" align="center">
            <Box borderColor="#4c4c4c" borderWidth="1px" borderRadius="16px">
              {nativeToken && <TokenIcon tokenId={nativeToken.symbol} chainId={nativeToken.chainId} w={8} />}
            </Box>
            {nativeToken ? <DisplayBalance as="span" display="inline-block" token={nativeToken} /> : '-'}
            <Text>{nativeToken?.symbol}</Text>
          </Stack>
        </GridItem>
        <GridItem fontSize="sm">
          <Stack direction="row" align="center">
            <Box borderColor="#4c4c4c" borderWidth="1px" borderRadius="16px">
              <TokenIcon tokenId="WETH" chainId={ChainId.Ethereum} w={8} />
            </Box>
            {wrapToken ? <DisplayBalance as="span" display="inline-block" token={wrapToken} /> : '-'}
            <Text>{wrapToken?.symbol}</Text>
          </Stack>
        </GridItem>

        <GridItem rowStart={1} rowSpan={2} colStart={2} fontSize="xl" pos="relative">
          {showConvertButton && (
            <>
              <Box pos="absolute" h="50px" w="1px" bg="#4c4c4c" top="50%" left={4} transform="translateY(-50%)">
                <Box pos="absolute" w="16px" h="1px" bg="#4c4c4c" top={0} right={0} />
                <Box pos="absolute" w="16px" h="1px" bg="#4c4c4c" bottom={0} right={0} />
                <Box pos="absolute" w="16px" h="1px" bg="#4c4c4c" top="50%" left={0} />
              </Box>
              <Center h="full">
                <Button variant="unstyled" onClick={wrapNativeModal.onOpen}>
                  CONVERT
                </Button>
              </Center>
              <WrapNativeModal
                chainId={ChainId.Ethereum}
                isOpen={wrapNativeModal.isOpen}
                onClose={wrapNativeModal.onClose}
              />
            </>
          )}
        </GridItem>

        <GridItem fontSize="sm">
          <Stack direction="row" align="center">
            <Box borderColor="#4c4c4c" borderWidth="1px" borderRadius="16px">
              <TokenIcon tokenId="APE" chainId={ChainId.Ethereum} w={8} />
            </Box>
            {apeToken ? <DisplayBalance as="span" display="inline-block" token={apeToken} /> : '-'}
            <Text>{apeToken?.symbol}</Text>
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  )
}
