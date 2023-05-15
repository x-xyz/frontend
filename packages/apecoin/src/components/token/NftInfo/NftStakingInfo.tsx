import { Flex, HStack, Text } from '@chakra-ui/react'
import { useActiveWeb3React, useReadonlyContract } from '@x/hooks'
import { ChainId, NftItem } from '@x/models'
import apeCoinStakingAbi from '@x/abis/ape-coin-staking.json'
import { ApeCoinStaking } from '@x/abis'
import { useEffect, useState } from 'react'
import { formatUnits } from '@ethersproject/units'
import UsdPrice from 'components/UsdPrice'

export interface NftStakingInfoProps {
  nft: NftItem
  spacing?: string | number
}

const contractAddressToPoolId: Record<string, number | void> = {
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d': 1,
  '0x60e4d786628fea6478f785a6d7e704777c86a7c6': 2,
  '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623': 3,
}

export default function NftStakingInfo(props: NftStakingInfoProps) {
  if (!shouldDisplay(props.nft)) return null

  return <Impl {...props} />
}

function Impl({ nft, spacing = 16 }: NftStakingInfoProps) {
  const { chainId } = useActiveWeb3React()

  const apeCoinStakingContract = useReadonlyContract<ApeCoinStaking>(
    {
      [ChainId.Goerli]: '0x831e0c7A89Dbc52a1911b78ebf4ab905354C96Ce',
      [ChainId.Ethereum]: '0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9',
    },
    apeCoinStakingAbi,
    chainId || ChainId.Ethereum,
  )

  const [staked, setStaked] = useState(0)

  const [earned, setEarned] = useState(0)

  useEffect(() => {
    if (!apeCoinStakingContract) return

    const poolId = contractAddressToPoolId[nft.contractAddress]
    if (!poolId) return

    apeCoinStakingContract.nftPosition(poolId, nft.tokenId).then(position => {
      const { stakedAmount } = position
      setStaked(parseFloat(formatUnits(stakedAmount)))
    })
  }, [apeCoinStakingContract, nft.contractAddress, nft.tokenId])

  useEffect(() => {
    if (!nft.owner) return
    if (!apeCoinStakingContract) return

    const poolId = contractAddressToPoolId[nft.contractAddress]
    if (!poolId) return

    apeCoinStakingContract.pendingRewards(poolId, nft.contractAddress, nft.tokenId).then(reward => {
      setEarned(parseFloat(formatUnits(reward)))
    })
  }, [apeCoinStakingContract, nft.contractAddress, nft.tokenId, nft.owner])

  return (
    <HStack spacing={spacing} alignItems="stretch" mt={5} mr={5}>
      <Flex direction="column" spacing={0}>
        <Text variant="body2" whiteSpace="nowrap">
          $APE Earned
        </Text>
        <Text variant="headline6" mt={2}>
          {earned.toLocaleString(void 0, { maximumFractionDigits: 3 })} APE
        </Text>
        <Text variant="caption" color="textSecondary" mt={1}>
          <UsdPrice chainId={ChainId.Ethereum} tokenId="APE" suffix="USD">
            {earned}
          </UsdPrice>
        </Text>
      </Flex>
      {/* only display staked info if not bakc */}
      {nft.contractAddress !== '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623' && (
        <Flex direction="column" spacing={0}>
          <Text variant="body2" whiteSpace="nowrap">
            $APE Staked
          </Text>
          <Text variant="headline6" mt={2}>
            {staked.toLocaleString(void 0, { maximumFractionDigits: 3 })} APE
          </Text>
          <Text variant="caption" color="textSecondary" mt={1}>
            <UsdPrice chainId={ChainId.Ethereum} tokenId="APE" suffix="USD">
              {staked}
            </UsdPrice>
          </Text>
        </Flex>
      )}
    </HStack>
  )
}

function shouldDisplay(nft: NftItem) {
  if (nft.chainId !== ChainId.Ethereum) return false
  return [
    // bayc
    '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    // mayc
    '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    // bakc
    '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623',
  ].includes(nft.contractAddress)
}
