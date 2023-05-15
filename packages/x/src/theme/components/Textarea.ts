import { ComponentStyleConfig } from '@chakra-ui/react'

const Textarea: ComponentStyleConfig = {
  variants: {
    flushed: {
      borderColor: 'divider',
    },
    outline: {
      borderColor: 'divider',
    },
    solid: {
      bg: 'field',
    },
  },
  defaultProps: {
    variant: 'solid',
  },
}

export default Textarea
