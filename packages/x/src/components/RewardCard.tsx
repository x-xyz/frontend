import { Flex } from '@chakra-ui/layout'
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat'
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { useProofsQuery } from '@x/apis/dist'
import { TokenMeta } from '@x/constants/dist'
import { useActiveWeb3React, useContract, useReadonlyContract, useVotingEscrowLockedState } from '@x/hooks/dist'
import { Airdrop, ChainId } from '@x/models/dist'
import ChainIcon from 'components/ChainIcon'
import Image from 'components/Image'
import airdropAbi from '@x/abis/airdrop.json'
import roundAirdropAbi from '@x/abis/round-airdrop.json'
import { Airdrop as AirdropABI, RoundAirdrop as RoundAirdropABI } from '@x/abis'
import { handleError } from '@x/web3'

import {
  Center,
  Divider,
  Skeleton,
  SkeletonCircle,
  Stack,
  StackProps,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import useToast from '../hooks/useToast'
import Web3CheckButton from './Web3CheckButton'

export interface RewardCardProps extends StackProps {
  airdrop?: Airdrop
  token?: TokenMeta
}

export default function RewardCard({ airdrop, token, ...props }: RewardCardProps) {
  if (!token) return null

  const isEnded = airdrop && DateTime.fromISO(airdrop.deadline) < DateTime.now()

  return (
    <Stack w="360px" bg="panel" border="1px solid" borderColor="divider" spacing={0} {...props}>
      <Flex w="full" h="240px" position="relative">
        <Image
          w="full"
          h="240px"
          borderBottom="1px solid"
          borderColor="divider"
          src={airdrop?.image}
          isLoaded={!!airdrop}
        />
        {isEnded && (
          <Flex
            position="absolute"
            w="full"
            h="full"
            justifyContent="center"
            alignItems="center"
            backgroundColor="#000000cc"
          >
            <Text fontWeight="bold" fontFamily="heading" fontSize="3xl">
              Promotion Ended
            </Text>
          </Flex>
        )}
      </Flex>
      <Stack px={5} py={4} spacing={5}>
        <Skeleton fontWeight="bold" minW="40%" h="1rem" isLoaded={!!airdrop}>
          {airdrop?.name}
        </Skeleton>
        <Stack direction="row" spacing={0} align="center">
          <SkeletonCircle
            as={Center}
            w="30px"
            h="30px"
            borderRadius="15px"
            overflow="hidden"
            bg="reaction"
            flexShrink={0}
            isLoaded={!!airdrop}
          >
            {airdrop && <ChainIcon chainId={airdrop.chainId} />}
          </SkeletonCircle>
          <Divider />
        </Stack>
        {airdrop &&
          (airdrop.type === 'once' ? (
            <OneTimeClaimInfo
              chainId={airdrop.chainId}
              contractAddress={airdrop.contractAddress}
              rewardToken={token}
              deadline={airdrop.deadline}
            />
          ) : (
            <RoundClaimInfo
              chainId={airdrop.chainId}
              contractAddress={airdrop.contractAddress}
              rewardToken={token}
              deadline={airdrop.deadline}
            />
          ))}
      </Stack>
    </Stack>
  )
}

interface ClaimInfoProps {
  chainId: ChainId
  contractAddress: string
  rewardToken: TokenMeta
  deadline: string
}

function OneTimeClaimInfo({ chainId, contractAddress, rewardToken }: ClaimInfoProps) {
  const { locale } = useRouter()

  const toast = useToast({ title: 'Claim' })

  const contract = useContract<AirdropABI>(contractAddress, airdropAbi, true, chainId)

  const { account, callContract } = useActiveWeb3React()

  const { data, isLoading } = useProofsQuery(
    { chainId, contract: contractAddress, claimer: `${account}` },
    { skip: !account },
  )

  const proof = useMemo(() => data?.data?.[0], [data])

  const [isClaiming, setClaiming] = useState(false)

  const [claimed, setClaimed] = useState(false)

  const claimable = useMemo(() => {
    if (claimed || !proof) return Zero
    return BigNumber.from(proof.amount)
  }, [claimed, proof])

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
  }, [contract, callContract, account, toast])

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
      <Stat>
        <StatLabel>{`${rewardToken.name} Token`}</StatLabel>
        <StatNumber>
          {!isLoading ? (
            parseFloat(formatFixed(claimable, rewardToken.decimals)).toLocaleString(locale)
          ) : !account ? (
            '0'
          ) : (
            <Skeleton maxW="24" h="1rem" />
          )}
        </StatNumber>
      </Stat>
      {!claimable.eq(0) && (
        <Web3CheckButton
          expectedChainId={rewardToken.chainId}
          isLoading={isLoading || isClaiming}
          disabled={!contract || !proof || claimable.isZero()}
          onClick={claim}
          size={size}
          variant="link"
          color="primary"
        >
          {claimed ? 'Claimed' : 'Claim'}
        </Web3CheckButton>
      )}
    </Flex>
  )
}

function RoundClaimInfo({ chainId, contractAddress, rewardToken }: ClaimInfoProps) {
  const { locale } = useRouter()

  const toast = useToast({ title: 'Claim' })

  const contract = useContract<RoundAirdropABI>(contractAddress, roundAirdropAbi, true, chainId)

  const readonlyContract = useReadonlyContract<RoundAirdropABI>(contractAddress, roundAirdropAbi, chainId)

  const { account, callContract } = useActiveWeb3React()

  const { data, isLoading } = useProofsQuery(
    { chainId, contract: contractAddress, claimer: `${account}` },
    { skip: !account },
  )

  const proofs = useMemo(() => data?.data, [data])

  const [claimeds, setClaimeds] = useState<Record<number, boolean>>({})

  const isLoadingClaimeds = Object.keys(claimeds).length !== proofs?.length

  const [isClaiming, setClaiming] = useState(false)

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
      <Stat>
        <StatLabel>{`${rewardToken.name} Token`}</StatLabel>
        <StatNumber>
          {!isLoading && !isLoadingClaimeds ? (
            parseFloat(formatFixed(claimable, rewardToken.decimals)).toLocaleString(locale)
          ) : !account ? (
            '0'
          ) : (
            <Skeleton maxW="24" h="1rem" />
          )}
        </StatNumber>
      </Stat>
      {!claimable.eq(0) && (
        <Web3CheckButton
          expectedChainId={rewardToken.chainId}
          isLoading={isLoading || isClaiming || isLoadingClaimeds}
          disabled={!contract || !proofs?.length || claimable.isZero()}
          onClick={claim}
          size={size}
          variant="link"
          color="primary"
        >
          Claim
        </Web3CheckButton>
      )}
    </Flex>
  )
}
