import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const MenuIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg width="8" height="8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.33325 6.66663H26.6666V9.33329H5.33325V6.66663ZM5.33325 14.6666H26.6666V17.3333H5.33325V14.6666ZM26.6666 22.6666H5.33325V25.3333H26.6666V22.6666Z"
      fill="currentColor"
    />
  </chakra.svg>
))

export default MenuIcon
