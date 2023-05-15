import { ComponentStyleConfig } from '@chakra-ui/react'

const Checkbox: ComponentStyleConfig = {
  baseStyle: {
    container: {
      cursor: 'pointer',
      borderRadius: '10px',
      px: 4,
      py: 2,
      _hover: {
        background: 'gray.800',
      },
    },
    label: {
      color: 'primary',
      _disabled: {
        color: 'secondary',
      },
    },
    control: {
      borderColor: 'gray.600',
      _checked: {
        color: 'primary',
        bg: 'transparent',
        border: '1px solid',
        _before: {
          bg: 'primary',
          w: '80%',
          h: '80%',
        },
      },
      _active: {
        // remove default outline
        boxShadow: 'none !important',
        textShadow: '0 1px 8px rgb(255 255 255)',
      },
      _focus: {
        // remove default outline
        boxShadow: 'none !important',
        textShadow: '0 1px 8px rgb(255 255 255)',
        position: 'relative',
        _after: {
          content: '"‣"',
          fontSize: '4xl',
          display: 'block',
          position: 'absolute',
          color: 'primary',
          left: -3,
          top: '50%',
          transform: 'translateY(-50%)',
        },
      },
    },
  },
  variants: {
    outline: {
      container: {
        cursor: 'pointer',
        borderWidth: '1px',
        borderColor: 'gray.600',
        borderRadius: '10px',
        px: 4,
        py: 2,
        _checked: {
          borderColor: 'secondary',
        },
      },
    },
    ghost: {},
    toggle: {
      control: {
        w: '64px',
        h: '32px',
        position: 'relative',
        borderRadius: '16px',
        border: 'none',
        bg: 'linear-gradient(89.58deg, #ACABAB 3.86%, rgba(196, 196, 196, 0) 129.07%)',
        _before: {
          content: '""',
          display: 'block',
          w: '26px',
          h: '26px',
          borderRadius: '15px',
          bg: '#06071F',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px 0px 10px -4px rgba(255, 255, 255, 0.88)',
          position: 'absolute',
          left: '3px',
          transition: 'all .3s',
        },
        _checked: {
          bg: 'linear-gradient(89.58deg, #ACABAB 3.86%, rgba(196, 196, 196, 0) 129.07%)',
          _before: {
            w: '26px',
            h: '26px',
            left: '32px',
          },
        },
      },
      icon: { display: 'none' },
    },
    unstyled: {},
  },
  defaultProps: {
    variant: 'toggle',
    colorScheme: 'whiteAlpha',
  },
}

export default Checkbox
