import { IconButton, IconButtonProps } from '@chakra-ui/button'
import { SettingsIcon } from '@chakra-ui/icons'
import { Spinner } from '@chakra-ui/spinner'
import { useDisclosure, useCallbackRef } from '@chakra-ui/hooks'
import { fetchAccountV2 } from '@x/apis/dist/fn'
import { useQuery } from 'react-query'
import EditProfileModal from './EditProfileModal'
import { Account } from '@x/models'
import { useActiveWeb3React } from '@x/hooks'

export interface EditProfileButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  defaultValues?: Partial<Pick<Account, 'alias' | 'bio' | 'email' | 'imageHash'>>
  onChange?: () => void
  icon?: IconButtonProps['icon']
}

export default function EditProfileButton({ defaultValues, onChange, ...props }: EditProfileButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { account } = useActiveWeb3React()

  const { data, isLoading, refetch } = useQuery(['account', account || ''], fetchAccountV2, { enabled: !!account })

  const innerOnChange = useCallbackRef(() => {
    onChange?.()
    refetch()
  }, [onChange, refetch])

  return (
    <>
      <IconButton
        aria-label="Edit Profile"
        onClick={onOpen}
        {...props}
        icon={isLoading ? <Spinner /> : props.icon || <SettingsIcon />}
      />
      <EditProfileModal
        isOpen={isOpen}
        onClose={onClose}
        defaultValues={
          defaultValues || {
            alias: data?.alias,
            email: data?.email,
            bio: data?.bio,
            imageHash: data?.imageHash,
          }
        }
        onChange={innerOnChange}
      />
    </>
  )
}
