import { ComponentStyleConfig } from '@chakra-ui/react'

const Checkbox: ComponentStyleConfig = {
  baseStyle: {
    control: {
      borderRadius: '6px',
      borderColor: 'divider',
      borderWidth: 1,
      _checked: {
        bg: 'transparent',
        color: 'primary',
        outline: 'none',
        borderColor: 'divider',
      },
    },
  },
  sizes: {
    md: {
      control: {
        w: 6,
        h: 6,
      },
      label: {
        fontSize: 'sm',
      },
    },
  },
  variants: {
    container: {
      control: {
        pos: 'absolute',
        top: 0,
        right: 0,
      },
    },
  },
  defaultProps: {},
}

export default Checkbox
