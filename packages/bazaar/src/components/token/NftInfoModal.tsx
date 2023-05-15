import { motion } from 'framer-motion'
import Icon from '@chakra-ui/icon'
import { Box, Center } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, ModalProps } from '@chakra-ui/modal'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { SlideFade } from '@chakra-ui/transition'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CgScrollV } from 'react-icons/cg'
import NftInfo from './NftInfo'
import NftInfoDetail from './NftInfoDetail'
import { useNftInfo } from './NftInfoProvider'
import GridBackground from 'components/GridBackground'
import Link from 'components/Link'
import { BigNumber } from '@ethersproject/bignumber'

export interface NftInfoModalProps extends Omit<ModalProps, 'children'> {
  onPageModeChange?: (pageMode: boolean) => void
}

export default function NftInfoModal({ onClose, ...props }: NftInfoModalProps) {
  const { push, asPath } = useRouter()

  const { contractAddress, tokenId } = useNftInfo()

  const path = useMemo(
    () => `/asset/${contractAddress}/${BigNumber.from(tokenId).toNumber()}`,
    [contractAddress, tokenId],
  )

  const [progress, setProgress] = useState(0)

  const animationProgress = useMemo(() => Math.pow(progress + 0.4, 4), [progress])

  const [pageMode, setPageMode] = useState(false)

  const ref = useRef({ scrollHeight: 0, offsetHeight: 0, lastScrollTop: 0, hasRouted: false, mounted: false })

  useEffect(() => {
    if (progress > 0.8) setPageMode(true)
  }, [progress])

  useEffect(() => {
    if (!pageMode || ref.current.hasRouted) return
    push(path, undefined)
    ref.current.hasRouted = true
  }, [pageMode, path, push])

  useEffect(() => {
    // to prevent close modal when initialing
    if (!ref.current.mounted) return
    // after routed, we are browsing a mock version of token page (this is page mode of this modal)
    // keep this modal until user trying to open aother modal
    if (ref.current.hasRouted) {
      if (path !== asPath) onClose()
    } else {
      onClose()
    }
  }, [path, asPath, onClose])

  useEffect(
    () => () => {
      // sync scroll top to underlying page
      if (ref.current.hasRouted) window.scrollTo({ top: ref.current.lastScrollTop })
    },
    [],
  )

  useEffect(() => {
    ref.current.mounted = true

    return () => {
      ref.current.mounted = false // eslint-disable-line react-hooks/exhaustive-deps
    }
  }, [])

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement

    const { scrollTop } = target

    ref.current.lastScrollTop = scrollTop

    // prevent unnecessary updating
    if (ref.current.hasRouted) return

    if (!ref.current.scrollHeight) ref.current.scrollHeight = target.scrollHeight

    if (!ref.current.offsetHeight) ref.current.offsetHeight = target.offsetHeight

    const { scrollHeight, offsetHeight } = ref.current

    const scrollRange = scrollHeight - offsetHeight

    const progress = scrollTop / scrollRange

    setProgress(progress)
  }

  return (
    <>
      <Modal size={useBreakpointValue({ sm: 'lg', md: '3xl' })} onClose={onClose} motionPreset="none" {...props}>
        {!pageMode && <ModalOverlay />}
        <ModalContent
          mt={pageMode ? 0 : undefined}
          mb={pageMode ? 0 : '50vh'}
          containerProps={{ onScroll, overflowX: 'hidden', zIndex: pageMode ? 'sticky' : undefined }}
          bg="background"
          boxShadow={pageMode ? 'none' : undefined}
          pt={pageMode ? '64px' : '0px'}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w={pageMode ? '100vw' : `${100 * (1 + animationProgress)}%`}
            h={pageMode ? '100%' : `${100 * (1 + animationProgress)}%`}
            maxW="100vw"
            borderRadius={pageMode ? 0 : '10px'}
            bg="background"
            transition="all .2s"
            zIndex={-1}
          >
            <GridBackground preset="token-page" opacity={pageMode ? 1 : animationProgress} maxH="100vh" />
          </Box>

          {!pageMode && <ModalCloseButton />}
          <ModalBody overflow="hidden" px={4}>
            <NftInfo />
            <SlideFade in={pageMode} offsetY="100px" delay={0.2}>
              <NftInfoDetail display={pageMode ? 'flex' : 'none'} />
            </SlideFade>
            <SlideFade in={!pageMode} offsetY="100px">
              <Center p={4} flexDirection="column">
                <Link href={path}>Scroll down or click to see more</Link>
                <motion.div
                  animate={{ translateY: [0, -2, 0, 2, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Icon as={CgScrollV} h="32px" transform="scale(2)" />
                </motion.div>
              </Center>
            </SlideFade>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
