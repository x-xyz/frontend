import Dropdown from 'components/Dropdown'
import Link from 'components/Link'
import { builtInCollections } from 'configs'
import { useRouter } from 'next/router'

import { CloseIcon, TriangleDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Collapse,
  Image,
  SkeletonText,
  Spacer,
  Stack,
  StackProps,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useWeb3React } from '@x/utils'
import { useEffect, useRef, useState } from 'react'

import ConnectWalletButton from '../wallet/ConnectWalletButton'
import { useQuery } from 'react-query'
import { ResponseOf } from '@x/models'
import MenuIcon from '../icons/MenuIcon'

export type HeaderProps = StackProps

export default function Header(props: HeaderProps) {
  const useDesktopView = useBreakpointValue({
    base: false,
    lg: true,
  })

  return useDesktopView ? <DesktopHeader {...props} /> : <MobileHeader {...props} />
}

function DesktopHeader(props: HeaderProps) {
  const { account } = useWeb3React()
  const { asPath } = useRouter()
  const { data: { data } = {}, isLoading } = useQuery<ResponseOf<{ apeburned: number }>>('/statistics/apeburned')

  return (
    <Stack as="header" w="full" h="96px" direction="row" align="center" spacing="30px" px={5} {...props}>
      <Link href="/">
        <Image src="/favicon.ico" w={10} h={10} />
      </Link>
      <Stack direction="row" alignItems="center" letterSpacing="-1px" fontWeight={500}>
        <Text>Total ApeCoin Burned =</Text>
        <SkeletonText minW={4} noOfLines={1} isLoaded={!isLoading} color="white">
          {(data?.apeburned || 0).toLocaleString()}
        </SkeletonText>
        <Image src="/assets/ico-apecoin.png" w={6} h={6} />
      </Stack>
      <Spacer />
      <Dropdown.List
        triggerElem={
          <Button
            display="flex"
            flexDir="row"
            variant={asPath.startsWith('/collection') ? undefined : 'link'}
            isActive={asPath.startsWith('/collection')}
            _active={{ bg: '#fff', color: '#000' }}
            flexShrink={0}
          >
            DISCOVER <TriangleDownIcon mt={0.5} ml={2} boxSize={2} />
          </Button>
        }
      >
        {builtInCollections.map(c => {
          const path = `/collection/${c.alias}`
          return (
            <Dropdown.Item key={c.alias} fontSize="xs">
              <Link href={path} isActive={asPath === path} w="full" h="40px" px={4} lineHeight="2.4rem">
                {c.name}
              </Link>
            </Dropdown.Item>
          )
        })}
      </Dropdown.List>
      {account && (
        <Link href={`/account/${account}`}>
          <Button
            variant={asPath.startsWith('/bulk-listing') ? undefined : 'link'}
            isActive={asPath.startsWith('/bulk-listing')}
            _active={{ bg: '#fff', color: '#000' }}
          >
            SELL
          </Button>
        </Link>
      )}
      <Link href="/ip/marketplace/buy">
        <Button
          variant={asPath.startsWith('/ip/marketplace') ? undefined : 'link'}
          isActive={asPath.startsWith('/ip/marketplace')}
          _active={{ bg: '#fff', color: '#000' }}
        >
          LICENSE
        </Button>
      </Link>
      <Dropdown.List
        triggerElem={
          <Button display="flex" flexDir="row" variant={'link'} _active={{ bg: '#fff', color: '#000' }} flexShrink={0}>
            REWARDS <TriangleDownIcon mt={0.5} ml={2} boxSize={2} />
          </Button>
        }
      >
        <Dropdown.Item fontSize="xs">
          <Link href="/vex" w="full">
            veX Dashboard
          </Link>
        </Dropdown.Item>
        <Dropdown.Item fontSize="xs">
          <Link href="https://x.vault.inc" w="full">
            X Token Staking Vault
          </Link>
        </Dropdown.Item>
        <Dropdown.Item fontSize="xs">
          <Link href="/past-rewards" w="full">
            Past Rewards
          </Link>
        </Dropdown.Item>
        <Dropdown.Item fontSize="xs">
          <Link href="/rewards" w="full">
            Listing Rewards
          </Link>
        </Dropdown.Item>
      </Dropdown.List>
      <Link href="/maas">
        <Button
          variant={asPath.startsWith('/maas') ? undefined : 'link'}
          isActive={asPath.startsWith('/maas')}
          _active={{ bg: 'unset', color: 'primary' }}
        >
          MAAS
        </Button>
      </Link>
      {!account && <ConnectWalletButton />}
      {account && (
        <Link href={`/account/${account}`} disabled={!account}>
          <Button
            variant={asPath.startsWith('/account') ? undefined : 'link'}
            isActive={asPath.startsWith('/account')}
            _active={{ bg: 'unset', color: 'primary' }}
          >
            PORTFOLIO
          </Button>
        </Link>
      )}
    </Stack>
  )
}

