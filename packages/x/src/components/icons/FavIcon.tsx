import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

function FavIcon(props: IconProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <chakra.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 32 32"
      ref={ref}
      {...props}
    >
      <g id="ico-favourite-grey-32x32">
        <path
          stroke="currentcolor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          d="M28.37,12.37c0-3.82-3.1-6.92-6.92-6.92c-2.11,0-4,1.95-5.27,3.44c-1.27-1.49-3.16-3.44-5.27-3.44
		c-3.82,0-6.92,3.1-6.92,6.92c0,2.19,1.02,4.13,2.6,5.4l0,0l9.59,8.34l9.59-8.34l0,0C27.35,16.51,28.37,14.56,28.37,12.37z"
        />
      </g>
    </chakra.svg>
  )
}

export default forwardRef(FavIcon)
