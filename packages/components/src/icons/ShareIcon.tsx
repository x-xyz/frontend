import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type ShareIconProps = IconProps

export function ShareIcon(props: ShareIconProps) {
  return (
    <chakra.svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="24" height="24" fill="none" />
      <path
        d="M5 12V17.6C5 17.9713 5.18437 18.3274 5.51256 18.5899C5.84075 18.8525 6.28587 19 6.75 19H17.25C17.7141 19 18.1592 18.8525 18.4874 18.5899C18.8156 18.3274 19 17.9713 19 17.6V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0002 7L12.0002 4L9.00018 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.0004 4V13.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </chakra.svg>
  )
}
