import { ComponentStyleConfig } from '@chakra-ui/react'

const Text: ComponentStyleConfig = {
  baseStyle: {
    color: 'text',
  },
  sizes: {},
  variants: {
    address: {
      color: 'primary',
      fontSize: 'sm',
      fontWeight: 'bold',
    },
    emphasis: {
      fontWeight: 'bold',
    },
    gradient: {
      fontWeight: 'bold',
      bg: 'linear-gradient(150.71deg, #C471ED -30.38%, #F7797D 41.23%, rgba(251, 215, 134, 0.81) 115.2%)',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
}

export default Text
