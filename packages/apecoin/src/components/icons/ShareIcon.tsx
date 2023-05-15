import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const ShareIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 6.12546 15.0077 6.24912 15.0227 6.37053L8.08254 9.84059C7.54298 9.32013 6.80888 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15C6.80895 15 7.54311 14.6798 8.08268 14.1593L15.0227 17.6293C15.0077 17.7507 15 17.8745 15 18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C17.1911 15 16.457 15.3201 15.9175 15.8406L8.97734 12.3705C8.9923 12.2491 9 12.1255 9 12C9 11.8745 8.99229 11.7507 8.97732 11.6293L15.9173 8.15927C16.4569 8.67982 17.1911 9 18 9Z"
      fill="currentColor"
    />
  </chakra.svg>
))

export default ShareIcon
