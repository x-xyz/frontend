import { createElement } from 'react'
import { CallOverrides } from '@ethersproject/contracts'
import { ChainId, getChainName } from '@x/constants'
import { injected, setupWallets } from '@x/constants'
import { useEffect, createContext, useState, useContext, useCallback } from 'react'
import { metamaskSwitchNetwork, handleError, callContract } from '@x/web3'
import { useWeb3React } from '@x/utils'
import { useEagerConnect } from './useEagerConnect'
import { useInactiveListener } from './useInactiveListener'
import { useSyncRef } from './useSyncRef'
import { useToast } from './useToast'
import { useWeb3ErrorHander } from './useWeb3ErrorHander'

interface ActiveWeb3ReactContext {
  expectedChainId?: ChainId
  switchChain: (chainId: ChainId) => void
  isWaitingApprovalForSwitchingChain?: boolean
}

const Context = createContext<ActiveWeb3ReactContext>({
  switchChain: () => void 0,
  isWaitingApprovalForSwitchingChain: false,
})

export function useActiveWeb3React() {
  const context = useWeb3React()

  const { chainId, library, account } = context

  const { switchChain, isWaitingApprovalForSwitchingChain } = useContext(Context)

  const callContractWithGasPrice = useCallback<typeof callContract>(
    async ({ calculateGasPrice = true, ...args }) => {
      const overrides: CallOverrides = {}

      if (calculateGasPrice) {
        const eip1159: ChainId[] = [ChainId.Ethereum, ChainId.Ropsten]

        if (chainId && eip1159.includes(chainId)) {
          /**
           * let metamask control the fee
           */
          // const { maxFeePerGas, maxPriorityFeePerGas } = (await library?.getFeeData()) || {}
          // overrides.maxFeePerGas = maxFeePerGas?.mul(1)
          // overrides.maxPriorityFeePerGas = maxPriorityFeePerGas?.mul(1)
        } else {
          overrides.gasPrice = (await library?.getGasPrice())?.mul(2)
        }
      }

      return callContract({ ...args, ...overrides })
    },
    [library, chainId],
  )

  return {
    ...context,
    switchChain,
    isWaitingApprovalForSwitchingChain,
    callContract: callContractWithGasPrice,
  }
}

export function ActiveWeb3ReactProvider({ children }: { children: React.ReactNode }) {
  useEffect(setupWallets, [])

  const [isWaitingApprovalForSwitchingChain, setWaitingApprovalForSwitchingChain] = useState(false)

  const { connector } = useWeb3React()

  const ref = useSyncRef({ isWaitingApprovalForSwitchingChain, connector })

  const toast = useToast({ title: 'Web3' })

  const triedEager = useEagerConnect()

  useInactiveListener(!triedEager)

  useWeb3ErrorHander()

  const switchChain = useCallback(
    async chainId => {
      async function ensureMetamaskChainIdMatched() {
        // waiting for connected
        if (!ref.current.connector) return

        const description = `Please switch to ${getChainName(chainId)} (chain id:${chainId})`

        if (ref.current.connector !== injected) {
          toast({ status: 'warning', description })
          return
        }

        try {
          setWaitingApprovalForSwitchingChain(true)

          await metamaskSwitchNetwork(chainId)
        } catch (error) {
          handleError(error, { toast })
        } finally {
          setWaitingApprovalForSwitchingChain(false)
        }
      }

      await ensureMetamaskChainIdMatched()
    },
    [ref, toast],
  )

  return createElement(Context.Provider, { value: { isWaitingApprovalForSwitchingChain, switchChain } }, children)
}
