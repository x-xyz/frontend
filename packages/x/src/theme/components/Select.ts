import { ComponentStyleConfig } from '@chakra-ui/react'

const Select: ComponentStyleConfig = {
  baseStyle: {
    field: {},
    icon: {},
  },
  sizes: {
    lg: {
      field: {
        borderRadius: '10px',
      },
    },
    md: {
      field: {
        borderRadius: '10px',
        h: 14,
      },
    },
    sm: {
      field: {
        borderRadius: '10px',
      },
    },
    xs: {
      field: {
        borderRadius: '10px',
      },
    },
  },
  variants: {
    outline: {
      field: {
        bg: 'field',
        border: 'none',
      },
    },
  },
}

export default Select
