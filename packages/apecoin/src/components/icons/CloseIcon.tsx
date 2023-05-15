import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const CloseIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => {
  return (
    <chakra.svg width="6" height="6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.22176 18.3641L5.63597 19.7783L11.9999 13.4143L18.3639 19.7783L19.7781 18.3641L13.4141 12.0001L19.7781 5.63614L18.3639 4.22192L11.9999 10.5859L5.63597 4.22192L4.22176 5.63614L10.5857 12.0001L4.22176 18.3641Z"
        fill="currentColor"
      />
    </chakra.svg>
  )
})

export default CloseIcon
