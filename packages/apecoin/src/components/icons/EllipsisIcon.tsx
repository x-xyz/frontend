import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const EllipsisIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 80 80" ref={ref} {...props}>
    <g id="ico-ellipsis-80x80">
      <g>
        <circle cx="40" cy="40" r="38" />
        <g>
          <path
            fill="divider"
            d="M40,4c19.85,0,36,16.15,36,36S59.85,76,40,76S4,59.85,4,40S20.15,4,40,4 M40,0C17.91,0,0,17.91,0,40
    c0,22.09,17.91,40,40,40s40-17.91,40-40C80,17.91,62.09,0,40,0L40,0z"
          />
        </g>
      </g>
      <g>
        <circle fill="currentcolor" cx="22" cy="40" r="6" />
        <circle fill="currentcolor" cx="40" cy="40" r="6" />
        <circle fill="currentcolor" cx="58" cy="40" r="6" />
      </g>
    </g>
  </chakra.svg>
))

export default EllipsisIcon