function MobileHeader(props: HeaderProps) {
  const { account } = useWeb3React()
  const { asPath } = useRouter()
  const { data: { data } = {}, isLoading } = useQuery<ResponseOf<{ apeburned: number }>>('/statistics/apeburned')
  const { isOpen, onToggle } = useDisclosure()

  const ref = useRef<HTMLDivElement>(null)
  const [collapsibleHeight, setCollapsibleHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const h = window.innerHeight - rect.top - rect.height
    setCollapsibleHeight(h)
  }, [])

  return (
    <Stack as="header" w="full" spacing={0} {...props}>
      <Stack w="full" direction="row" justifyContent="space-between" alignItems="center" ref={ref}>
        <Link href="/">
          <Image src="/favicon.ico" />
        </Link>
        <Button onClick={onToggle} variant="ghost">
          {isOpen ? (
            <CloseIcon />
          ) : (
            <MenuIcon />
            // <Stack spacing="4px">
            //   <Box height="2px" width={5} bgColor="white" />
            //   <Box height="2px" width={5} bgColor="white" />
            //   <Box height="2px" width={5} bgColor="white" />
            // </Stack>
          )}
        </Button>
      </Stack>
      <Stack position="relative" width="full">
        <Collapse in={isOpen} animateOpacity>
          <Stack w="full" h={collapsibleHeight} bgColor="black" position="absolute" alignItems="center">
            <Stack position="absolute" pt={10} h={collapsibleHeight} alignItems="flex-start">
              <Dropdown.List
                triggerElem={
                  <Button
                    display="flex"
                    flexDir="row"
                    variant={asPath.startsWith('/collection') ? undefined : 'link'}
                    isActive={asPath.startsWith('/collection')}
                    fontSize="2xl"
                    _active={{ bg: '#fff', color: '#000' }}
                  >
                    DISCOVER <TriangleDownIcon mt={0.5} ml={2} boxSize={2} />
                  </Button>
                }
              >
                {builtInCollections.map(c => {
                  const path = `/collection/${c.alias}`
                  return (
                    <Dropdown.Item key={c.alias} fontSize="xs">
                      <Link
                        href={path}
                        isActive={asPath === path}
                        w="full"
                        fontSize="md"
                        h="40px"
                        px={4}
                        lineHeight="2.4rem"
                      >
                        {c.name}
                      </Link>
                    </Dropdown.Item>
                  )
                })}
              </Dropdown.List>
              {account && (
                <Link href={`/account/${account}`}>
                  <Button
                    variant={asPath.startsWith('/bulk-listing') ? undefined : 'link'}
                    isActive={asPath.startsWith('/bulk-listing')}
                    fontSize="2xl"
                    _active={{ bg: '#fff', color: '#000' }}
                  >
                    SELL
                  </Button>
                </Link>
              )}
              <Link href="/ip/marketplace/buy">
                <Button
                  variant={asPath.startsWith('/ip/marketplace') ? undefined : 'link'}
                  isActive={asPath.startsWith('/ip/marketplace')}
                  fontSize="2xl"
                  _active={{ bg: '#fff', color: '#000' }}
                >
                  LICENSE
                </Button>
              </Link>
              <Dropdown.List
                triggerElem={
                  <Button
                    display="flex"
                    flexDir="row"
                    variant={'link'}
                    fontSize="2xl"
                    _active={{ bg: '#fff', color: '#000' }}
                  >
                    REWARDS <TriangleDownIcon mt={0.5} ml={2} boxSize={2} />
                  </Button>
                }
              >
                <Dropdown.Item fontSize="xs">
                  <Link href="/vex" w="full">
                    veX Dashboard
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item fontSize="xs">
                  <Link href="https://x.vault.inc" w="full">
                    X Token Staking Vault
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item fontSize="xs">
                  <Link href="/past-rewards" w="full">
                    Past Rewards
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item fontSize="xs">
                  <Link href="/rewards" w="full">
                    Listing Rewards
                  </Link>
                </Dropdown.Item>
              </Dropdown.List>
              <Link href="/maas">
                <Button
                  variant={asPath.startsWith('/maas') ? undefined : 'link'}
                  isActive={asPath.startsWith('/maas')}
                  fontSize="2xl"
                  _active={{ bg: '#fff', color: '#000' }}
                >
                  MAAS
                </Button>
              </Link>
              {!account && <ConnectWalletButton fontSize="2xl" />}
              {account && (
                <Link href={`/account/${account}`} disabled={!account}>
                  <Button
                    variant={asPath.startsWith('/account') ? undefined : 'link'}
                    isActive={asPath.startsWith('/account')}
                    fontSize="2xl"
                    _active={{ bg: '#fff', color: '#000' }}
                  >
                    PORTFOLIO
                  </Button>
                </Link>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
    </Stack>
  )
}
