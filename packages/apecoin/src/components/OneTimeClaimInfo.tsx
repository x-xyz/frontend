import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { Flex } from '@chakra-ui/layout'
import { Skeleton, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { BigNumber, formatFixed } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { Airdrop as AirdropABI } from '@x/abis'
import airdropAbi from '@x/abis/airdrop.json'
import { useProofsQuery } from '@x/apis'
import { TokenMeta } from '@x/constants'
import { useActiveWeb3React, useContract } from '@x/hooks'
import { ChainId } from '@x/models'
import { handleError } from '@x/web3'

import useToast from '../hooks/useToast'
import Web3CheckButton from './Web3CheckButton'

export interface OneTimeClaimInfoProps {
  chainId: ChainId
  contractAddress: string
  rewardToken: TokenMeta
  deadline: string
}

export function useOneTimeClaimInfo(chainId: ChainId, contractAddress: string, account?: string | null) {
  const { data, isLoading } = useProofsQuery(
    { chainId, contract: contractAddress, claimer: `${account}` },
    { skip: !account },
  )

  const proof = useMemo(() => data?.data?.[0], [data])

  const [claimed, setClaimed] = useState(false)

  const claimable = useMemo(() => {
    if (claimed || !proof) return Zero
    return BigNumber.from(proof.amount)
  }, [claimed, proof])

  return { claimable, claimed, setClaimed, isLoading, proof }
}

export default function OneTimeClaimInfo({ chainId, contractAddress, rewardToken }: OneTimeClaimInfoProps) {
  const { locale } = useRouter()

  const toast = useToast({ title: 'Claim' })

  const contract = useContract<AirdropABI>(contractAddress, airdropAbi, true, chainId)

  const { account, callContract } = useActiveWeb3React()

  const [isClaiming, setClaiming] = useState(false)

  const { claimable, claimed, setClaimed, isLoading, proof } = useOneTimeClaimInfo(chainId, contractAddress, account)

  useEffect(() => {
    if (!contract || !account) return

    let stale = false

    callContract({ contract, method: 'claimed', args: [account] })
      .then(v => {
        if (stale) return
        setClaimed(v)
      })
      .catch(err => {
        if (stale) return
        handleError(err, { toast })
      })

    return () => {
      stale = true
    }
  }, [contract, callContract, account, toast, setClaimed])

  async function claim() {
    if (!contract || !proof) return

    setClaiming(true)

    try {
      const tx = await callContract({
        contract,
        method: 'claim',
        args: [BigNumber.from(proof.amount), proof.proof],
      })

      await tx.wait()

      setClaimed(true)

      toast({ status: 'success', description: 'Claimed' })
    } catch (error) {
      handleError(error, { toast })
    } finally {
      setClaiming(false)
    }
  }

  const size = useBreakpointValue({ base: 'sm', lg: 'md' })

  return (
    <Flex justifyContent="space-between" alignItems="flex-end">
      <Stack spacing={0} fontSize="xs">
        <Text>
          <Text as="span" color="value">
            Status:
          </Text>{' '}
          <Text as="span" color="danger">
            Promotion Ended
          </Text>
        </Text>
        <Text>
          <Text as="span" color="value">
            Claim Amount:
          </Text>{' '}
          {!isLoading ? (
            parseFloat(formatFixed(claimable, rewardToken.decimals)).toLocaleString(locale)
          ) : !account ? (
            '0'
          ) : (
            <Skeleton display="inline-block" maxW="24" h="1rem" />
          )}{' '}
          {rewardToken.name} Tokens
        </Text>
      </Stack>
      {!claimable.eq(0) && (
        <Web3CheckButton
          expectedChainId={rewardToken.chainId}
          isLoading={isLoading || isClaiming}
          disabled={!contract || !proof || claimable.isZero()}
          onClick={claim}
          size={size}
        >
          {claimed ? 'Claimed' : 'Claim'}
        </Web3CheckButton>
      )}
    </Flex>
  )
}
