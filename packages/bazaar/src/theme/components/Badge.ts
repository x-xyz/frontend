import { ComponentStyleConfig } from '@chakra-ui/react'

const Badge: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {
    sm: {
      h: 7,
      p: 1,
    },
    md: {
      minW: 30,
      h: 10,
      p: 2.5,
    },
  },
  variants: {
    default: {
      display: 'inline-flex',
      flexDirection: 'row',
      alignItems: 'center',
      bg: 'panel',
      borderRadius: '8px',
      fontWeight: 'normal',
      color: 'primary',
    },
  },
  defaultProps: {
    variant: 'default',
    size: 'md',
  },
}

export default Badge
