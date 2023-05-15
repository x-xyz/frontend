import { ComponentStyleConfig } from '@chakra-ui/react'

const Menu: ComponentStyleConfig = {
  baseStyle: {
    list: {},
    item: {},
  },
  sizes: {},
  variants: {
    default: {
      button: {
        borderColor: 'divider',
        borderWidth: '1px',
        borderRadius: '10px',
        px: 4,
        h: 10,
        textAlign: 'left',
      },
      list: {
        border: 'none',
        background: 'panel',
        boxShadow: '0px 15px 25px rgba(87, 81, 101, 0.5)',
        borderRadius: '10px',
      },
      item: {
        color: 'inactive',
        _hover: {
          bg: 'whiteAlpha.200',
          color: 'primary',
        },
      },
      groupTitle: {},
      command: {},
      divider: {},
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Menu
