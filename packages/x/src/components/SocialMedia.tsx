import { Image } from '@chakra-ui/image'
import { Box, Flex, FlexProps } from '@chakra-ui/layout'
import Link from './Link'
import TwitterIcon from 'components/icons/TwitterIcon'
import DiscordIcon from 'components/icons/DiscordIcon'
import MediumIcon from 'components/icons/MediumIcon'

export default function SocialMedia(props: FlexProps) {
  const medias = [
    {
      src: '/assets/v3/ico-twitter-80x80.png',
      link: 'https://twitter.com/Xdotxyz',
      icon: (
        <Box w={10} h={10} border="2px solid" borderColor="divider" borderRadius="20px">
          <TwitterIcon w="full" h="full" color="primary" />
        </Box>
      ),
    },
    {
      src: '/assets/v3/ico-discord-80x80.png',
      link: 'https://discord.gg/a7jWVMNqc6',
      icon: (
        <Box w={10} h={10} border="2px solid" borderColor="divider" borderRadius="20px">
          <DiscordIcon w="full" h="full" color="primary" />
        </Box>
      ),
    },
    {
      src: '/assets/v3/ico-medium-80x80.png',
      link: 'https://medium.com/@x.xyz',
      icon: (
        <Box w={10} h={10} border="2px solid" borderColor="divider" borderRadius="20px">
          <MediumIcon w="full" h="full" color="primary" />
        </Box>
      ),
    },
  ]

  return (
    <Flex justify="space-between" {...props}>
      {medias.map((m, idx) => (
        <Link key={idx} href={m.link}>
          {m.icon || <Image src={m.src} w={10} h={10} />}
        </Link>
      ))}
    </Flex>
  )
}
