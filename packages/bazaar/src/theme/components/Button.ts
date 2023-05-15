import { ComponentStyleConfig } from '@chakra-ui/react'
import { transparentize } from '@chakra-ui/theme-tools'

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'normal',
  },
  sizes: {
    sm: {
      fontSize: 'sm',
      h: 8,
      borderRadius: '10px',
      px: 3,
    },
    md: {
      fontSize: 'md',
      h: 10,
      borderRadius: '10px',
      px: 6,
    },
    lg: {
      fontSize: 'md',
      fontWeight: 'medium',
      h: 12,
      borderRadius: '8px',
      px: { base: 6, md: 10 },
    },
  },
  variants: {
    solid: {
      bg: 'primary',
      color: 'black',
      _active: {
        bg: 'whiteAlpha.600',
      },
      _hover: {
        bg: 'whiteAlpha.600',
        _disabled: {
          bg: 'primary',
        },
      },
    },
    outline: {
      color: 'primary',
      border: 'solid 1px',
      // to sync with font color
      borderColor: 'currentColor',
      _hover: {
        bg: 'whiteAlpha.400',
      },
    },
    ghost: props => ({
      bg: transparentize('primary', 0.25)(props.theme),
      color: 'primary',
    }),
  },
}

export default Button
