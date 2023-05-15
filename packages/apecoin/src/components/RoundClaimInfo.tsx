import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { Flex } from '@chakra-ui/layout'
import { Skeleton, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { formatFixed, parseFixed } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { RoundAirdrop as RoundAirdropABI } from '@x/abis'
import roundAirdropAbi from '@x/abis/round-airdrop.json'
import { useProofsQuery } from '@x/apis'
import { TokenMeta } from '@x/constants'
import { useActiveWeb3React, useContract, useReadonlyContract, useVotingEscrowLockedState } from '@x/hooks'
import { ChainId } from '@x/models'
import { handleError } from '@x/web3'

import useToast from '../hooks/useToast'
import Web3CheckButton from './Web3CheckButton'

export interface RoundClaimInfoProps {
  chainId: ChainId
  contractAddress: string
  rewardToken: TokenMeta
  deadline: string
}

export function useRoundClaimInfo(
  chainId: ChainId,
  contractAddress: string,
  rewardToken: TokenMeta,
  account?: string | null,
) {
  const { data, isLoading } = useProofsQuery(
    { chainId, contract: contractAddress, claimer: `${account}` },
    { skip: !account },
  )

  const proofs = useMemo(() => data?.data, [data])

  const [claimeds, setClaimeds] = useState<Record<number, boolean>>({})

  const isLoadingClaimeds = Object.keys(claimeds).length !== proofs?.length

  const [{ end }] = useVotingEscrowLockedState(chainId, account)

  const claimable = useMemo(() => {
    if (!proofs) return Zero

    const amounts = proofs.filter(p => claimeds[p.round] === false).map(p => p.amount)
    let total = amounts.reduce((acc, curr) => acc.add(curr), Zero)

    if (rewardToken.name === 'veX') {
      const maxTime = 4 * 365 * 86400
      const now = Math.floor(Date.now() / 1000)
      const unlockTime = end || now + maxTime
      const ratio = (unlockTime - now) / maxTime
      const totalNum = parseFloat(formatFixed(total, rewardToken.decimals))
      const fixedTotalNum = totalNum * ratio
      total = parseFixed(fixedTotalNum.toString(), rewardToken.decimals)
    }

    return total
  }, [claimeds, proofs, rewardToken, end])

  const claimedAmount = useMemo(() => {
    if (!proofs) return Zero

    const amounts = proofs.filter(p => claimeds[p.round] === true).map(p => p.amount)
    let total = amounts.reduce((acc, curr) => acc.add(curr), Zero)

    if (rewardToken.name === 'veX') {
      const maxTime = 4 * 365 * 86400
      const now = Math.floor(Date.now() / 1000)
      const unlockTime = end || now + maxTime
      const ratio = (unlockTime - now) / maxTime
      const totalNum = parseFloat(formatFixed(total, rewardToken.decimals))
      const fixedTotalNum = totalNum * ratio
      total = parseFixed(fixedTotalNum.toString(), rewardToken.decimals)
    }

    return total
  }, [claimeds, proofs, rewardToken, end])

  const { callContract } = useActiveWeb3React()

  const readonlyContract = useReadonlyContract<RoundAirdropABI>(contractAddress, roundAirdropAbi, chainId)

  useEffect(() => {
    if (!readonlyContract || !account || !proofs) return

    let stale = false

    proofs.forEach(({ round }) =>
      callContract({ contract: readonlyContract, method: 'claimed', args: [account, round] }).then(v => {
        if (stale) return
        setClaimeds(prev => ({ ...prev, [round]: v }))
      }),
    )

    return () => {
      stale = true
    }
  }, [callContract, readonlyContract, account, proofs])

  return { claimable, claimeds, setClaimeds, isLoadingClaimeds, proofs, isLoading, claimedAmount }
}

export default function RoundClaimInfo({ chainId, contractAddress, rewardToken }: RoundClaimInfoProps) {
  const { locale } = useRouter()

  const toast = useToast({ title: 'Claim' })

  const contract = useContract<RoundAirdropABI>(contractAddress, roundAirdropAbi, true, chainId)

  const { account, callContract } = useActiveWeb3React()

  const [isClaiming, setClaiming] = useState(false)

  const { proofs, setClaimeds, claimeds, isLoadingClaimeds, isLoading, claimable } = useRoundClaimInfo(
    chainId,
    contractAddress,
    rewardToken,
    account,
  )

  async function claim() {
    if (!contract || !proofs?.length) return

    const unclaimeds = proofs.filter(p => claimeds[p.round] === false)
    const rounds = unclaimeds.map(proof => proof.round)
    const amounts = unclaimeds.map(proof => proof.amount)
    const proofData = unclaimeds.map(proof => proof.proof)

    setClaiming(true)

    try {
      const tx = await callContract({ contract, method: 'claim', args: [rounds, amounts, proofData] })

      await tx.wait()

      toast({ status: 'success', description: 'Claimed' })

      rounds.forEach(round => setClaimeds(prev => ({ ...prev, [round]: true })))
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
          {!isLoading && !isLoadingClaimeds ? (
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
          isLoading={isLoading || isClaiming || isLoadingClaimeds}
          disabled={!contract || !proofs?.length || claimable.isZero()}
          onClick={claim}
          size={size}
        >
          Claim
        </Web3CheckButton>
      )}
    </Flex>
  )
}
