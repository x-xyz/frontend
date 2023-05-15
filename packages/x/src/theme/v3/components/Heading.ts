import { ComponentStyleConfig } from '@chakra-ui/react'

const Heading: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'bold',
  },
  sizes: {
    xs: {
      fontSize: 'xl',
    },
    sm: {
      fontSize: '3xl',
    },
    md: {
      fontSize: ['4xl', '4xl', '5xl'],
    },
    xl: {
      fontSize: ['6xl', '6xl', '8xl'],
    },
  },
  defaultProps: {
    size: 'md',
  },
}

export default Heading
