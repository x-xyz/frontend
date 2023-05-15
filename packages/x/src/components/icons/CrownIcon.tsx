import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

function CrownIcon(props: IconProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <chakra.svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" ref={ref} {...props}>
      <path
        fill="#40e55b"
        d="M16,5.5a1.49,1.49,0,0,1-2.14,1.35L13,12H3L2.14,6.85A1.5,1.5,0,1,1,1.5,4,1.5,1.5,0,0,1,2.56,6.56L5,9,7.6,2.94a1.5,1.5,0,1,1,.8,0L11,9l2.44-2.44A1.5,1.5,0,1,1,16,5.5ZM3,15H13V13H3Z"
      />
    </chakra.svg>
  )
}

export default forwardRef(CrownIcon)
