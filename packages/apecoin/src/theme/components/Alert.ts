import { ComponentStyleConfig } from '@chakra-ui/react'
import { mode, getColor, transparentize } from '@chakra-ui/theme-tools'
import type { StyleFunctionProps } from '@chakra-ui/theme/node_modules/@chakra-ui/theme-tools'

function getBg(props: StyleFunctionProps): string {
  const { theme, colorScheme: c } = props
  const lightBg = getColor(theme, `${c}.100`, c)
  const darkBg = transparentize(`${c}.200`, 0.8)(theme)
  return mode(lightBg, darkBg)(props)
}

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
      container: { bg: getBg(props) },
      icon: {
        color: mode(`${props.colorScheme}.500`, `${props.colorScheme}.700`)(props),
        me: 3,
      },
    }),
  },
}

export default Alert
