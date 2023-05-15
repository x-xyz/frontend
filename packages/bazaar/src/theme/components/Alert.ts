import { ComponentStyleConfig } from '@chakra-ui/react'
import { mode, getColor } from '@chakra-ui/theme-tools'

const Alert: ComponentStyleConfig = {
  baseStyle: {
    container: { borderRadius: '10px', color: 'background' },
    title: {
      color: 'background',
    },
    description: {
      color: 'background',
    },
    icon: {},
  },
  sizes: {},
  variants: {
    subtle: props => ({
      container: {
        bg: mode(
          getColor(props.theme, `${props.colorScheme}.100`),
          getColor(props.theme, `${props.colorScheme}.200`),
        )(props),
      },
    }),
  },
}

export default Alert
