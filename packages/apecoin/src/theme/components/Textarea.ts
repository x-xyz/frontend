import { ComponentStyleConfig } from '@chakra-ui/react'

const Textarea: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: 0,
    bg: '#1e1e1e',
    _focus: {
      bg: 'reaction',
    },
  },
  sizes: {
    md: {
      borderRadius: 0,
      fontSize: 'sm',
    },
  },
  variants: {
    default: {
      borderWidth: '1px',
      borderColor: 'divider',
      _invalid: {
        borderColor: 'danger',
      },
    },
    solid: {
      bg: 'reaction',
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Textarea
