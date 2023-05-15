import Fonts from 'components/Layout/Fonts'
import Link from 'components/Link'
import Web3CheckButton from 'components/Web3CheckButton'
import { useQuery } from 'react-query'

import { Center, Image, Spinner, Stack, Text } from '@chakra-ui/react'
import { useActiveWeb3React, useContract } from '@x/hooks'
import { ChainId } from '@x/models'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Claim } from '@x/abis'
import claimAbi from '@x/abis/claim.json'
import { useEffect, useState } from 'react'
import useToast from 'hooks/useToast'

interface ClaimData {
  action: 'claim'
  amount: string
  index: string
  proof: string[]
}

interface ReceiveData {
  action: 'airdrop'
  type: string
  hex: string
}

const contractAddress = {
  [ChainId.Ethereum]: '0x59540AAf601Cec8CFa7407Ce79cbC9C104Ce4c84',
  [ChainId.Goerli]: '0x3791339e9a57bb0F2Bfcf40A8415dDF2A08fb117',
}

export default function Goodbye() {
  const { account, callContract, chainId } = useActiveWeb3React()

  const { data, isLoading: isLoadingData } = useQuery<ClaimData | ReceiveData>(`/api/claim/${account}`, {
    enabled: !!account,
  })

  const contract = useContract<Claim>(contractAddress, claimAbi, true, chainId)

  const [isClaimed, setClaimed] = useState(false)

  const [isLoading, setLoading] = useState(false)

  const toast = useToast()

  useEffect(() => {
    setClaimed(false)
  }, [account])

  useEffect(() => {
    if (data?.action === 'airdrop') return
    if (!contract || !data?.index) return

    let stale = false

    setLoading(true)

    contract
      .claimed(data.index)
      .then(value => {
        if (stale) return
        setClaimed(value)
      })
      .finally(() => {
        if (stale) return
        setLoading(false)
      })

    return () => {
      stale = true
    }
  }, [contract, data])

  async function claim() {
    setLoading(true)

    try {
      if (!contract) throw new Error('contract not found')
      if (!data) throw new Error('data not found')
      if (data.action !== 'claim') throw new Error('invalid action')

      const tx = await callContract({ contract, method: 'claim', args: [data.amount, data.index, data.proof] })

      toast({ status: 'success', description: 'Transaction sent' })

      await tx.wait()

      toast({ status: 'success', description: 'Claim successfully' })
    } catch {
      toast({ status: 'error', description: 'Claim fail' })
    } finally {
      setLoading(false)
    }
  }

  function renderButton() {
    return (
      <Web3CheckButton
        expectedChainId={ChainId.Ethereum}
        onClick={claim}
        disabled={isLoading || isLoadingData || isClaimed}
        isLoading={isLoading || isLoadingData}
      >
        {!account ? 'Connect Wallet' : isClaimed ? 'Claimed' : 'Claim'}
      </Web3CheckButton>
    )
  }

  function render() {
    if (!account) {
      return (
        <>
          <Text>Connect your wallet to verify if you are eligible for the ETH claim.</Text>
          <Text>
            Refer to the{' '}
            <Link
              textDecor="underline"
              href="https://medium.com/@x.xyz/proposal-to-close-down-x-marketplace-and-return-the-treasury-to-token-holders-a525b278b2c2"
            >
              medium article
            </Link>{' '}
            for more information.
          </Text>
          {renderButton()}
        </>
      )
    }

    if (isLoading) {
      return (
        <Center>
          <Spinner />
        </Center>
      )
    }

    if (!isLoading && !data) {
      return (
        <>
          <Text>You are not eligible for the claim.</Text>
          <Text>
            Refer to the{' '}
            <Link
              textDecor="underline"
              href="https://medium.com/@x.xyz/proposal-to-close-down-x-marketplace-and-return-the-treasury-to-token-holders-a525b278b2c2"
            >
              medium article
            </Link>{' '}
            for more information.
          </Text>
        </>
      )
    }

    if (!isLoading && data && data.action === 'airdrop') {
      return (
        <>
          <Text textDecor="underline">You do not need to claim as you qualify for the ETH airdrop.</Text>
          <Text>
            {parseFloat(formatUnits(data.hex)).toLocaleString(void 0, { maximumFractionDigits: 12 })} ETH to be
            airdropped.
          </Text>
          <Text>
            Refer to the{' '}
            <Link
              textDecor="underline"
              href="https://medium.com/@x.xyz/proposal-to-close-down-x-marketplace-and-return-the-treasury-to-token-holders-a525b278b2c2"
            >
              medium article
            </Link>{' '}
            for more information.
          </Text>
        </>
      )
    }

    if (!isLoading && data && isClaimed) {
      return (
        <>
          <Text>You have claimed your ETH.</Text>
          <Text>
            Refer to the{' '}
            <Link
              textDecor="underline"
              href="https://medium.com/@x.xyz/proposal-to-close-down-x-marketplace-and-return-the-treasury-to-token-holders-a525b278b2c2"
            >
              medium article
            </Link>{' '}
            for more information.
          </Text>
          {renderButton()}
        </>
      )
    }

    if (!isLoading && data?.action === 'claim') {
      return (
        <>
          <Text>
            You are eligible to claim{' '}
            {parseFloat(formatUnits(data.amount)).toLocaleString(void 0, { maximumFractionDigits: 12 })} ETH.
          </Text>
          <Text>
            Refer to the{' '}
            <Link
              textDecor="underline"
              href="https://medium.com/@x.xyz/proposal-to-close-down-x-marketplace-and-return-the-treasury-to-token-holders-a525b278b2c2"
            >
              medium article
            </Link>{' '}
            for more information.
          </Text>
          {renderButton()}
        </>
      )
    }
  }

  return (
    <Center w="100vw" h="100vh">
      <Fonts />
      <Stack spacing={4} align="center">
        <Stack align="center">
          <Image src="logo.png" w="64px" />
          <Text>Marketplace</Text>
        </Stack>
        <Text>X Marketplace has now closed.</Text>
        {render()}
      </Stack>
    </Center>
  )
}
