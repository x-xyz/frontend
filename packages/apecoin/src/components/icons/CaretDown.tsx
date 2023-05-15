import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const CaretDown = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg width="6" height="6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 9V10L12 15L8 10L8 9H16Z" fill="currentColor" />
  </chakra.svg>
))

export default CaretDown
