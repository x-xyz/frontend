import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type TelegramIconProps = IconProps

export function TelegramIcon({ color = 'white', ...props }: TelegramIconProps) {
  return (
    <chakra.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
      {...props}
    >
      <g clipPath="url(#clip0)">
        <path
          d="M10.9865 17.7108L10.5233 24.2255C11.186 24.2255 11.473 23.9408 11.8171 23.599L14.924 20.6298L21.3616 25.3443C22.5423 26.0023 23.3741 25.6558 23.6926 24.2582L27.9183 4.45749L27.9195 4.45633C28.294 2.71099 27.2883 2.02849 26.138 2.45666L1.29963 11.9662C-0.395537 12.6242 -0.36987 13.5692 1.01146 13.9973L7.36163 15.9725L22.1118 6.74299C22.806 6.28333 23.4371 6.53766 22.918 6.99733L10.9865 17.7108Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="28" height="28" fill="currentColor" />
        </clipPath>
      </defs>
    </chakra.svg>
  )
}
