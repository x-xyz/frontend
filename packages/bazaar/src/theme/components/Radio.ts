import { ComponentStyleConfig } from '@chakra-ui/react'

const Radio: ComponentStyleConfig = {
  baseStyle: {
    container: {
      cursor: 'pointer',
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'divider',
      px: 4,
      py: 2,
      _hover: {
        background: 'gray.800',
      },
    },
    control: {
      _checked: {
        bg: 'transparent',
        borderColor: 'primary',
        border: '1px solid',
        color: 'primary',
        _before: {
          bg: 'primary',
          w: '80%',
          h: '80%',
        },
      },
    },
    label: {
      color: 'primary',
    },
  },
  defaultProps: {},
}

export default Radio
