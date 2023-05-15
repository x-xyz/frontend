import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type DashboardIconProps = IconProps

export function DashboardIcon(props: DashboardIconProps) {
  return (
    <chakra.svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M1 1H9.55556V12H1V1Z"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4444 1H23V7.11111H14.4444V1Z"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4443 12H22.9999V23H14.4443V12Z"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 16.8889H9.55556V23H1V16.8889Z"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </chakra.svg>
  )
}
