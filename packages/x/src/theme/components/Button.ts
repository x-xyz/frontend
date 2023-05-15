import { ComponentStyleConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'medium',
  },
  sizes: {
    sm: {
      fontSize: 'sm',
      h: 8,
      borderRadius: '6px',
      px: 3,
    },
    md: {
      fontSize: 'md',
      h: 12,
      minW: '148px',
      borderRadius: '9px',
      px: 6,
    },
    lg: {
      fontSize: 'md',
      h: 14,
      borderRadius: '10px',
      px: 6,
    },
    xl: {
      fontSize: 'md',
      h: '72px',
      borderRadius: '10px',
      px: 6,
    },
  },
  variants: {
    solid: props => ({
      bg: mode(``, `${props.colorScheme}.700`)(props),
      color: 'text',
    }),
    outline: {},
    primary: {
      bg: 'brand.700',
      color: 'text',
      _hover: {
        _disabled: {
          bg: 'primary',
        },
      },
    },
    ghost: {
      _active: {
        fontWeight: 'bold',
        bg: 'linear-gradient(150.71deg, #C471ED -30.38%, #F7797D 41.23%, rgba(251, 215, 134, 0.81) 115.2%)',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    },
  },
  defaultProps: {
    colorScheme: 'brand',
  },
}

export default Button
