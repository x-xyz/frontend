import InfoIcon from 'components/icons/InfoIcon'
import Link from 'components/Link'

import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useQuery } from 'react-query'
import { Fragment, useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'
import { useRoundClaimInfo } from './RoundClaimInfo'
import { ChainId, TokenMeta } from '@x/constants'
import { useActiveWeb3React, useContract } from '@x/hooks'
import useToast from 'hooks/useToast'
import { RoundAirdrop as RoundAirdropABI } from '@x/abis'
import roundAirdropAbi from '@x/abis/round-airdrop.json'
import { handleError } from '@x/web3'
import Web3CheckButton from './Web3CheckButton'

const breakpoint = 'lg'

export interface RewardSectionProps {
  showClaimButton?: boolean
  showInfoButton?: boolean
}

const veXToken: TokenMeta = {
  address: '0x5B8c598ef69E8Eb97eb55b339A45dcf7bdc5C3A3',
  name: 'veX',
  symbol: 'veX',
  decimals: 18,
  icon: '/assets/logo.svg',
  chainId: ChainId.Ethereum,
}

type Data = {
  value: string
  desc: React.ReactNode
}

export default function RewardSection({ showClaimButton, showInfoButton }: RewardSectionProps) {
  const { account, callContract } = useActiveWeb3React()
  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const toast = useToast({ title: 'Claim' })

  const { data: { data: { rewards = '0' } } = { data: {} } } = useQuery<{ data: { rewards: string } }>(
    '/collection-promotions/last-hour-reward-per-listing',
  )

  // format veX
  const lastHourRewardPerListing = useMemo(() => formatUnits(rewards, veXToken.decimals), [rewards])

  const { claimable, proofs, setClaimeds, claimeds } = useRoundClaimInfo(
    ChainId.Ethereum,
    '0x6F766919f3617C623B729a73c2Af87AeCDBa392A',
    veXToken,
    account,
  )

  const contract = useContract<RoundAirdropABI>(
    '0x6F766919f3617C623B729a73c2Af87AeCDBa392A',
    roundAirdropAbi,
    true,
    ChainId.Ethereum,
  )

  const [isClaiming, setClaiming] = useState(false)

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

  const data: Data[] = [
    {
      value: '1,488,095.24 veX',
      desc: 'in total Listing Rewards paid every hour',
    },
    {
      value: '35,714,285.71 veX',
      desc: 'in total Listing Rewards paid every day',
    },
    {
      value: `${parseFloat(lastHourRewardPerListing).toLocaleString(void 0, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })} veX`,
      desc: 'Average rewards earned per eligible listing in the last hour',
    },
    {
      value: `${(parseFloat(lastHourRewardPerListing) * 24).toLocaleString(void 0, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })} veX`,
      desc: (
        <>
          Projected daily rewards earned per eligible listing{' '}
          {useDesktopView && (
            <Tooltip label="Assume veX earned in the last hour remains constant for the next 24 hours">
              <IconButton
                display={{
                  base: 'none',
                  [breakpoint]: 'inline-flex',
                }}
                variant="icon"
                aria-label="reward detail"
                pos="relative"
                top="-20%"
                transform="translateX(-25%)"
                icon={<InfoIcon w={3} h={3} fill="primary" />}
                h="unset"
              />
            </Tooltip>
          )}
        </>
      ),
    },
    {
      value: `${parseFloat(formatUnits(claimable, veXToken.decimals)).toLocaleString(void 0, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })} veX`,
      desc: 'Your claimable Listing Rewards',
    },
  ]

  function renderDesktop() {
    return (
      <Flex
        justifyContent="center"
        alignItems="center"
        borderColor="divider"
        borderWidth="1px"
        width="full"
        bgImg="url('assets/homepage_rewards_banner.jpg')"
        bgRepeat="no-repeat"
        bgSize="cover"
        p={10}
        pos="relative"
      >
        <Grid
          templateColumns={{
            [breakpoint]: '180px 1fr',
          }}
          templateRows={{
            [breakpoint]: 'repeat(6, auto)',
          }}
          rowGap={2.5}
          sx={{ '&>*': { p: 1 } }}
          fontSize={{
            base: 'xs',
            md: 'sm',
          }}
        >
          <GridItem colSpan={2}>
            <Center h="full" textAlign="center" fontSize={'40px'} fontWeight="extrabold" color="primary" lineHeight={1}>
              ENDS ON 21 Oct 2022, 12pm UTC+8
            </Center>
          </GridItem>
          {data.map((d, idx) => (
            <Fragment key={idx}>
              <GridItem bg="black" border="1px solid" borderColor="divider" px={2} textAlign="right" color="primary">
                {d.value}
              </GridItem>
              <GridItem
                noOfLines={1}
                fontSize={{
                  base: '14px',
                  [breakpoint]: 'md',
                }}
                lineHeight={1}
                display="flex"
                alignItems="center"
              >
                {d.desc}
              </GridItem>
            </Fragment>
          ))}
        </Grid>
        <Stack pos="absolute" bottom={0} transform="translateY(50%)" direction="row" spacing={10}>
          {showClaimButton && (
            <Web3CheckButton
              expectedChainId={ChainId.Ethereum}
              variant="outline"
              bgColor="black"
              color="primary"
              w="240px"
              isLoading={isClaiming}
              disabled={isClaiming || !proofs?.length || claimable.isZero() || !contract}
              onClick={claim}
            >
              CLAIM REWARDS
            </Web3CheckButton>
          )}
          <Link href="/rewards">
            {showInfoButton && (
              <Button variant="outline" bgColor="black" color="primary" w="240px">
                REWARD INFORMATION
              </Button>
            )}
          </Link>
        </Stack>
      </Flex>
    )
  }

  function renderMobile() {
    return (
      <Stack spacing={5}>
        <Stack
          spacing={5}
          justifyContent="center"
          alignItems="center"
          borderColor="divider"
          borderWidth="1px"
          width="full"
          bgImg="url('assets/homepage_rewards_banner.jpg')"
          bgRepeat="no-repeat"
          bgSize="cover"
          p={10}
          pos="relative"
          textAlign="center"
        >
          <Center
            h="full"
            textAlign="center"
            fontSize={{
              base: '24px',
              [breakpoint]: '40px',
            }}
            fontWeight="extrabold"
            color="primary"
            lineHeight={1}
          >
            ENDS ON 21 Oct 2022, 12pm UTC+8
          </Center>
          {data.map((d, idx) => (
            <Box key={idx}>
              <Text borderColor="divider" px={2} color="primary">
                {d.value}
              </Text>
              <Text
                fontSize={{
                  base: '14px',
                  [breakpoint]: 'md',
                }}
              >
                {d.desc}
              </Text>
            </Box>
          ))}
        </Stack>
        {showClaimButton && (
          <Web3CheckButton
            expectedChainId={ChainId.Ethereum}
            variant="outline"
            bgColor="black"
            color="primary"
            isLoading={isClaiming}
            disabled={isClaiming || !proofs?.length || claimable.isZero() || !contract}
            onClick={claim}
            w="full"
          >
            CLAIM REWARDS
          </Web3CheckButton>
        )}
        <Link href="/rewards" w="full">
          {showInfoButton && (
            <Button variant="outline" bgColor="black" color="primary" w="full">
              REWARD INFORMATION
            </Button>
          )}
        </Link>
      </Stack>
    )
  }

  return useDesktopView ? renderDesktop() : renderMobile()
}
