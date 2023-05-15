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
        borderRadius: '6px',
      },
    },
    md: {
      field: {
        borderRadius: '6px',
        h: 12,
      },
      addon: {
        borderRadius: '6px',
        h: 12,
      },
    },
    sm: {
      field: {
        borderRadius: '6px',
        h: 12,
      },
      addon: {
        borderRadius: '6px',
        h: 12,
      },
    },
    xs: {
      field: {
        borderRadius: '6px',
      },
    },
  },
  variants: {
    solid: {
      field: {
        bg: 'field',
      },
      addon: {
        bg: 'field',
      },
    },
    outline: {
      field: {
        bg: 'field',
        borderColor: 'divider',
      },
      addon: {
        bg: 'field',
        borderColor: 'divider',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
  },
}

export default Input
