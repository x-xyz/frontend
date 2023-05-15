import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const ExternalIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg
    width="7"
    height="7"
    viewBox="0 0 7 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M6.5 0.5H0M6.5 0.5V7M6.5 0.5L0.382353 6.61765" stroke="#E5E5E5" strokeWidth="0.7" />
  </chakra.svg>
))

export default ExternalIcon
