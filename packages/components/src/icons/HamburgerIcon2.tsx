import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type HamburgerIcon2Props = IconProps

export function HamburgerIcon2(props: HamburgerIcon2Props) {
  return (
    <chakra.svg
      fill="none"
      strokeWidth="0"
      viewBox="0 0 18 12"
      aria-hidden="true"
      focusable="false"
      width="18px"
      height="12px"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9 12H0V10H9V12ZM18 7H0V5H18V7ZM18 2H9V0H18V2Z" fill="currentColor" />
    </chakra.svg>
  )
}
