import { ComponentStyleConfig } from '@chakra-ui/react'

const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {
      bg: '#1e1e1e',
      _focus: {
        bg: 'reaction',
      },
    },
  },
  sizes: {
    md: {
      field: {
        borderRadius: 0,
        h: 10,
        fontSize: 'sm',
      },
      addon: {
        h: 10,
        fontSize: 'sm',
      },
      element: {
        h: 10,
        fontSize: 'sm',
      },
    },
  },
  variants: {
    default: {
      field: {
        borderWidth: '1px',
        borderColor: 'divider',
        _invalid: {
          borderColor: 'danger',
        },
      },
    },
    solid: {
      field: {
        bg: 'reaction',
      },
    },
  },
  defaultProps: {
    variant: 'default',
    size: 'md',
  },
}

export default Input
