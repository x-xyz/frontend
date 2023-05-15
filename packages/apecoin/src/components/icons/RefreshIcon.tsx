import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const RefreshIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20.8284 10.8285L13.5239 9.64772L19.6476 3.524L20.8284 10.8285Z" fill="currentColor" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.9297 8C17.5465 5.60879 14.9611 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C15.7277 20 18.8599 17.4505 19.748 14H17.6586C16.8349 16.3304 14.6124 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C13.777 6 15.3736 6.7725 16.4722 8H18.9297Z"
      fill="currentColor"
    />
  </chakra.svg>
))

export default RefreshIcon
