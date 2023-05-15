import Image from 'next/image'
import { Stack, StackProps, Spacer, Text, Divider, Center, Grid, GridItem } from '@chakra-ui/layout'
import { transparentize, getColor } from '@chakra-ui/theme-tools'
import { useTheme } from '@chakra-ui/system'
import Link from 'components/Link'
import { TelegramIcon } from '@x/components/icons'
import GridBackground, { Preset } from 'components/GridBackground'
import Searchbar from 'components/search/Searchbar'
import NavBar from './NavBar'
import Menu from './Menu'
import { layout } from 'theme'

export interface LayoutProps extends StackProps {
  backgroundPreset?: Preset
  backgroundWatermark?: boolean
}

export default function Layout({ children, backgroundPreset, backgroundWatermark, ...props }: LayoutProps) {
  const theme = useTheme()

  return (
    <>
      <GridBackground preset={backgroundPreset} watermark={backgroundWatermark} />
      <Grid
        width="100vw"
        height="fit-content"
        minHeight="100%"
        spacing={0}
        position="relative"
        templateRows={`${layout.headerHeight} 1fr auto`}
        {...props}
      >
        <GridItem
          position="sticky"
          top={0}
          left={0}
          zIndex="overlay"
          borderColor="divider"
          borderBottomWidth={{ base: '1px', sm: '0px' }}
        >
          <Stack
            w="100%"
            px={layout.globalPadding}
            py={4}
            direction="row"
            alignItems="center"
            bg={transparentize(getColor(theme, 'background'), 0.7)(theme)}
          >
            <Link href="/" flexShrink={0} display="flex" justifyContent="center">
              <Image src="/assets/logo.png" width="32px" height="32px" />
            </Link>
            <Spacer maxWidth={12} />
            <Searchbar display={{ sm: 'none' }} />
            <NavBar display={{ base: 'none', sm: 'flex' }} flexGrow={1} />
            <Menu display={{ base: 'flex', sm: 'none' }} />
          </Stack>
        </GridItem>
        <GridItem px={layout.globalPadding} maxW="100vw">
          {children}
        </GridItem>
        <GridItem>
          <Stack px={layout.globalPadding} py={4} spacing={4}>
            <Stack direction="row" alignItems="center">
              <Link href="/">
                <Stack direction="row" alignItems="center">
                  <Image src="/assets/logo.png" width="32px" height="32px" />
                  <Text>Gon&rsquo; Give It To Ya</Text>
                </Stack>
              </Link>
              <Spacer />
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
            </Stack>
            <Divider orientation="horizontal" />
            <Stack direction="row">
              {/* <Text fontSize="sm">©XChange 2021</Text> */}
              <Spacer />
            </Stack>
          </Stack>
        </GridItem>
      </Grid>
    </>
  )
}
