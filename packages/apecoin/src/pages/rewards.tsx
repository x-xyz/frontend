import InfoIcon from 'components/icons/InfoIcon'
import RewardSection from 'components/RewardSection'
import { useRoundClaimInfo } from 'components/RoundClaimInfo'
import Web3CheckButton from 'components/Web3CheckButton'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { ReactNode, useState } from 'react'
import Link from 'components/Link'

import { Flex } from '@chakra-ui/layout'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  ListItem,
  Stack,
  TableContainer,
  Text,
  UnorderedList,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { formatUnits } from '@ethersproject/units'
import { RoundAirdrop as RoundAirdropABI } from '@x/abis'
import roundAirdropAbi from '@x/abis/round-airdrop.json'
import { ChainId, TokenMeta } from '@x/constants'
import { useActiveWeb3React, useContract } from '@x/hooks'
import { handleError } from '@x/web3/dist'

import Address from '../components/Address'
import Layout from '../components/Layout'

const tableData: [string, boolean, boolean, boolean, boolean][] = [
  ['Bored Ape Yacht Club', true, false, false, false],
  ['Otherdeeds', true, false, false, false],
  ['Mutant Ape Yacht Club', false, true, false, false],
  ['Bored Ape Kennel Club', false, false, true, false],
  ['Meebits', false, false, true, false],
  ['CryptoPunks', false, false, false, true],
  ['CoolCat', false, false, false, true],
  ['Cryptoadz', false, false, false, true],
  ['Nouns', false, false, false, true],
  ['World of Women', false, false, false, true],
  ['World of Women Galaxy', false, false, false, true],
]

const faq: { q: string; a: ReactNode }[] = [
  {
    q: 'How long is the Listing Reward Program?',
    a: '4 weeks. The end date for the current Listing Reward Program is 21 Oct 2022, 12pm UTC+8.',
  },
  {
    q: 'How do I earn Listing Rewards?',
    a: (
      <UnorderedList>
        <ListItem>
          A NFT will be eligible for listing rewards if it’s listed within +/- 25% of the current floor price on
          OpenSea.
        </ListItem>
        <ListItem>
          Any NFT within the Bored Ape Yacht Club, Mutant Ape Yacht Club, Bored Ape Kennel Club, Otherdeeds,
          CryptoPunks, Meebits, Cool Cats, CrypToadz, Nouns, World of Women and/or World of Women Galaxy Collections are
          eligible for the Listing Reward program.
        </ListItem>
      </UnorderedList>
    ),
  },
  {
    q: 'How often are Listing Rewards earned?',
    a: 'Listing Rewards are earned every hour for those listings which are eligible.',
  },
  {
    q: 'Does every NFT earn the same amount of Listing Rewards?',
    a: 'No. Each collection has a Listing Reward Multiplier. See above table for more detail.\n',
  },
  {
    q: 'When can I claim my Listing Rewards?',
    a: 'Although users earn Listing Rewards hourly, they are claimable on a daily basis at 12pm UTC+8.',
  },
  {
    q: 'Do I need to claim my Listing Rewards every day?',
    a: 'No. Users can let their Listing Rewards accrue and claim at their convenience.',
  },
  {
    q: 'Where can I see the Listing Rewards I have earned and claim them?',
    a: 'Users can claim their Listing Rewards at the top of this page in the Rewards Claim banner.',
  },
  {
    q: 'How do I claim my Listing Rewards?',
    a: 'Users click the “claim” button which will trigger a wallet transaction for them to approve. This will cost gas.',
  },
]

const breakpoint = 'lg'

const veXToken: TokenMeta = {
  address: '0x5B8c598ef69E8Eb97eb55b339A45dcf7bdc5C3A3',
  name: 'veX',
  symbol: 'veX',
  decimals: 18,
  icon: '/assets/logo.svg',
  chainId: ChainId.Ethereum,
}

