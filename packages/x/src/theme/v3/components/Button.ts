import { ComponentStyleConfig } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const Button: ComponentStyleConfig = {
  baseStyle: props => ({
    color: 'primary',
    _focus: {
      boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
      outline: 'primary',
    },
    _active: {
      boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
      outline: 'primary',
    },
    _disabled: {
      opacity: 1,
    },
  }),
  sizes: {
    md: {
      fontSize: 'md',
      fontWeight: 'extrabold',
      h: 10,
      minW: '120px',
      borderRadius: '20px',
      px: 4,
    },
  },
  variants: {
    solid: {
      bg: 'button',
      borderColor: 'divider',
      borderWidth: 1,
      borderRadius: '6px',
      _disabled: {
        color: '#26515a',
        bg: 'background',
      },
      _hover: {
        bg: 'reaction',
        _disabled: {
          bg: 'background',
        },
      },
      _active: {
        bg: 'reaction',
      },
    },
    icon: {
      h: 'unset',
      minW: 'unset',
      border: 'none',
      boxSizing: 'border-box',
      _hover: {
        opacity: 0.6,
      },
    },
    link: {
      h: 'unset',
      minW: 'unset',
      borderRadius: 'unset',
      _hover: {
        color: 'primary',
        textDecor: 'none',
      },
    },
    unstyled: {
      h: 'unset',
      minW: 'unset',
      borderRadius: 'unset',
    },
    'list-item': {
      w: 'full',
      h: 'unset',
      px: 2,
      py: 2,
      borderRadius: 'unset',
      color: 'text',
      justifyContent: 'flex-start',
      fontSize: 'sm',
      fontWeight: 'bold',
      _hover: {
        color: 'primary',
        bg: 'reaction',
      },
    },
    badge: {
      borderRadius: 'unset',
      border: '1px solid',
      borderColor: 'divider',
    },
  },
  defaultProps: {
    variant: 'solid',
  },
}

export default Button
