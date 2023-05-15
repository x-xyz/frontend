import { ComponentStyleConfig } from '@chakra-ui/react'

const List: ComponentStyleConfig = {
  baseStyle: {
    item: {
      p: 2,
    },
  },
  sizes: {},
  variants: {
    ghost: {
      container: {},
      item: {},
    },
    default: {
      container: {},
      item: {
        p: 3,
        ':not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    border: {
      container: {
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 0,
      },
      item: {
        p: 3,
        ':not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    'round-border': {
      container: {
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        px: 4,
      },
      item: {
        py: 3,
        ':not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    reactable: {
      container: {},
      item: {
        color: 'text',
        _hover: {
          color: 'primary',
          bg: 'reaction',
        },
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default List
