import ModalIcon from 'components/modal/ModalIcon'
import { useRef } from 'react'

import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useCallbackRef,
} from '@chakra-ui/react'
import { useToast as useBaseToast, UseToastOptions } from '@x/hooks'

export type Toast = ReturnType<typeof useToast>

export default function useToast(options: UseToastOptions = {}) {
  const optionsRef = useRef<UseToastOptions>({ position: 'top-left', duration: null, ...options })
  const baseToast = useBaseToast(optionsRef.current)
  const toast: typeof baseToast = useCallbackRef(
    (options: UseToastOptions = {}) => {
      return baseToast({
        ...options,
        render: ({ onClose }) => {
          function render() {
            return (
              <Modal isOpen onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader textTransform="uppercase">
                    {/*<StatusIcon status={options.status} />*/}
                    {options.title}
                  </ModalHeader>
                  {options.description && <ModalBody>{options.description}</ModalBody>}
                  <ModalFooter>
                    <Button w="full" onClick={onClose} textTransform="uppercase" variant="outline">
                      Close
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )
          }
          return render()
        },
      })
    },
    [baseToast],
  ) as any
  toast.close = baseToast.close
  toast.closeAll = baseToast.closeAll
  toast.isActive = baseToast.isActive
  return toast
}

interface StatusIconProps {
  status: UseToastOptions['status']
}

const statusToIcon: Record<Required<UseToastOptions>['status'], React.JSXElementConstructor<any>> = {
  success: () => <Image w={7} h={7} src="/assets/v3/ico-success-56x56.png" />,
  error: () => <Image w={7} h={7} src="/assets/v3/ico-error-56x56.png" />,
  warning: () => null,
  info: () => <Image w={7} h={7} src="/assets/v3/ico-info-56x56.png" />,
}

function StatusIcon({ status }: StatusIconProps) {
  const Icon = status && statusToIcon[status]
  return <ModalIcon>{Icon && <Icon />}</ModalIcon>
}
