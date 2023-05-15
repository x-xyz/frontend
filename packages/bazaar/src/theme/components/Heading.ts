import { ComponentStyleConfig } from '@chakra-ui/react'

const Heading: ComponentStyleConfig = {
  baseStyle: {
    color: 'primary',
    textTransform: 'uppercase',
  },
  variants: {
    gradient: {
      bg: 'linear-gradient(256.32deg, #FF00FF 7.14%, #EB28FF 11.13%, #D554FE 16.37%, #C07DFE 22.13%, #AFA0FE 28.29%, #A0BEFE 34.96%, #94D6FD 42.31%, #8AE8FD 50.61%, #84F5FD 60.42%, #80FDFD 73.2%, #7FFFFD 100%)',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
}

export default Heading
