import MediumIcon from 'components/icons/MediumIcon'
import Link from 'components/Link'

import { Stack, StackProps, Text } from '@chakra-ui/react'
import { DiscordIcon, TwitterIcon } from '@x/components/icons'

export type FooterProps = StackProps

const breakpoint = 'lg'

export default function Footer(props: FooterProps) {
  return (
    <Stack
      as="footer"
      w="full"
      fontSize={{ base: 'md', [breakpoint]: 'xs' }}
      p={{ base: 8, [breakpoint]: 10 }}
      direction={{ base: 'column', [breakpoint]: 'row' }}
      align="center"
      justifyContent="space-between"
      spacing={{ base: 6, [breakpoint]: 0 }}
      borderTopColor="#575757"
      borderTopWidth="1px"
      {...props}
    >
      <Text>© 2023 X Marketplace</Text>
      <Stack direction="row" spacing={{ base: 6, [breakpoint]: 10 }} alignItems="center">
        <Stack spacing={{ base: 6, [breakpoint]: 5 }} direction="row">
          <Link disabled>TEAM</Link>
          <Link href="https://discord.gg/a7jWVMNqc6" color="textSecondary">
            SUPPORT
          </Link>
        </Stack>
        <Stack spacing={{ base: 6, [breakpoint]: 5 }} direction="row">
          <Link href="https://twitter.com/Xdotxyz">
            <TwitterIcon w={6} h={6} color="textSecondary" />
          </Link>
          <Link href="https://discord.gg/a7jWVMNqc6">
            <DiscordIcon w={6} h={6} color="textSecondary" />
          </Link>
          <Link href="https://medium.com/@x.xyz">
            <MediumIcon w={6} h={6} color="textSecondary" />
          </Link>
        </Stack>
      </Stack>
    </Stack>
  )
}
