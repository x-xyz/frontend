import dynamic from 'next/dynamic'

const NetworkProvider = dynamic(() => import('components/wallet/NetworkProvider'), { ssr: false })

// to prevent SSR interruption
export default function NetworkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.browser) return <>{children}</>
  return <NetworkProvider>{children}</NetworkProvider>
}
