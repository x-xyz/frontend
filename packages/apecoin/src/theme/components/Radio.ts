import { ComponentStyleConfig } from '@chakra-ui/react'

const Radio: ComponentStyleConfig = {
  baseStyle: {
    control: {
      borderColor: 'divider',
      borderWidth: '1px',
      bg: 'panel',
      _checked: {
        bg: 'transparent',
        borderColor: 'divider',
        color: 'primary',
        _before: {
          bg: 'primary',
          w: '70%',
          h: '70%',
        },
      },
    },
  },
  variants: {
    solid: {
      container: {
        cursor: 'pointer',
        pos: 'relative',
        px: 0,
        py: 2,
        _hover: {
          background: 'gray.800',
        },
      },
      label: {
        fontSize: 'sm',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
  },
}

export default Radio
