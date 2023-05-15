/* eslint-disable @typescript-eslint/no-explicit-any */

type ExtractTypeOf<T, U> = { [key in keyof T]: T[key] extends U ? key : never }[keyof T]

type ExcludeTypeOf<T, U> = { [key in keyof T]: T[key] extends U ? never : key }[keyof T]

interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
    autoRefreshOnNetworkChange?: boolean
    request?: (arg: { method: string; params?: any }) => Promise<any>
  }
  web3?: Record<string, unknown>
  gtag?: (...args: any[]) => void
}

type PropsOf<T> = T extends React.JSXElementConstructor<infer P> ? P : never

type Updater<T> = T | ((value: T) => T)
