import { ComponentStyleConfig } from '@chakra-ui/react'

const Select: ComponentStyleConfig = {
  baseStyle: {
    field: {},
    icon: {},
  },
  sizes: {
    lg: {
      field: {
        borderRadius: '0px',
      },
    },
    md: {
      field: {
        borderRadius: '0px',
        h: 10,
      },
    },
    sm: {
      field: {
        borderRadius: '0px',
      },
    },
    xs: {
      field: {
        borderRadius: '0px',
      },
    },
  },
  variants: {
    outline: {
      field: {},
    },
    solid: {
      field: {
        bg: 'reaction',
      },
    },
  },
}

export default Select
