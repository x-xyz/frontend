import { ComponentStyleConfig } from '@chakra-ui/react'

const Radio: ComponentStyleConfig = {
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
    solid: {
      control: {
        borderColor: 'inactive',
        w: 6,
        h: 6,
        borderRadius: '4px',
        _hover: {
          bg: 'primary',
        },
        _checked: {
          bg: 'primary',
          borderColor: 'primary',
        },
        svg: {
          transform: 'scale(1.5)',
        },
      },
    },
    toggle: {
      control: {
        w: 8,
        h: 4,
        position: 'relative',
        borderRadius: '12px',
        borderWidth: '1px',
        borderColor: 'grey',
        bg: 'grey',
        _before: {
          content: '""',
          display: 'block',
          w: '12px',
          h: '12px',
          borderRadius: '10px',
          bg: 'primary',
          position: 'absolute',
          left: '1px',
          transition: 'all .3s',
        },
        _checked: {
          bg: 'primary',
          _before: {
            bg: 'background',
            w: '12px',
            h: '12px',
            left: '16px',
          },
        },
      },
      icon: { display: 'none' },
      container: {
        border: '1px solid',
        borderColor: 'divider',
        _checked: {
          borderColor: 'primary',
        },
      },
    },
    unstyled: {},
  },
  defaultProps: {
    variant: 'toggle',
    colorScheme: 'whiteAlpha',
  },
}

export default Radio
