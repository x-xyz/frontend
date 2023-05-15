import { ComponentStyleConfig } from '@chakra-ui/react'

const Table: ComponentStyleConfig = {
  baseStyle: {
    table: {
      bg: 'panel',
      overflow: 'hidden',
      fontVariantNumeric: 'unset',
    },
  },
  sizes: {
    sm: {
      th: {
        fontSize: 'xs',
      },
      td: {
        fontSize: 'xs',
      },
    },
    md: {
      th: { pt: 4 },
      td: {},
    },
  },
  variants: {
    simple: {
      th: {
        borderBottom: 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'HelveticaNowDisplay',
        color: 'note',
        textTransform: 'unset',
      },
      tr: {
        position: 'relative',
        'not(last-child):after': {
          content: '""',
          display: 'block',
          bg: 'linear-gradient(180deg, rgba(196, 113, 237, 0.16) -0.05%, rgba(247, 121, 125, 0.16) 54.31%, rgba(251, 215, 134, 0.16) 112.18%)',
          h: '1px',
          w: '100%',
          position: 'absolute',
          bottom: 0,
          left: 0,
        },
      },
      thead: {
        tr: {
          ':last-child::after': {
            content: '""',
            display: 'block',
            bg: 'divider',
            h: '1px',
            w: '100%',
            position: 'absolute',
            bottom: 0,
            left: 0,
          },
        },
      },
      tbody: {},
    },
  },
}

export default Table
