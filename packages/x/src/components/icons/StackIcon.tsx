import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

function StackIcon(props: IconProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <chakra.svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" ref={ref} {...props}>
      <polygon fill="currentcolor" points="30 51 4 36 4 45 30 60 56 45 56 36 30 51" />
      <polygon fill="currentcolor" points="30 36 4 21 4 30 30 45 56 30 56 21 30 36" />
      <polygon fill="currentcolor" points="30 0 4 15 30 30 56 15 30 0" />
    </chakra.svg>
  )
}

export default forwardRef(StackIcon)
