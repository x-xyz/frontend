import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const CaretUp = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg width="6" height="6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 15L8 14L12 9L16 14L16 15L8 15Z" fill="currentColor" />
  </chakra.svg>
))

export default CaretUp
