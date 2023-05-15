import { DateTime } from 'luxon'

import { Flex } from '@chakra-ui/layout'
import { Image, Skeleton, Stack, StackProps, Text } from '@chakra-ui/react'
import { TokenMeta } from '@x/constants'
import { Airdrop } from '@x/models'

import OneTimeClaimInfo from './OneTimeClaimInfo'
import RoundClaimInfo from './RoundClaimInfo'
export interface RewardCardProps extends StackProps {
  airdrop?: Airdrop
  token?: TokenMeta
}

export default function RewardCard({ airdrop, token, ...props }: RewardCardProps) {
  if (!token) return null

  const isEnded = airdrop && DateTime.fromISO(airdrop.deadline) < DateTime.now()

  return (
    <Stack w="360px" bg="panel" spacing={0} {...props}>
      <Flex w="full" h="240px" position="relative">
        <Image w="full" h="240px" border="1px solid" borderColor="#fff" src={airdrop?.image} isLoaded={!!airdrop} />
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
        <Skeleton fontSize="sm" minW="40%" h="1rem" isLoaded={!!airdrop} whiteSpace="nowrap">
          {airdrop?.name}
        </Skeleton>
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
