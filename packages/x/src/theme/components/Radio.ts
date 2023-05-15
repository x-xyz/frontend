import { ComponentStyleConfig } from '@chakra-ui/react'

const Radio: ComponentStyleConfig = {
  baseStyle: {
    control: {
      _checked: {
        bg: 'transparent',
        borderColor: 'primary',
        border: '1px solid',
        color: 'primary',
        _before: {
          bg: 'primary',
          w: '40%',
          h: '40%',
        },
      },
    },
    label: {
      color: 'primary',
    },
  },
  variants: {
    solid: {
      container: {
        cursor: 'pointer',
        background: 'field',
        borderRadius: '10px',
        px: 4,
        py: 2,
        _hover: {
          background: 'gray.800',
        },
      },
    },
  },
  defaultProps: {
    variant: 'solid',
  },
}

export default Radio
