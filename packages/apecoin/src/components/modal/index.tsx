import {
  Button,
  ButtonProps,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  useDisclosure,
} from '@chakra-ui/react'
import InfoIcon from 'components/icons/InfoIcon'
import ModalIcon from './ModalIcon'

interface CreateInfoModalConfigs {
  title: React.ReactNode
  content: React.ReactNode
}

function createInfoModal({ title, content }: CreateInfoModalConfigs) {
  function InfoModal(props: Omit<ModalProps, 'children'>) {
    return (
      <Modal variant="info" {...props}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalIcon>
              <Image src="/assets/icons/ico-info-56x56.png" />
            </ModalIcon>
            {title}
          </ModalHeader>
          <ModalBody>{content}</ModalBody>
          <ModalFooter>
            <Button w="full" onClick={props.onClose}>
              Got It!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  return InfoModal
}

interface CreateModalIconButtonConfigs {
  icon: React.ReactElement
  description: string
  Modal: React.JSXElementConstructor<Omit<ModalProps, 'children'>>
}

function createModalIconButton({ icon, Modal, description }: CreateModalIconButtonConfigs) {
  function ModalIconButton(props: ButtonProps) {
    const { isOpen, onClose, onOpen } = useDisclosure()
    return (
      <>
        <IconButton variant="icon" aria-label={description} icon={icon} onClick={onOpen} {...props} />
        <Modal isOpen={isOpen} onClose={onClose} />
      </>
    )
  }

  return ModalIconButton
}

export const VexClaimableAmountInfoModal = createInfoModal({
  title: 'Claimable Amount',
  content:
    'Platform fee emissions you are eligible to claim. You can claim the tokens anytime which incurs a transaction fee, or you can roll the amount over to claim at a later date.',
})

export const VexClaimableAmountInfoModalButton = createModalIconButton({
  icon: <InfoIcon w={3} h={3} fill="primary" />,
  description: 'Vex claimable amount explanation',
  Modal: VexClaimableAmountInfoModal,
})

export const VexUnlockDateInfoModal = createInfoModal({
  title: 'veX Unlock Date',
  content: 'The date you will be able to withdraw your X tokens.',
})

export const VexUnlockDateInfoModalButton = createModalIconButton({
  icon: <InfoIcon w={3} h={3} fill="primary" />,
  description: 'Vex unlock date explanation',
  Modal: VexUnlockDateInfoModal,
})

export const VexAprInfoModal = createInfoModal({
  title: 'Annualised Percentage Rate (APR)',
  content: 'Valuation is based on a 4 year lock of veX and based on the previous week’s WETH emissions.',
})

export const VexAprInfoModalButton = createModalIconButton({
  icon: <InfoIcon w={3} h={3} fill="primary" />,
  description: 'Vex APR explanation',
  Modal: VexAprInfoModal,
})

export const DailyRewardsEarnedPerEligibleListingPerDayModal = createInfoModal({
  title: 'About Reward',
  content: 'Daily Rewards Earned Per Eligible Listing Per Day',
})

export const DailyRewardsEarnedPerEligibleListingPerDayModalButton = createModalIconButton({
  icon: <InfoIcon w={3} h={3} fill="primary" />,
  description: 'Reward detail',
  Modal: DailyRewardsEarnedPerEligibleListingPerDayModal,
})
