import { Image, Spacer, Stack, useBreakpointValue } from '@chakra-ui/react'
import Searchbar from 'components/search/Searchbar'
import SearchModalButton from 'components/search/SearchModalButton'
import Nav from './Nav'
import { NavModalButton } from './modals/NavModal'
import Link from 'components/Link'
import { useEffect, useState } from 'react'

export default function Header() {
  const useDesktopView = useBreakpointValue({ base: false, lg: true })
  const [showBg, setShowBg] = useState(false)
  useEffect(() => {
    function onScroll() {
      if (document.scrollingElement) {
        setShowBg(document.scrollingElement.scrollTop > 60)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Stack
      w="full"
      h="full"
      px={8}
      py={5}
      direction="row"
      align="center"
      spacing="30px"
      bg={showBg ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)'}
      transition="background .6s"
    >
      <Link href="/">
        <Image w={10} h={10} src="/assets/logo.svg" />
      </Link>
      {useDesktopView && <Searchbar maxW="380px" />}
      <Spacer />
      {useDesktopView && <Nav flexShrink={0} />}
      {!useDesktopView && (
        <Stack direction="row" spacing={7}>
          <SearchModalButton />
          <NavModalButton />
        </Stack>
      )}
    </Stack>
  )
}
