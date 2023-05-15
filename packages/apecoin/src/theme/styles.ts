import { Styles } from '@chakra-ui/theme-tools'

const styles: Styles = {
  global: {
    html: {
      height: '100%',
      minH: '-webkit-fill-available',
    },
    body: {
      background: 'background',
      color: 'text',
      height: '100%',
      minHeight: '-webkit-fill-available',
      maxHeight: '-webkit-fill-available',
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'hidden',
    },
    '#__next': {
      width: '100%',
    },
    '#nprogress .bar, #nprogress .spinner': {
      zIndex: 4000,
    },
    '*:focus': {
      boxShadow: 'none !important',
    },
  },
}

export default styles
