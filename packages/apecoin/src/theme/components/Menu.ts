import { ComponentStyleConfig } from '@chakra-ui/react'

const Menu: ComponentStyleConfig = {
  baseStyle: {
    list: {},
    item: {},
  },
  sizes: {},
  variants: {
    default: {
      button: {},
      list: {
        borderRadius: 0,
        borderColor: 'primary',
        bg: 'bg2',
        py: 0,
        minWidth: 'unset',
      },
      item: {
        display: 'flex',
        justifyContent: 'center',
        fontWeight: 'extrabold',
        color: 'textSecondary',
        _hover: {
          color: 'primary',
          bgColor: 'unset',
        },
        _focus: {
          color: 'primary',
          bgColor: 'unset',
        },
        ':not(:last-child)': {
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        },
      },
      groupTitle: {},
      command: {},
      divider: {},
    },
    dropdown: {
      button: {
        fontWeight: 'bold',
        fontSize: 'sm',
        p: 1,
        _hover: {
          bg: 'reaction',
        },
      },
      list: {
        borderRadius: 0,
        bg: 'panel',
        py: 0,
      },
      item: {
        display: 'flex',
        fontWeight: 'bold',
        fontSize: 'sm',
        ':hover': {
          color: 'primary',
        },
        ':not(:last-child)': {
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
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
