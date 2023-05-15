import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type LikeIconProps = IconProps

export function LikeIcon(props: LikeIconProps) {
  return (
    <chakra.svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <svg>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.14 21.52C11.39 21.61 11.69 21.65 12 21.65C12.31 21.65 12.61 21.61 12.86 21.52C16.68 20.21 22.75 15.57 22.75 8.69001C22.75 5.20001 19.92 2.35001 16.44 2.35001C14.75 2.35001 13.17 3.01001 12 4.19001C10.83 3.01001 9.25 2.35001 7.56 2.35001C4.08 2.35001 1.25 5.19001 1.25 8.69001C1.25 15.56 7.32 20.21 11.14 21.52Z"
        />
      </svg>
    </chakra.svg>
  )
}
