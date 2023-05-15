import { ComponentStyleConfig } from '@chakra-ui/react'

const Text: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {},
  variants: {
    headline2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: '3.25rem',
    },
    headline3: {
      fontSize: { base: '1rem', lg: '2rem' },
      fontWeight: 700,
      lineHeight: '2.625rem',
    },
    headline4: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: '2.25rem',
    },
    headline6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: '1.625rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: '1.25rem',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.125rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: '1.25rem',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: '1.25rem',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 300,
      lineHeight: '1rem',
    },
    captionSub: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '1rem',
    },
  },
  defaultProps: {
    variant: 'body1',
  },
}

export default Text
