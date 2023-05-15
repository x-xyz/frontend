import { createContext, useContext } from 'react'
import { useDisclosure } from '@chakra-ui/hooks'
import { useActiveWeb3React } from '@x/hooks'
import { defaultNetwork } from '@x/constants'
import WrapNativeModal from 'components/WrapNativeModal'
import ModeratorModal from 'components/admin/ModeratorModal'
import BanAccountModal from 'components/admin/BanAccountModal'
import BanCollectionModal from 'components/admin/BanCollectionModal'
import BanNftItemModal from 'components/admin/BanNftItemModal'

export interface ModalControl {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onToggle: () => void
}

const noopModalControl: ModalControl = {
  isOpen: false,
  onClose: () => void 0,
  onOpen: () => void 0,
  onToggle: () => void 0,
}

function toModalControl({ isOpen, onClose, onOpen, onToggle }: ReturnType<typeof useDisclosure>): ModalControl {
  return { isOpen, onClose, onOpen, onToggle }
}

export interface AccountModalContext {
  wrapNativeModal: ModalControl
  moderatorModal: ModalControl
  banAccountModal: ModalControl
  unbanAccountModal: ModalControl
  banCollectionModal: ModalControl
  unbanCollectionModal: ModalControl
  banNftItemModal: ModalControl
  unbanNftItemModal: ModalControl
}

const Context = createContext<AccountModalContext>({
  wrapNativeModal: noopModalControl,
  moderatorModal: noopModalControl,
  banAccountModal: noopModalControl,
  unbanAccountModal: noopModalControl,
  banCollectionModal: noopModalControl,
  unbanCollectionModal: noopModalControl,
  banNftItemModal: noopModalControl,
  unbanNftItemModal: noopModalControl,
})

export default function AccountModalProvider({ children }: { children: React.ReactNode }) {
  const { chainId = defaultNetwork } = useActiveWeb3React()

  const wrapNativeModal = useDisclosure()

  const moderatorModal = useDisclosure()

  const banAccountModal = useDisclosure()

  const unbanAccountModal = useDisclosure()

  const banCollectionModal = useDisclosure()

  const unbanCollectionModal = useDisclosure()

  const banNftItemModal = useDisclosure()

  const unbanNftItemModal = useDisclosure()

  return (
    <Context.Provider
      value={{
        wrapNativeModal: toModalControl(wrapNativeModal),
        moderatorModal: toModalControl(moderatorModal),
        banAccountModal: toModalControl(banAccountModal),
        unbanAccountModal: toModalControl(unbanAccountModal),
        banCollectionModal: toModalControl(banCollectionModal),
        unbanCollectionModal: toModalControl(unbanCollectionModal),
        banNftItemModal: toModalControl(banNftItemModal),
        unbanNftItemModal: toModalControl(unbanNftItemModal),
      }}
    >
      {children}
      <WrapNativeModal chainId={chainId} isOpen={wrapNativeModal.isOpen} onClose={wrapNativeModal.onClose} />
      <ModeratorModal isOpen={moderatorModal.isOpen} onClose={moderatorModal.onClose} mode="add" />
      <BanAccountModal mode="ban" isOpen={banAccountModal.isOpen} onClose={banAccountModal.onClose} />
      <BanAccountModal mode="unban" isOpen={unbanAccountModal.isOpen} onClose={unbanAccountModal.onClose} />
      <BanCollectionModal mode="ban" isOpen={banCollectionModal.isOpen} onClose={banCollectionModal.onClose} />
      <BanCollectionModal mode="unban" isOpen={unbanCollectionModal.isOpen} onClose={unbanCollectionModal.onClose} />
      <BanNftItemModal mode="ban" isOpen={banNftItemModal.isOpen} onClose={banNftItemModal.onClose} />
      <BanNftItemModal mode="unban" isOpen={unbanNftItemModal.isOpen} onClose={unbanNftItemModal.onClose} />
    </Context.Provider>
  )
}

export function useAccountModal() {
  return useContext(Context)
}
