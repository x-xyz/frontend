import { forwardRef } from 'react'
import { chakra, ChakraProps } from '@chakra-ui/react'

function EllipsisIcon(props: ChakraProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <chakra.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 80 80"
      ref={ref}
      {...props}
    >
      <g>
        <circle fill="currentcolor" cx="22" cy="40" r="6" />
        <circle fill="currentcolor" cx="40" cy="40" r="6" />
        <circle fill="currentcolor" cx="58" cy="40" r="6" />
      </g>
    </chakra.svg>
  )
}

export default forwardRef(EllipsisIcon)
