import { ComponentStyleConfig } from '@chakra-ui/react'
import { getColor } from '@chakra-ui/theme-tools'

const Accordion: ComponentStyleConfig = {
  baseStyle: props => ({
    container: {
      border: `1px solid ${getColor(props.theme, 'divider')}`,
    },
    button: {
      color: 'white',
      fontSize: 'lg',
      fontWeight: 'bold',
      backgroundColor: 'panel',
      _disabled: {
        cursor: 'auto',
      },
      _focus: {
        boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
        outline: 'primary',
      },
      _active: {
        boxShadow: `0px 0px 4px 4px ${getColor(props.theme, 'primary')} !important`,
        outline: 'primary',
      },
      _hover: {
        bg: 'whiteAlpha.400',
      },
    },
    panel: {
      padding: '5',
      fontSize: 'sm',
      borderTop: `1px solid ${getColor(props.theme, 'divider')}`,
    },
    icon: {
      color: 'text',
      w: '1.4rem',
      h: '1.4rem',
    },
  }),
  sizes: {},
}

export default Accordion
