import { Center } from '@chakra-ui/layout'
import { TelegramIcon } from '@x/components/icons'
import Link from 'components/Link'
import Image from 'components/Image'

export default function SocialLinks() {
  return (
    <>
      <Link href="https://twitter.com/Xdotxyz">
        <Center>
          <Image src="/assets/twitter.png" width="16px" height="16px" />
        </Center>
      </Link>
      <Link href="https://discord.gg/a7jWVMNqc6">
        <Center>
          <Image src="/assets/discord.png" width="16px" height="16px" />
        </Center>
      </Link>
      <Link href="https://t.me/xdotxyz ">
        <Center>
          <TelegramIcon width="16px" height="16px" />
        </Center>
      </Link>
    </>
  )
}
