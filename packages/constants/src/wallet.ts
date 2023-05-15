import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { InjectedConnector, NoEthereumProviderError } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { keyBy, mapValues } from 'lodash';
import { ChainId, chainMetadata, getChain, getChainName, makeChainIdMap, supportedChainIds } from './network'
import { isMobile } from 'react-device-detect'

export interface SupportedWallet {
  name: string
  connector: AbstractConnector
  icon?: string
  failback?: (error: unknown) => void
}

function makeNetworkConnector(chainId: ChainId) {
  return new NetworkConnector({ urls: { [chainId]: getChain(chainId).rpcUrl }, defaultChainId: chainId })
}

export const networks = makeChainIdMap(makeNetworkConnector)

export const networkProviderKey = makeChainIdMap(chainId => `${getChainName(chainId)}Network`)

export let gnosisSafe: SafeAppConnector | null = null

export let injected: InjectedConnector | null = null

export let walletlink: WalletLinkConnector | null = null

export let walletConnect: WalletConnectConnector | null = null

export let supportedWallets: SupportedWallet[] = []

export function setupWallets() {
  gnosisSafe = new SafeAppConnector()

  injected = new InjectedConnector({ supportedChainIds })

  const rpcMapping = mapValues(keyBy(supportedChainIds), v => chainMetadata[v].rpcUrl)
  walletConnect = new WalletConnectConnector({
    rpc: rpcMapping,
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
  })

  walletlink = new WalletLinkConnector({
    url: chainMetadata[ChainId.Ethereum].rpcUrl,
    appName: 'X',
    supportedChainIds,
    // appLogoUrl: '',
  })

  supportedWallets = [
    {
      name: 'MetaMask',
      connector: injected,
      icon: '/assets/icons/metamask.png',
      failback: error => {
        if (error instanceof NoEthereumProviderError) {
          if (isMobile) {
            window.open(
              `https://metamask.app.link/dapp/${location.href.replace(/https?:\/\//, '')}`,
              '_blank',
              'noopener,noreferrer',
            )
            return
          }
        }

        throw error
      },
    },
    {
      name: 'WalletConnect',
      connector: walletConnect,
      failback: error => {
        throw error
      },
      icon: '/assets/icons/walletconnect.svg'
    },
    {
      name: 'Coinbase Wallet',
      connector: walletlink,
      icon: '/assets/icons/coinbase.svg',
    },
  ]
}
