import { ComponentStyleConfig } from '@chakra-ui/react'

const numericStyles = {
  '&[data-is-numeric=true]': {
    textAlign: 'end',
  },
}

const Table: ComponentStyleConfig = {
  baseStyle: {
    table: {},
  },
  sizes: {
    md: {
      th: {},
      td: {},
    },
  },
  variants: {
    default: {
      tr: {},
      th: {
        p: 4,
        color: 'textSecondary',
        ...numericStyles,
      },
      td: {
        p: 4,
        ...numericStyles,
      },
      thead: {
        tr: {
          borderBottom: '1px solid',
          borderBottomColor: '#2c2c2c',
          th: {
            fontWeight: 'normal',
            textTransform: 'unset',
            py: 2.5,
          },
        },
      },
      tbody: {
        tr: {
          _notLast: {
            borderBottom: '1px solid',
            borderBottomColor: '#2c2c2c',
          },
        },
      },
    },
    bordered: {
      th: {
        border: '1px solid',
        borderColor: 'divider',
      },
      td: {
        border: '1px solid',
        borderColor: 'divider',
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Table
