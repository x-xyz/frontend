import { ComponentStyleConfig } from '@chakra-ui/react'

const Modal: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    default: {
      overlay: {
        bg: 'blackAlpha.600',
      },
      dialogContainer: {},
      dialog: {
        bg: 'panel',
        borderRadius: { base: 0, sm: '16px' },
        overflow: 'hidden',
        mt: { base: 0, sm: '3.75rem' },
        mb: { base: 0, sm: '3.75rem' },
        h: 'fit-content',
      },
      header: {
        color: 'primary',
        fontSize: '2xl',
        fontWeight: 'bold',
        bg: 'panel',
        pos: 'sticky',
        top: 0,
        zIndex: 'sticky',
      },
      closeButton: {
        color: 'primary',
      },
      body: {
        px: { base: 3, md: 6 },
        py: 4,
      },
      footer: {
        px: { base: 3, md: 6 },
        py: 4,
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Modal
