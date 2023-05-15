import { calc, ComponentStyleConfig, cssVar } from '@chakra-ui/react'

const $width = cssVar('switch-track-width')
const $height = cssVar('switch-track-height')
const $thumbSize = calc.subtract($height, '2px')

const Switch: ComponentStyleConfig = {
  baseStyle: {
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDir: 'row-reverse',
    },
    track: {
      bg: '#404040',
      borderColor: 'divider',
      borderWidth: '1px',
      borderStyle: 'solid',
      _checked: {
        bg: 'primary',
      },
      boxShadow: 'none !important',
    },
    thumb: {
      width: $thumbSize,
      height: $thumbSize,
      m: '1px',
    },
    label: {
      marginInlineStart: 0,
    },
  },
  sizes: {
    md: {
      container: {
        [$width.variable]: '38px',
        [$height.variable]: '18px',
      },
    },
  },
  variants: {},
  defaultProps: {},
}

export default Switch
