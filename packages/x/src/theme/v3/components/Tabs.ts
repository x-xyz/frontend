import { ComponentStyleConfig } from '@chakra-ui/react'

const Tabs: ComponentStyleConfig = {
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
    default: {
      tablist: {
        borderBottom: 'none',
      },
      tab: {
        color: 'primary',
        _selected: {
          borderBottom: 'none',
          fontSize: '4xl',
        },
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Tabs
