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
      header: {
        px: 4,
      },
      body: {
        p: 0,
        maxH: '80vh',
        overflowY: 'auto',
      },
    },
    panel: {
      content: {
        p: 6,
      },
      header: {
        border: 'none',
        pb: 6,
      },
      body: {},
      footer: {
        pt: 6,
        border: 'none',
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Popover
