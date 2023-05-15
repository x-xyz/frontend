import { ComponentStyleConfig } from '@chakra-ui/react'

const Accordion: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {},
  variants: {
    default: {
      root: {},
      container: {
        borderWidth: '1px',
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'hidden',
        '&:not(:last-child)': {
          mb: 6,
        },
      },
      button: {
        bg: 'panel',
        fontWeight: 'bold',
        color: 'primary',
        _disabled: {
          cursor: 'auto',
        },
        _focus: {
          outline: 'none',
          boxShadow: 'nonw',
          border: 'none',
          _after: {
            content: '"‣"',
            fontSize: '4xl',
            display: 'block',
            position: 'absolute',
            color: 'primary',
            left: -3,
            top: '50%',
            transform: 'translateY(-50%)',
          },
        },
        _active: { outline: 'none', boxShadow: 'nonw', border: 'none' },
        _hover: {
          bg: 'whiteAlpha.400',
        },
      },
      panel: {
        maxH: '560px',
        overflowY: 'auto',
      },
      icon: {},
    },
    compact: {
      container: {
        border: 'none',
      },
      button: {
        _disabled: {
          cursor: 'auto',
        },
        _focus: {
          outline: 'none',
          boxShadow: 'nonw',
          border: 'none',
          _after: {
            content: '"‣"',
            fontSize: '4xl',
            display: 'block',
            position: 'absolute',
            color: 'primary',
            left: -3,
            top: '50%',
            transform: 'translateY(-50%)',
          },
        },
        _active: { outline: 'none', boxShadow: 'nonw', border: 'none' },
        _hover: {
          bg: 'whiteAlpha.400',
        },
      },
      panel: {},
      icon: {},
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Accordion
