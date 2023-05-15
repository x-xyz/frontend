import { ComponentStyleConfig } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const Checkbox: ComponentStyleConfig = {
  baseStyle: props => ({
    control: {
      borderRadius: 0,
      borderColor: '#5F5F5F',
      borderWidth: '1px',
      _checked: {
        bg: 'primary',
        color: 'black',
        outline: 'none',
        borderColor: 'primary',
        _hover: {
          outline: 'primary',
          background: 'primary',
        },
      },
      _focus: {
        outline: 'primary',
        boxShadow: 'none',
      },
      _active: {
        outline: 'primary',
      },
    },
  }),
  sizes: {
    md: {
      label: {
        // fontSize: 'sm',
      },
      control: {
        w: 5,
        h: 5,
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
