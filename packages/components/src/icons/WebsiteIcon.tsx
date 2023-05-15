import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type WebsiteIconProps = IconProps

export function WebsiteIcon(props: WebsiteIconProps) {
  return (
    <chakra.svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="8" r="1" fill="currentColor" />
      <circle cx="9" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <line x1="3" y1="11" x2="21" y2="11" stroke="currentColor" strokeWidth="2" />
    </chakra.svg>
  )
}
