import Image from 'next/image'
import { Avatar, Box, Spacer, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import Layout, { LayoutProps } from 'components/Layout/v2'
import { NavBar, NavItem } from 'components/Nav'
import { useActiveWeb3React } from '@x/hooks'
import AccountAvatar from 'components/account/AccountAvatar'
import { useRouter } from 'next/router'

export default function ApesLayout({ children, ...props }: LayoutProps) {
  const { account } = useActiveWeb3React()

  const { route } = useRouter()

  const isMobile = useBreakpointValue({ base: true, md: false })

  const iconSize = isMobile ? { w: '14px', h: '14px' } : { w: 6, h: 6 }

  return (
    <Layout {...props} bgImage="url(/assets/apes/bg.webp)" bgSize="contain" bgPos="center top">
      <Stack direction={{ base: 'column', lg: 'row' }} align="center" justify="space-between">
        <Stack>
          <Text
            variant="gradient"
            fontSize={{ base: '24px', lg: '36px' }}
            fontWeight="bold"
            textAlign={{ base: 'center', lg: 'initial' }}
          >
            Limited Time Only
          </Text>
          <Text
            fontSize={{ base: 'sm', lg: 'lg' }}
            fontWeight="medium"
            textDecor="underline"
            color="#FBD786"
            textAlign={{ base: 'center', lg: 'initial' }}
          >
            Ape In and Earn X
          </Text>
        </Stack>
        <Spacer />
        <Stack direction="row" align="center" spacing={{ base: 4, lg: 8 }}>
          {!isMobile && (
            <Box>
              <Image src="/assets/apes/kv0.webp" width={115} height={245.5} />
            </Box>
          )}
          <Box>
            <Image src="/assets/apes/kv1.webp" width={102.5} height={279} />
          </Box>
          <Box>
            <Image src="/assets/apes/kv2.webp" width={122.5} height={308} />
          </Box>
          <Box>
            <Image src="/assets/apes/kv3.webp" width={122} height={307} />
          </Box>
          <Box>
            <Image src="/assets/apes/kv4.webp" width={109} height={265} />
          </Box>
          {!isMobile && (
            <Box>
              <Image src="/assets/apes/kv5.webp" width={112} height={244} />
            </Box>
          )}
        </Stack>
        <Spacer />
      </Stack>
      <NavBar>
        <NavItem
          icon={account && <AccountAvatar account={account} {...iconSize} />}
          disabled={!account}
          href="mine"
          active={route === '/apes/mine'}
        >
          My Apes
        </NavItem>
        <NavItem
          icon={<Avatar src="/assets/apes/bayc.webp" {...iconSize} />}
          href="bayc"
          active={route === '/apes/bayc'}
        >
          {isMobile ? 'BAYC' : 'Bored Ape Yacht Club'}
        </NavItem>
        <NavItem
          icon={<Avatar src="/assets/apes/mayc.webp" {...iconSize} />}
          href="mayc"
          active={route === '/apes/mayc'}
        >
          {isMobile ? 'MAYC' : 'Mutant Ape Yacht Club'}
        </NavItem>
        <NavItem
          icon={<Avatar src="/assets/apes/bakc.webp" {...iconSize} />}
          href="bakc"
          active={route === '/apes/bakc'}
        >
          {isMobile ? 'BAKC' : 'Bored Ape Kennel Club'}
        </NavItem>
      </NavBar>
      {children}
    </Layout>
  )
}
