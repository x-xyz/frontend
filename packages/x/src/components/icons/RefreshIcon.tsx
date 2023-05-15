import React, { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

function RefreshIcon(props: IconProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <chakra.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 80 80"
      ref={ref}
      {...props}
    >
      <circle cx="40" cy="40" r="38" />
      <path fill="divider" d="M40,4A36,36,0,1,1,4,40,36,36,0,0,1,40,4m0-4A40,40,0,1,0,80,40,40,40,0,0,0,40,0Z" />
      <polygon fill="currentColor" points="40 23 40 15.99 28.86 25 40 33.99 40 27 40 23" />
      <path fill="currentColor" d="M40,23v4A13,13,0,1,1,27,40v0H23A17,17,0,1,0,40,23Z" />
    </chakra.svg>
  )
}

export default forwardRef(RefreshIcon)
