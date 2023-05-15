import { ComponentStyleConfig } from '@chakra-ui/react'

const Modal: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    default: {
      overlay: {
        background: 'whiteAlpha.600',
      },
      dialogContainer: {},
      dialog: {
        background: 'background',
        borderRadius: { base: 0, sm: '16px' },
        mt: { base: 0, sm: '3.75rem' },
        mb: { base: 0, sm: '3.75rem' },
        h: { base: '-webkit-fill-available', sm: 'fit-content' },
      },
      header: {
        color: 'primary',
        fontSize: '2xl',
        fontWeight: 'bold',
      },
      closeButton: {
        color: 'primary',
      },
      body: {
        px: { base: 3, md: 9 },
        py: 6,
      },
      footer: {
        px: 9,
        py: 6,
        justifyContent: 'center',
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Modal
