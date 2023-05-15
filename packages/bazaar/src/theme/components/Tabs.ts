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
    accordion: {
      root: {
        borderWidth: '1px',
        borderColor: 'divider',
        borderRadius: '10px',
        overflow: 'hidden',
      },
      tab: {
        color: 'inactive',
        fontWeight: 'medium',
        _selected: {
          color: 'primary',
          fontWeight: 'bold',
          borderBottomWidth: '4px',
          borderColor: 'primary',
        },
      },
      tablist: {
        bg: 'panel',
      },
      tabpanel: {},
      tabpanels: {},
      indicator: {},
    },
    switch: {
      tablist: {
        borderWidth: '1px',
        borderColor: 'divider',
        borderRadius: '10px',
        bg: 'panel',
        p: 1,
      },
      tab: {
        flexGrow: 1,
        py: 1,
        color: 'primary',
        fontSize: 'sm',
        fontWeight: 'medium',
        _selected: {
          bg: 'primary',
          color: 'panel',
          borderRadius: '6px',
        },
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Tabs
