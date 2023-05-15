import { ComponentStyleConfig } from '@chakra-ui/react'

const Link: ComponentStyleConfig = {
  baseStyle: {
    color: 'primary',
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
    _hover: {
      textShadow: '0 1px 8px rgb(255 255 255)',
      textDecoration: 'none',
    },
  },
  sizes: {},
  variants: {
    active: {
      color: 'primary',
      textShadow: '0 1px 8px rgb(255 255 255)',
    },
    inactive: {
      color: 'inactive',
    },
    container: {
      color: 'inherit',
      position: 'relative',
      transition: 'top .3s',
      top: 0,
      _hover: {
        textDecoration: 'none',
        boxShadow: '0px 4px 12px 0px rgb(255 255 255 / 60%)',
        top: -1,
      },
    },
    unstyled: {
      color: 'inherit',
      _hover: {
        textDecoration: 'none',
      },
    },
    badge: {
      borderRadius: '8px',
      bg: 'panel',
    },
  },
  defaultProps: {},
}

export default Link
