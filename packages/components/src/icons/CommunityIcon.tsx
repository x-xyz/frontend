import React from 'react'
import { chakra } from '@chakra-ui/system'
import { IconProps } from './shared'

export type CommunityIconProps = IconProps

export function CommunityIcon(props: CommunityIconProps) {
  return (
    <chakra.svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.992 12C13.7877 12 14.5507 12.3161 15.1133 12.8787C15.6759 13.4413 15.992 14.2044 15.992 15L15.99 16.497C16.196 20.17 13.367 22.002 8.12 22.002C2.891 22.002 0 20.194 0 16.549V15C0 14.2044 0.316071 13.4413 0.87868 12.8787C1.44129 12.3161 2.20435 12 3 12H12.992ZM20.992 12C21.7876 12 22.5507 12.3161 23.1133 12.8787C23.6759 13.4413 23.992 14.2044 23.992 15V16.053C24.172 19.348 21.672 21 17.103 21C16.483 21 15.9 20.97 15.355 20.91C15.9318 20.3839 16.3741 19.7272 16.645 18.995L17.103 19C20.672 19 22.098 18.057 21.993 16.108V15C21.993 14.7348 21.8876 14.4804 21.7001 14.2929C21.5126 14.1054 21.2582 14 20.993 14H16.866C16.6654 13.2253 16.2369 12.5286 15.636 12H20.993H20.992ZM12.992 14H3C2.73478 14 2.48043 14.1054 2.29289 14.2929C2.10536 14.4804 2 14.7348 2 15V16.55C2 18.841 3.856 20.002 8.12 20.002C12.368 20.002 14.12 18.867 13.992 16.552V15C13.992 14.7348 13.8866 14.4804 13.6991 14.2929C13.5116 14.1054 13.2572 14 12.992 14ZM8 0C9.32635 0 10.5984 0.526889 11.5362 1.46476C12.4741 2.40263 13.001 3.67465 13.001 5.001C13.001 6.32735 12.4741 7.59937 11.5362 8.53724C10.5984 9.47511 9.32635 10.002 8 10.002C6.67365 10.002 5.40163 9.47511 4.46376 8.53724C3.52589 7.59937 2.999 6.32735 2.999 5.001C2.999 3.67465 3.52589 2.40263 4.46376 1.46476C5.40163 0.526889 6.67365 0 8 0ZM18 2C19.0609 2 20.0783 2.42143 20.8284 3.17157C21.5786 3.92172 22 4.93913 22 6C22 7.06087 21.5786 8.07828 20.8284 8.82843C20.0783 9.57857 19.0609 10 18 10C16.9391 10 15.9217 9.57857 15.1716 8.82843C14.4214 8.07828 14 7.06087 14 6C14 4.93913 14.4214 3.92172 15.1716 3.17157C15.9217 2.42143 16.9391 2 18 2ZM8 2C7.6059 2 7.21567 2.07762 6.85157 2.22844C6.48747 2.37925 6.15664 2.6003 5.87797 2.87897C5.5993 3.15764 5.37825 3.48847 5.22744 3.85257C5.07662 4.21667 4.999 4.6069 4.999 5.001C4.999 5.3951 5.07662 5.78534 5.22744 6.14943C5.37825 6.51353 5.5993 6.84436 5.87797 7.12303C6.15664 7.4017 6.48747 7.62275 6.85157 7.77356C7.21567 7.92438 7.6059 8.002 8 8.002C8.79591 8.002 9.55923 7.68582 10.122 7.12303C10.6848 6.56023 11.001 5.79692 11.001 5.001C11.001 4.20509 10.6848 3.44177 10.122 2.87897C9.55923 2.31618 8.79591 2 8 2ZM18 4C17.4696 4 16.9609 4.21071 16.5858 4.58579C16.2107 4.96086 16 5.46957 16 6C16 6.53043 16.2107 7.03914 16.5858 7.41421C16.9609 7.78929 17.4696 8 18 8C18.5304 8 19.0391 7.78929 19.4142 7.41421C19.7893 7.03914 20 6.53043 20 6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4Z"
        fill="currentcolor"
      />
    </chakra.svg>
  )
}
