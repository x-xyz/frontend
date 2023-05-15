import { ComponentStyleConfig } from '@chakra-ui/react'

const Stat: ComponentStyleConfig = {
  baseStyle: {
    label: {
      color: 'note',
      fontWeight: 'bold',
    },
    helpText: {
      color: 'value',
    },
  },
  sizes: {
    md: {
      container: {
        lineHeight: 1.2,
      },
      label: {
        fontSize: 'xs',
      },
      number: {
        fontSize: 'lg',
      },
      helpText: {
        fontSize: 'sm',
        mb: 0,
      },
      icon: {},
    },
  },
  variants: {},
}

export default Stat
