import {
  Web3Provider,
  JsonRpcBatchProvider,
  WebSocketProvider,
  JsonRpcSigner,
  BaseProvider,
} from '@ethersproject/providers'
import { Signer } from '@ethersproject/abstract-signer'
import { toUtf8Bytes } from '@ethersproject/strings'
import { hexlify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { BigNumberish, BigNumber } from '@ethersproject/bignumber'
import { useWeb3React as untypedUseWeb3React } from '@web3-react/core'
import { CallOptions, call, compose, fibonacci, multiply } from './'
import { isPlainObject, get, isNumber, isString } from 'lodash'

export { UnsupportedChainIdError } from '@web3-react/core'
export { NoEthereumProviderError, UserRejectedRequestError } from '@web3-react/injected-connector'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLibrary(provider: any) {
  let library: BaseProvider
  // use json rpc batch for mini rpc provider
  if (typeof provider.url === 'string') {
    library = new JsonRpcBatchProvider(provider.url, 'any')
  } else {
    library = new Web3Provider(provider, 'any')
  }
  library.pollingInterval = 15_000
  library.detectNetwork().catch(error => {
    console.error(provider)
    console.error(error)
  })
  return library
}

// export function getLibrary(provider: any) {
//   return new WebSocketProvider(
//     'wss://wsapi.fantom.network ',
//     typeof provider.chainId === 'number'
//       ? provider.chainId
//       : typeof provider.chainId === 'string'
//       ? parseInt(provider.chainId)
//       : 'any',
//   )
// }

/**
 * @see https://github.com/WalletConnect/walletconnect-monorepo/issues/347#issuecomment-880553018
 */
export async function signMessage(signer: Signer, address: string, message: string): Promise<string> {
  const messageBytes = toUtf8Bytes(message)
  if (signer instanceof JsonRpcSigner) {
    try {
      const signature = await signer.provider.send('personal_sign', [hexlify(messageBytes), address.toLowerCase()])
      return signature
    } catch (
      e: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) {
      if (e.message.includes('personal_sign')) {
        return await signer.signMessage(messageBytes)
      }
      throw e
    }
  } else {
    return await signer.signMessage(messageBytes)
  }
}

export function useWeb3React<T = Web3Provider>(key?: string) {
  try {
    return untypedUseWeb3React<T>(key)
  } catch {
    console.warn('not found web3 react provider for', key)
    return untypedUseWeb3React<T>()
  }
}

export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) return 'invalid address'
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function compareAddress(a?: string | null, b?: string | null) {
  if (!a || !b) return false
  // it may throw if address is invalid
  try {
    const addressA = getAddress(a.toLowerCase())
    const addressB = getAddress(b.toLowerCase())
    return addressA === addressB
  } catch {
    return false
  }
}

export function compareBigNumberish(a?: BigNumberish | null, b?: BigNumberish | null) {
  if (!a || !b) return false
  return BigNumber.from(a).eq(b)
}

function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(
  address: string,
  abi: ContractInterface,
  library: Web3Provider,
  account?: string,
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, abi, getProviderOrSigner(library, account))
}

export function getValidAddress(...values: unknown[]) {
  return values.find(value => typeof value === 'string' && isAddress(value)) as string | undefined
}

export function isRpcErrorHeaderNotFound(error: unknown) {
  return (
    isMetaMaskError(error) &&
    ((error.code === -32000 && error.message === 'header not found') ||
      (error.data?.code === -32000 && error.data?.message === 'header not found'))
  )
}

/**
 * call on chain function or data, handle general retry mechanism
 */
export function callOnChain<T>(fn: () => Promise<T>, options: CallOptions = {}) {
  return call(fn, {
    retry: isRpcErrorHeaderNotFound,
    maxAttempt: 3,
    timeout: compose(fibonacci, multiply(500)),
    ...options,
  })
}

export interface MetaMaskError {
  code: number
  message: string
  data?: {
    code?: number
    message?: string
  }
}

export function isMetaMaskError(value: unknown): value is MetaMaskError {
  return isPlainObject(value) && isNumber(get(value, 'code')) && isString(get(value, 'message'))
}
