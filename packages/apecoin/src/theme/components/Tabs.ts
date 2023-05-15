import { ComponentStyleConfig } from '@chakra-ui/react'

const Tabs: ComponentStyleConfig = {
  baseStyle: {
    tablist: {
      borderBottom: 'none',
    },
    tab: {
      fontWeight: 500,
      color: 'textSecondary',
      _focus: {
        boxShadow: 'none',
      },
      _selected: {
        color: 'primary',
        bgColor: 'bg2',
        borderBottom: 'none',
      },
    },
    tabpanel: {
      px: 0,
      pt: 8,
    },
  },
  sizes: {
    base: {
      tablist: { gap: '1rem' },
      tab: {
        p: 2,
        fontSize: '1rem',
      },
    },
    lg: {
      tab: {
        py: 1,
        px: 6,
        fontSize: '1.25rem',
      },
    },
  },
  variants: {
    line: {
      tablist: {
        borderColor: 'divider',
      },
      tab: {
        color: 'divider',
        _selected: {
          color: 'primary',
          bg: 'whiteAlpha.400',
        },
      },
    },
  },
  defaultProps: {
    size: 'lg',
    variant: '',
  },
}

export default Tabs
