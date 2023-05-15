import { ComponentStyleConfig } from '@chakra-ui/react'

const List: ComponentStyleConfig = {
  baseStyle: {
    item: {},
  },
  sizes: {},
  variants: {
    ghost: {
      container: {},
      item: {},
    },
    default: {
      container: {},
      item: {},
    },
    nav: {
      container: {
        display: 'flex',
        flexDir: 'row',
        pos: 'relative',
        m: 5,
        _before: {
          content: '"+"',
          pos: 'absolute',
          top: 0,
          left: '-15px',
          transform: 'translate(50%, -100%)',
        },
        _after: {
          content: '"+"',
          pos: 'absolute',
          bottom: 0,
          left: '-15px',
          transform: 'translate(50%, 100%)',
        },
      },
      item: {
        flexShrink: 0,
        ':not(:last-child)': {
          mr: '30px',
          pos: 'relative',
          _before: {
            content: '"-"',
            pos: 'absolute',
            top: 0,
            right: '-15px',
            transform: 'translate(50%, -100%) rotate(90deg)',
          },
          _after: {
            content: '"-"',
            pos: 'absolute',
            bottom: 0,
            right: '-15px',
            transform: 'translate(50%, 100%) rotate(90deg)',
          },
        },
        ':last-child': {
          pos: 'relative',
          _before: {
            content: '"+"',
            pos: 'absolute',
            top: 0,
            right: '-15px',
            transform: 'translate(50%, -100%)',
          },
          _after: {
            content: '"+"',
            pos: 'absolute',
            bottom: 0,
            right: '-15px',
            transform: 'translate(50%, 100%)',
          },
        },
      },
    },
    reactable: {
      container: {},
      item: {
        display: 'flex',
        alignItems: 'center',
        px: 4,
        py: 2.5,
        _hover: {
          color: 'primary',
        },
        '&:not(:last-child)': {
          borderBottomColor: 'divider',
          borderBottomWidth: '1px',
        },
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default List
