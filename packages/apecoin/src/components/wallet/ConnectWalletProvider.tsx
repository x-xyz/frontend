import { useDisclosure } from '@chakra-ui/hooks'
import { createContext, useContext } from 'react'
import ConnectWalletModal from './ConnectWalletModal'

interface ConnectWalletContext {
  modal: Pick<ReturnType<typeof useDisclosure>, 'isOpen' | 'onOpen' | 'onClose'>
}

const Context = createContext<ConnectWalletContext>({
  modal: {
    isOpen: false,
    onClose: () => void 0,
    onOpen: () => void 0,
  },
})

export default function ConnectWalletProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, onClose, onOpen } = useDisclosure()

  const modal = { isOpen, onClose, onOpen }

  return (
    <Context.Provider value={{ modal }}>
      {children}
      <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
    </Context.Provider>
  )
}

export function useConnectWalletModal() {
  return useContext(Context).modal
}
