import { ComponentStyleConfig } from '@chakra-ui/react'

const Link: ComponentStyleConfig = {
  baseStyle: {
    _active: {
      // boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
      outline: 'primary',
    },
    _focus: {
      // boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
      outline: 'primary',
    },
    _hover: {
      color: 'primary',
      textDecoration: 'none',
    },
    '&.active': {
      color: 'primary',
    },
  },
  sizes: {},
  variants: {
    container: {
      _hover: {
        bg: 'reaction',
      },
    },
    image: {
      display: 'block',
      opacity: 0.6,
      filter: 'saturate(0)',
      _hover: {
        opacity: 1,
        filter: 'saturate(1)',
      },
      '&.active': {
        opacity: 1,
        filter: 'saturate(1)',
      },
    },
  },
  defaultProps: {},
}

export default Link
