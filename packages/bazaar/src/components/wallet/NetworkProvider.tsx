import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { ChainId, getChainName, supportedChainIds } from '@x/constants'
import { networkProviderKey, networks } from '@x/constants'
import { useToast } from '@x/hooks'
import { shouldIgnoreWeb3Error } from '@x/hooks'
import { useEffect } from 'react'
import { getLibrary, useWeb3React } from '@x/utils'

const providers = [
  Web3ReactProvider,
  ...supportedChainIds.map(chainId => createWeb3ReactRoot(networkProviderKey[chainId])),
]

function ActivateNetwork({ chainId }: { chainId: ChainId }) {
  const { activate, error } = useWeb3React(networkProviderKey[chainId])

  const toast = useToast({ title: `${getChainName(chainId)} (${chainId})` })

  useEffect(() => {
    activate(networks[chainId], console.error)
  }, [activate, chainId])

  useEffect(() => {
    if (error) {
      console.error(error)
      if (!shouldIgnoreWeb3Error(error)) toast({ status: 'error', description: error.message })
    }
  }, [error, toast])

  return null
}

export default function NetworkProvider({ children }: { children: React.ReactNode }) {
  let elem = (
    <>
      {children}
      {supportedChainIds.map(chainId => (
        <ActivateNetwork key={chainId} chainId={chainId} />
      ))}
    </>
  )

  for (const Provider of providers) {
    elem = <Provider getLibrary={getLibrary}>{elem}</Provider>
  }

  return <>{elem}</>
}
