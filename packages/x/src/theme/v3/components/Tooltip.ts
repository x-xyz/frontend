import { ComponentStyleConfig } from '@chakra-ui/react'

const Tooltip: ComponentStyleConfig = {
  variants: {
    default: {
      bg: 'divider',
      color: 'text',
      px: 10,
      py: 1,
      borderRadius: '4px',
    },
  },
  defaultProps: {
    variant: 'default',
  },
}

export default Tooltip
