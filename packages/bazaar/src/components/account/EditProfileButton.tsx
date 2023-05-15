import { IconButton, IconButtonProps } from '@chakra-ui/button'
import { SettingsIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/hooks'
import EditProfileModal from './EditProfileModal'
import { Account } from '@x/models'

export interface EditProfileButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  defaultValues?: Partial<Pick<Account, 'alias' | 'bio' | 'email' | 'imageHash'>>
  onChange?: () => void
}

export default function EditProfileButton({ defaultValues, onChange, ...props }: EditProfileButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton aria-label="Edit Profile" icon={<SettingsIcon />} onClick={onOpen} {...props} />
      <EditProfileModal isOpen={isOpen} onClose={onClose} defaultValues={defaultValues} onChange={onChange} />
    </>
  )
}
