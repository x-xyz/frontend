import { ComponentStyleConfig } from '@chakra-ui/react'

const Accordion: ComponentStyleConfig = {
  baseStyle: {
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
  sizes: {},
}

export default Accordion
