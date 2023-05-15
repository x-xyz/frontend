import { ComponentStyleConfig } from '@chakra-ui/react'

const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {
      color: 'primary',
    },
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
    solid: {
      field: {
        bg: 'panel',
      },
    },
    outline: {
      field: {
        bg: 'background',
        borderColor: 'divider',
      },
      addon: {
        bg: 'background',
        borderColor: 'divider',
      },
    },
  },
}

export default Input
