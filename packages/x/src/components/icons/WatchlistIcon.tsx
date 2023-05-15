import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

interface WatchlistIconProps {
  isWatched: boolean
}

export default forwardRef<SVGSVGElement, IconProps & WatchlistIconProps>(({ isWatched, ...props }, ref) => {
  const color = isWatched ? 'pink' : 'placeholder'
  return (
    <chakra.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 32 32"
      ref={ref}
      color={color}
      {...props}
    >
      <path
        d="M28.37 12.37c0-3.82-3.1-6.92-6.92-6.92-2.11 0-4 1.95-5.27 3.44-1.27-1.49-3.16-3.44-5.27-3.44-3.82 0-6.92 3.1-6.92 6.92 0 2.19 1.02 4.13 2.6 5.4h0l9.59 8.34 9.59-8.34h0a6.894 6.894 0 0 0 2.6-5.4z"
        // style="fill:none;stroke:#6a6a6a;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        stroke="currentColor"
        id="ico-favourite-grey-32x32"
      />
    </chakra.svg>
  )
})
