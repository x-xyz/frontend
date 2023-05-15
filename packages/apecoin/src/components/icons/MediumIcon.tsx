import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

export default forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <chakra.svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 80 80" ref={ref} {...props}>
    <g id="ico-medium-80x80">
      <g>
        <path
          fill="currentcolor"
          d="M43.86,40c0,9.4-7.56,17.04-16.93,17.04S10,49.4,10,40s7.56-17.04,16.93-17.04S43.86,30.6,43.86,40"
        />
        <path
          fill="currentcolor"
          d="M62.4,40c0,8.84-3.8,16.03-8.46,16.03S45.47,48.84,45.47,40s3.8-16.03,8.46-16.03S62.4,31.12,62.4,40"
        />
        <path
          fill="currentcolor"
          d="M70,40c0,7.94-1.32,14.37-2.97,14.37c-1.66,0-2.97-6.43-2.97-14.37s1.32-14.37,2.97-14.37
			C68.68,25.63,70,32.06,70,40"
        />
      </g>
    </g>
  </chakra.svg>
))
