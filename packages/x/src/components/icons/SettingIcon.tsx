import { forwardRef } from 'react'
import { chakra } from '@chakra-ui/react'
import { IconProps } from './shared'

function SettingIcon(props: IconProps, ref: React.ForwardedRef<SVGSVGElement>) {
  return (
    <chakra.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 80 80"
      ref={ref}
      color="primary"
      {...props}
    >
      <g id="ico-settings-80x80">
        <path
          fill="currentcolor"
          d="M53.22,42.23c-0.03-0.02-0.06-0.03-0.08-0.04c0.12-0.71,0.2-1.44,0.2-2.19s-0.08-1.48-0.2-2.19
        c0.03-0.01,0.06-0.02,0.08-0.04l3.14-2.62c0.18-0.15,0.23-0.41,0.11-0.61l-1.75-3.03l-1.75-3.03c-0.12-0.2-0.36-0.29-0.58-0.21
        l-3.84,1.41c-0.03,0.01-0.05,0.03-0.07,0.05c-1.12-0.93-2.41-1.66-3.8-2.18c0-0.03,0.01-0.06,0-0.09l-0.7-4.04
        c-0.04-0.23-0.24-0.4-0.48-0.4H40h-3.5c-0.23,0-0.44,0.17-0.48,0.4l-0.7,4.04c-0.01,0.03,0,0.06,0,0.09
        c-1.39,0.52-2.67,1.26-3.8,2.18c-0.02-0.01-0.04-0.04-0.07-0.05l-3.84-1.41c-0.22-0.08-0.47,0.01-0.58,0.21l-1.75,3.03l-1.75,3.03
        c-0.12,0.2-0.07,0.46,0.11,0.61l3.15,2.62c0.03,0.02,0.06,0.03,0.08,0.04c-0.12,0.71-0.2,1.44-0.2,2.19s0.08,1.48,0.2,2.19
        c-0.03,0.01-0.06,0.02-0.08,0.04l-3.14,2.62c-0.18,0.15-0.23,0.41-0.11,0.61l1.75,3.03l1.75,3.03c0.12,0.2,0.36,0.29,0.58,0.21
        l3.84-1.41c0.03-0.01,0.05-0.03,0.07-0.05c1.13,0.93,2.41,1.66,3.8,2.18c0,0.03-0.01,0.06,0,0.09l0.7,4.04
        c0.04,0.23,0.24,0.4,0.48,0.4H40h3.5c0.23,0,0.44-0.17,0.48-0.4l0.7-4.04c0.01-0.03,0-0.06,0-0.09c1.39-0.52,2.67-1.26,3.8-2.18
        c0.02,0.01,0.04,0.04,0.07,0.05l3.84,1.41c0.22,0.08,0.47-0.01,0.58-0.21l1.75-3.03l1.75-3.03c0.12-0.2,0.07-0.46-0.11-0.61
        L53.22,42.23z M40,46.67c-3.68,0-6.67-2.99-6.67-6.67s2.99-6.67,6.67-6.67s6.67,2.99,6.67,6.67S43.68,46.67,40,46.67z"
        />
      </g>
    </chakra.svg>
  )
}

export default forwardRef(SettingIcon)
