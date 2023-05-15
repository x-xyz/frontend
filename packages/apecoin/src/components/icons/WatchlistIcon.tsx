import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

interface WatchlistIconProps {
  isWatched: boolean
}

export default forwardRef<SVGSVGElement, IconProps & WatchlistIconProps>(({ isWatched, ...props }, ref) => {
  const color = isWatched ? 'primary' : 'white'
  return (
    <chakra.svg width="6" height="6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.6517 5.47433C14.5615 3.56454 17.6579 3.56455 19.5677 5.47433C21.4774 7.38412 21.4774 10.4805 19.5677 12.3903L12 19.9579L4.43234 12.3903C2.52255 10.4805 2.52255 7.38412 4.43234 5.47433C6.34213 3.56455 9.4385 3.56455 11.3483 5.47433L12 6.12604L12.6517 5.47433Z"
        fill="currentColor"
      />
    </chakra.svg>
  )
})
