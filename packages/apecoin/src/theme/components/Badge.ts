import { ComponentStyleConfig } from '@chakra-ui/react'

const Badge: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: 0,
    fontWeight: 'inherit',
    fontStyle: 'inherit',
  },
  sizes: {
    sm: {
      h: 7,
      p: 1,
      fontSize: 'xs',
    },
    md: {
      minW: 30,
      h: 10,
      px: 2.5,
      py: 1,
      fontSize: 'sm',
    },
  },
  variants: {
    solid: {
      bg: '#393939',
      display: 'inline-flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    outline: {
      bg: '#000000',
      color: 'text',
      borderColor: 'divider',
      borderWidth: '1px',
      display: 'inline-flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tag: {
      bg: 'note',
      color: '#000',
      borderRadius: '4px',
      py: 1,
      h: 'fit-content',
    },
  },
  defaultProps: {
    variant: 'solid',
    size: 'md',
  },
}

export default Badge
