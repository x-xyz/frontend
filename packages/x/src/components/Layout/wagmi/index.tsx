import Image from 'next/image'
import { Avatar, Box, Spacer, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import Layout, { LayoutProps } from 'components/Layout/v2'
import { NavBar, NavItem } from 'components/Nav'
import { useActiveWeb3React } from '@x/hooks'
import AccountAvatar from 'components/account/AccountAvatar'
import { useRouter } from 'next/router'
import ReactSelect from 'components/input/ReactSelect'
import { getFirst } from '@x/utils'

export type Project = { name: string; address: string; image?: string }

export interface WagmiLayoutProps extends LayoutProps {
  assetsFolder: string
  projects: Project[]
}

export default function WagmiLayout({ children, assetsFolder, projects, ...props }: WagmiLayoutProps) {
  const { account } = useActiveWeb3React()

  const { route, push, query } = useRouter()

  const slug = decodeURIComponent(getFirst(query.slug) || '')

  const isMobile = useBreakpointValue({ base: true, md: false })

  const iconSize = isMobile ? { w: '14px', h: '14px' } : { w: 6, h: 6 }

  return (
    <Layout {...props} bgImage={`url(${assetsFolder}/bg.webp)`} bgSize="contain" bgPos="center top">
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
            Buy, sell & Earn X on eligible NFTs
          </Text>
        </Stack>
        <Spacer />
        <Stack direction="row" align="center" spacing={{ base: 4, lg: 8 }}>
          {!isMobile && (
            <Box>
              <Image src={`${assetsFolder}/kv0.webp`} width={115} height={245.5} />
            </Box>
          )}
          <Box>
            <Image src={`${assetsFolder}/kv1.webp`} width={102.5} height={279} />
          </Box>
          <Box>
            <Image src={`${assetsFolder}/kv2.webp`} width={122.5} height={308} />
          </Box>
          <Box>
            <Image src={`${assetsFolder}/kv3.webp`} width={122} height={307} />
          </Box>
          <Box>
            <Image src={`${assetsFolder}/kv4.webp`} width={109} height={265} />
          </Box>
          {!isMobile && (
            <Box>
              <Image src={`${assetsFolder}/kv5.webp`} width={112} height={244} />
            </Box>
          )}
        </Stack>
        <Spacer />
      </Stack>
      <NavBar overflowX="initial" justify="center">
        <Spacer />
        <NavItem
          icon={account && <AccountAvatar account={account} {...iconSize} />}
          disabled={!account}
          href="mine"
          active={route === '/wagmi/mine'}
        >
          My Collection
        </NavItem>
        <Spacer />
        <Stack direction={{ base: 'column', lg: 'row' }}>
          <Text fontWeight="bold" fontSize={{ base: 'xs', sm: 'sm' }} color="#FBD786" w="200px">
            NFT Collections eligible for the Monthly Special Promotion
          </Text>
          <ReactSelect
            formatOptionLabel={d => (
              <Stack direction="row" align="center">
                <Box w={5} h={5} flexShrink={0}>
                  {d.image && <Avatar w="100%" h="100%" src={d.image} />}
                </Box>
                <Text>{d.name}</Text>
              </Stack>
            )}
            filterOption={(option, input) => option.data.name.toLowerCase().includes(input.toLowerCase())}
            options={projects}
            onChange={v =>
              v && push(`/wagmi/${encodeURIComponent(v.name.toLowerCase())}`, undefined, { shallow: true })
            }
            styles={{ container: s => ({ ...s, width: 270 }) }}
            value={slug ? projects.find(p => p.name.toLowerCase() === slug) : void 0}
            placeholder="Select a project..."
          />
        </Stack>
        <Spacer />
      </NavBar>
      {children}
    </Layout>
  )
}
