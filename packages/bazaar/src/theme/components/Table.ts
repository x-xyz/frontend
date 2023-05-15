import { ComponentStyleConfig } from '@chakra-ui/react'

const Table: ComponentStyleConfig = {
  baseStyle: {
    th: { fontFamily: 'body', fontWeight: 'normal', textTransform: 'unset' },
  },
  sizes: {
    md: {
      th: { pl: 0, fontSize: 'md' },
      td: { pl: 0 },
    },
  },
  variants: {
    simple: {
      th: { color: 'primary' },
      tr: {},
      thead: {},
      tbody: {
        tr: {
          '&:last-child': {
            td: {
              borderBottom: 'none',
            },
          },
        },
      },
    },
  },
}

export default Table
