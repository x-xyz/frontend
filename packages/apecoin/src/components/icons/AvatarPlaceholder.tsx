import { chakra, ChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

const AvatarPlaceholder = forwardRef<SVGSVGElement, ChakraProps>((props, ref) => (
  <chakra.svg
    ref={ref}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 160 160"
    {...props}
  >
    <g id="ico-profile-160x160">
      <g>
        <g>
          <circle cx="80" cy="80" r="80" />
        </g>
        <g>
          <circle fill="#1D1D1D" cx="80" cy="67.52" r="24" />
        </g>
        <g>
          <path
            fill="#1D1D1D"
            d="M88,101.07H72c-17.67,0-32,14.33-32,32v0.34c11.15,8.36,24.99,13.32,40,13.32s28.85-4.95,40-13.32v-0.34
				C120,115.4,105.67,101.07,88,101.07z"
          />
        </g>
      </g>
    </g>
  </chakra.svg>
))

export default AvatarPlaceholder
