import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

export default forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  return (
    <chakra.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      ref={ref}
      color="placeholder"
      {...props}
    >
      <g id="ico-watchlist-pink-32x32">
        <path
          fill="currentColor"
          d="M24,12.8C33.72,12.8,41.6,24,41.6,24h0S33.72,35.2,24,35.2,6.4,24,6.4,24h0S14.28,12.8,24,12.8M41.6,24h0M24,6.4C11.32,6.4,2.17,18.89,1.17,20.32A6.39,6.39,0,0,0,.72,27a6.79,6.79,0,0,0,.5.81C2.38,29.37,11.56,41.6,24,41.6c12.25,0,21.22-11.68,22.7-13.74a6.38,6.38,0,0,0-.07-7.81C45,17.83,36,6.4,24,6.4Z"
        />
        <circle fill="currentColor" cx="24" cy="24" r="3.2" />
        <path
          fill="currentColor"
          d="M24,35A11,11,0,1,1,35,24,11,11,0,0,1,24,35Zm0-19.2A8.23,8.23,0,1,0,32.23,24,8.24,8.24,0,0,0,24,15.77Z"
        />
      </g>
    </chakra.svg>
  )
})
