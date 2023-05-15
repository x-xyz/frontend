import { ComponentStyleConfig } from '@chakra-ui/react'

const Textarea: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: 0,
    bg: 'background',
    _focus: {
      bg: 'reaction',
    },
  },
  sizes: {
    md: {
      fontSize: 'sm',
    },
  },
  variants: {
    default: {
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderColor: 'divider',
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
