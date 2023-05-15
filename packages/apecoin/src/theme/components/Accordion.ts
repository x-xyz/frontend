import { ComponentStyleConfig } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const Accordion: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {},
  variants: {
    default: props => ({
      container: {
        border: 'none',
      },
      button: {
        px: 0,
        _disabled: {
          cursor: 'auto',
        },
        _focus: {
          outline: 'primary',
        },
        _active: {
          outline: 'primary',
        },
      },
      panel: {},
      icon: {
        color: 'text',
        w: '1.4rem',
        h: '1.4rem',
      },
    }),
    ghost: {},
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Accordion
