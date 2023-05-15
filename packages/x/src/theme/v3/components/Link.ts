import { ComponentStyleConfig } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const Link: ComponentStyleConfig = {
  baseStyle: props => ({
    fontWeight: 'extrabold',
    _active: {
      boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
      outline: 'primary',
    },
    _focus: {
      boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
      outline: 'primary',
    },
    _hover: {
      color: 'primary',
      textDecoration: 'none',
    },
  }),
  sizes: {},
  variants: {
    container: {
      _hover: {
        bg: 'reaction',
      },
    },
    active: {},
    inactive: {
      color: 'inactive',
    },
  },
  defaultProps: {},
}

export default Link
