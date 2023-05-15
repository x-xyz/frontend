import { ComponentStyleConfig } from '@chakra-ui/react'
import layout from '../layout'

const Modal: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    action: {
      overlay: {
        bg: 'blackAlpha.700',
        display: ['none', 'none', 'block'],
      },
      dialogContainer: {},
      dialog: {
        bg: 'panel',
        borderStyle: 'solid',
        borderWidth: [0, 0, '1px'],
        borderColor: 'divider',
        borderRadius: 0,
        overflow: 'hidden',
        mt: [layout.headerHeight, layout.headerHeight, '3.75rem'],
        mb: [0, 0, '3.75rem'],
        h: [`calc(100% - ${layout.headerHeight})`, `calc(100% - ${layout.headerHeight})`, 'fit-content'],
        p: [2, 2, 3],
      },
      header: {
        fontWeight: 'bold',
        fontSize: '3xl',
        bg: 'panel',
        pos: 'sticky',
        top: 0,
        zIndex: 'sticky',
      },
      closeButton: {
        color: 'primary',
      },
      body: {
        overflowY: ['auto', 'auto', 'unset'],
      },
      footer: {
        pt: 8,
      },
    },
    info: {
      overlay: {
        bg: 'blackAlpha.700',
        display: ['none', 'none', 'block'],
      },
      dialogContainer: {},
      dialog: {
        bg: 'panel',
        borderStyle: 'solid',
        borderWidth: [0, 0, '1px'],
        borderColor: 'divider',
        borderRadius: 0,
        overflow: 'hidden',
        mt: [layout.headerHeight, layout.headerHeight, '3.75rem'],
        mb: [0, 0, '3.75rem'],
        h: [`calc(100% - ${layout.headerHeight})`, `calc(100% - ${layout.headerHeight})`, 'fit-content'],
        p: [2, 2, 3],
      },
      header: {
        fontWeight: 'extrabold',
        bg: 'panel',
        pos: 'sticky',
        top: 0,
        zIndex: 'sticky',
      },
      closeButton: {
        color: 'primary',
      },
      body: {
        overflowY: ['auto', 'auto', 'unset'],
      },
      footer: {
        pt: 8,
      },
    },
  },
  defaultProps: {
    variant: 'action',
  },
}

export default Modal