export default function Rewards() {
  const { locale } = useRouter()
  const { account, callContract } = useActiveWeb3React()

  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const { claimable, claimedAmount, proofs, claimeds, setClaimeds } = useRoundClaimInfo(
    ChainId.Ethereum,
    '0x6F766919f3617C623B729a73c2Af87AeCDBa392A',
    veXToken,
    account,
  )

  const toast = useToast({ title: 'Claim' })

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

  return (
    <Layout>
      <Container maxW="1110px" mb="80px">
        {account && (
          <Box borderColor="divider" borderWidth="1px" mt={15} mb={6}>
            {DateTime.now() < DateTime.fromISO('2022-10-21T12+08') ? (
              <Box bg="#2a2a2a" borderBottomColor="divider" borderBottomWidth="1px" fontSize="xs" px={4} py={2.5}>
                Claim Rewards
              </Box>
            ) : (
              <Box
                bg="#2a2a2a"
                borderBottomColor="divider"
                borderBottomWidth="1px"
                fontSize="36px"
                px={4}
                py={2.5}
                textAlign="center"
                color="primary"
                fontWeight="bold"
              >
                Listing Rewards have ended, claimable anytime
              </Box>
            )}
            <Box p={5}>
              <Stack
                justifyContent="space-between"
                alignItems="center"
                direction={useDesktopView ? 'row' : 'column'}
                spacing={5}
              >
                <Text>
                  <Address type="copy">{account}</Address>
                </Text>
                <Stack>
                  <Text>
                    Claimable listing rewards ={' '}
                    {parseFloat(formatUnits(claimable, veXToken.decimals)).toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    veX
                  </Text>
                  <Text>
                    Cumulative rewards earned ={' '}
                    {parseFloat(formatUnits(claimedAmount, veXToken.decimals)).toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    veX
                  </Text>
                  <Flex alignItems="center">
                    <InfoIcon w={3} h={3} fill="primary" display="inline" verticalAlign="middle" mr={2} />
                    <Text>
                      <Link
                        href="https://medium.com/@x.xyz/update-vex-tokens-and-x-marketplace-c5ab669b5ae3"
                        color="primary"
                      >
                        Click here
                      </Link>{' '}
                      to learn more about veX
                    </Text>
                  </Flex>
                </Stack>
                <Web3CheckButton
                  expectedChainId={ChainId.Ethereum}
                  variant="outline"
                  color="primary"
                  w="240px"
                  mt={useDesktopView ? 0 : 5}
                  isLoading={isClaiming}
                  disabled={isClaiming || !proofs?.length || claimable.isZero() || !contract}
                  onClick={claim}
                >
                  CLAIM REWARDS
                </Web3CheckButton>
              </Stack>
            </Box>
          </Box>
        )}
        {DateTime.now() < DateTime.fromISO('2022-10-21T12+08') && <RewardSection />}
        <Text mt={10} textAlign="center" lineHeight={10} fontSize="sm">
          Listings must be within ±25% of the OpenSea floor price to be eligible to earn rewards.
        </Text>
        <TableContainer mt={10}>
          <Table variant="bordered" border="1px" borderColor="divider">
            <Thead>
              <Tr>
                <Th fontSize="md">Collection Reward Multipliers</Th>
                <Th fontSize="md">10x</Th>
                <Th fontSize="md">5x</Th>
                <Th fontSize="md">2x</Th>
                <Th fontSize="md">1x</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tableData.map(([name, ...multipliers]) => (
                <Tr key="name">
                  <Td>{name}</Td>
                  {multipliers.map((m, idx) => (
                    <Td key={idx} bgColor={m ? 'primary' : 'unset'}></Td>
                  ))}
                </Tr>
              ))}
              <Tr>
                <Td>Bored Ape Chemistry Club</Td>
                <Td colSpan={4} textAlign="center">
                  Not Applicable for Rewards
                </Td>
              </Tr>
              <Tr>
                <Td>World of Women - Capacitors</Td>
                <Td colSpan={4} textAlign="center">
                  Not Applicable for Rewards
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Box mt={12}>
          <Flex alignItems="center">
            <Text>FREQUENTLY ASKED QUESTIONS</Text>
            <Box h="1px" ml={5} bgColor="divider" flexGrow={1}></Box>
          </Flex>
          <Accordion defaultIndex={[0]} allowMultiple>
            {faq.map(({ q, a }) => (
              <AccordionItem key={q} mt={8}>
                <AccordionButton>
                  <Box flex="1" textAlign="left" color="primary">
                    {q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontSize="sm">
                  {a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </Container>
    </Layout>
  )
}
