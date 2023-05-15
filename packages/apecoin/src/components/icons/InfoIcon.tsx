import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const InfoIcon = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => {
  return (
    <chakra.svg
      ref={ref}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 56 56"
      {...props}
    >
      <g id="ico-info-56x56">
        <g>
          <g>
            <g>
              <path
                d="M28,8c11.03,0,20,8.97,20,20s-8.97,20-20,20S8,39.03,8,28S16.97,8,28,8 M28,0C12.54,0,0,12.54,0,28
					s12.54,28,28,28s28-12.54,28-28S43.46,0,28,0L28,0z"
              />
            </g>
          </g>
          <g>
            <rect x="24" y="24" transform="matrix(-1 -1.224647e-16 1.224647e-16 -1 56 68)" width="8" height="20" />
            <rect x="24" y="12" transform="matrix(-1 -1.224647e-16 1.224647e-16 -1 56 32)" width="8" height="8" />
          </g>
        </g>
      </g>
    </chakra.svg>
  )
})

export default InfoIcon
