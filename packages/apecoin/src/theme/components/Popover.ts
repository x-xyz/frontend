import { ComponentStyleConfig, cssVar } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const $popperBg = cssVar('popper-bg')
const $arrowBg = cssVar('popper-arrow-bg')
const $arrowShadowColor = cssVar('popper-arrow-shadow-color')

const Popover: ComponentStyleConfig = {
  baseStyle: props => ({
    popper: {
      zIndex: 'popover',
    },
    content: {
      [$popperBg.variable]: getColor(props.theme, 'panel'),
      bg: $popperBg.reference,
      [$arrowBg.variable]: $popperBg.reference,
      [$arrowShadowColor.variable]: 'transparent',
      borderRadius: 0,
    },
  }),
  sizes: {},
  variants: {
    default: {
      popper: {},
      header: {},
      content: {
        border: 'none',
      },
    },
    panel: {
      content: {
        borderColor: 'divider',
      },
      header: {
        bg: '#2a2a2a',
      },
      body: {},
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Popover
