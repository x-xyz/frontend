import { ComponentStyleConfig, textDecoration } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const Button: ComponentStyleConfig = {
  baseStyle: props => ({
    _focus: {
      boxShadow: `none !important`,
      outline: 'primary',
    },
    _active: {
      boxShadow: `none !important`,
      outline: 'primary',
    },
    borderRadius: 0,
  }),
  sizes: {
    md: {},
  },
  variants: {
    solid: {
      h: 12,
      bg: 'primary',
      color: 'black',
      _hover: {
        bg: 'primaryHover',
        _disabled: {
          bg: 'textDisable',
          color: 'textSecondary',
        },
      },
      _active: {
        bg: 'textDisable',
        color: 'white',
      },
      _disabled: {
        bg: 'textDisable',
        color: 'textSecondary',
      },
    },
    outline: {
      h: 12,
      borderColor: 'line',
      color: 'primary',
      _hover: {
        color: 'primaryHover',
        bg: 'none',
      },
      _active: {
        color: 'white',
        bg: 'none',
      },
    },
    icon: {
      borderRadius: 'full',
      border: '1px solid',
      borderColor: 'line',
      backgroundColor: 'bg1',
      _hover: {
        color: 'primaryHover',
        _disabled: {
          color: 'line',
          bgColor: 'bg1',
        },
      },
      _active: {
        color: 'primary',
      },
      _disabled: {
        color: 'line',
      },
    },
    link: {
      color: 'white',
      fontWeight: 'normal',
      _hover: {
        textDecoration: 'none',
        color: 'primary',
      },
    },
    unstyled: {
      h: 'unset',
      w: 'unset',
      minW: 'unset',
      fontSize: 'inherit',
      fontWeight: 'inherit',
    },
    'list-item': {
      _hover: {
        bg: 'panel',
        color: 'primary',
      },
    },
    group: {
      px: 3,
      py: 2,
      color: 'textSecondary',
      _active: {
        color: 'primary',
        bgColor: 'bg2',
      },
      _hover: {
        bgColor: 'bg2',
      },
    },
    dropdown: {
      h: 12,
      bg: 'bg2',
      color: 'white',
      _hover: {
        bg: 'primaryHover',
        _disabled: {
          bg: 'textDisable',
          color: 'textSecondary',
        },
      },
      _active: {
        bg: 'textDisable',
        color: 'white',
      },
      _disabled: {
        bg: 'textDisable',
        color: 'textSecondary',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
  },
}

export default Button
