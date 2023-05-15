import { ComponentStyleConfig } from '@chakra-ui/react'

const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {
      bg: 'background',
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
        border: '1px solid',
        borderRadius: '18px',
        borderColor: 'divider',
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
