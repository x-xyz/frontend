import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

export default forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <chakra.svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 60 60" ref={ref} {...props}>
    <g id="ico-share-fb-60x60">
      <g>
        <path
          fill="currentcolor"
          d="M45,29.91c0-8.28-6.72-15-15-15s-15,6.72-15,15c0,7.49,5.49,13.69,12.66,14.82V34.24h-3.81v-4.34h3.81v-3.3
			c0-3.76,2.24-5.84,5.67-5.84c1.64,0,3.36,0.29,3.36,0.29v3.69h-1.89c-1.86,0-2.44,1.16-2.44,2.34v2.81h4.16l-0.67,4.34h-3.5v10.48
			C39.51,43.6,45,37.4,45,29.91z"
        />
      </g>
    </g>
  </chakra.svg>
))
