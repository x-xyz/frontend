import { Web3Provider } from '@ethersproject/providers'
import { Contract, CallOverrides } from '@ethersproject/contracts'
import { MaxUint256 } from '@ethersproject/constants'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { Erc20 } from '@x/abis'
import { signatureMessage, TokenMeta } from '@x/constants'
import { ChainId, getChain } from '@x/constants'
import { callOnChain, isMetaMaskError } from '@x/utils'
import { isPlainObject } from 'lodash'

export { UnsupportedChainIdError } from '@web3-react/core'
export { NoEthereumProviderError, UserRejectedRequestError } from '@web3-react/injected-connector'

export async function ensureEnoughNativeToken(
  library: Web3Provider,
  account: string,
  requireAmount: number | string | BigNumber,
  token: TokenMeta,
) {
  const balance = await callOnChain(() => library.getBalance(account))

  const requireAmountInEther =
    requireAmount instanceof BigNumber ? requireAmount : parseUnits(requireAmount.toString(), token.decimals)

  if (balance.lt(requireAmountInEther)) throw new Error(`Insufficient ${token.symbol} balance`)
}

/**
 * @returns approve tx hash
 */
export async function ensureEnoughErc20Allowance(
  erc20Contract: Erc20,
  owner: string,
  spender: string,
  requireAmount: number | string | BigNumber,
  token: TokenMeta,
  minimumApproval = false,
) {
  const balance = await callOnChain(() => erc20Contract.balanceOf(owner))

  const requireAmountInEther =
    requireAmount instanceof BigNumber ? requireAmount : parseUnits(requireAmount.toString(), token.decimals)

  if (balance.lt(requireAmountInEther)) throw new Error(`Insufficient ${token.symbol} balance`)

  const allowance = await callOnChain(() => erc20Contract.allowance(owner, spender))

  if (allowance.lt(requireAmountInEther)) {
    const tx = await callOnChain(() =>
      erc20Contract.approve(spender, minimumApproval ? requireAmountInEther : MaxUint256),
    )

    await tx.wait()

    return tx.hash
  }
}

export async function metamaskSwitchNetwork(chainId: ChainId, preventAddNetwork = false): Promise<boolean> {
  if (!window.ethereum?.request) return false

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })

    return true
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 4902) {
      if (preventAddNetwork) return false

      if (!(await metamaskAddNetword(chainId))) return false

      return await metamaskSwitchNetwork(chainId, true)
    }

    throw error
  }
}

export async function metamaskAddNetword(chainId: ChainId) {
  if (!window.ethereum?.request) return false

  const { name, rpcUrl, blockExplorerUrl, icon, nativeCurrency } = getChain(chainId)

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: `0x${chainId.toString(16)}`,
        chainName: name,
        nativeCurrency,
        rpcUrls: [rpcUrl],
        blockExplorerUrls: [blockExplorerUrl],
        iconUrls: [icon],
      },
    ],
  })

  return true
}

export function calculateGasMargin(value: BigNumber, chainId = ChainId.Fantom): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

export interface CallContractParams<C extends Contract, M extends keyof C['estimateGas'], P extends Parameters<C[M]>>
  extends CallOverrides {
  contract: C
  method: M
  args: P
  chainId?: ChainId
  calculateGasPrice?: boolean
}

type UnpackPromiseResult<T> = T extends Promise<infer U> ? U : T

/**
 * auto insert estimated gas limit
 */
export async function callContract<
  C extends Contract,
  M extends keyof C['estimateGas'],
  P extends Parameters<C[M]>,
  R extends UnpackPromiseResult<ReturnType<C[M]>>,
>({ contract, method, args, chainId = ChainId.Fantom, ...overrides }: CallContractParams<C, M, P>) {
  return callOnChain<R>(async () => {
    const estimatedGasLimit = await contract.estimateGas[method as string](...args, overrides)

    const gasLimit = calculateGasMargin(estimatedGasLimit, chainId)

    return await contract[method as string](...args, { ...overrides, gasLimit })
  })
}

export interface HandleErrorOptions {
  toast?: ReturnType<typeof import('@chakra-ui/toast/dist/types/use-toast').default>
  suppress?: boolean
}

export function handleError(error: unknown, { toast, suppress }: HandleErrorOptions) {
  console.error(error)

  if (suppress) return

  if (isMetaMaskError(error)) {
    if (error.code === -32002) {
      if (error.message.includes('wallet_switchEthereumChain')) {
        toast?.({
          status: 'error',
          title: 'Pending request',
          description: 'Please check your extension for pending request.',
        })
      }
    } else {
      toast?.({ status: 'error', title: error.message, description: error.data?.message })
    }
  }

  if ((error as any).status) {
    const data = (error as any).data

    const description = `Status: ${data?.status}, Data: ${data?.data}, Error ${(error as any).status}`

    toast?.({ status: 'error', description })
  }

  if (error instanceof Error) toast?.({ status: 'error', description: error.message })
}

export function isRpcErrorHeaderNotFound(error: unknown) {
  return (
    isMetaMaskError(error) &&
    ((error.code === -32000 && error.message === 'header not found') ||
      (error.data?.code === -32000 && error.data?.message === 'header not found'))
  )
}

export function makeSignatureMessage(nonce: number | string) {
  return signatureMessage.replace('%s', nonce.toString())
}
