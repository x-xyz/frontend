import {
  chakra,
  useDisclosure,
  Button,
  ButtonProps,
  Box,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Image,
  Stack,
  Spacer,
  Text,
  DrawerCloseButton,
} from '@chakra-ui/react'
import Link from 'components/Link'

export default function MenuButton(props: ButtonProps) {
  const { isOpen, onClose, onToggle } = useDisclosure()
  return (
    <>
      <Button variant="unstyled" minW="unset" color="text" pos="relative" onClick={onToggle} {...props}>
        <chakra.svg viewBox="0 0 28 48" overflow="visible" preserveAspectRatio="none" width="28px" height="48px">
          <Box
            as="line"
            x1="0"
            x2="28"
            y1="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            transformOrigin="14px 12px"
            transform={isOpen ? 'translate(0px, 8px) rotate(45deg)' : 'translate(0px, 0px) rotate(0deg)'}
            transition="transform .15s cubic-bezier(.4,0,.2,1)"
          />
          <Box
            as="line"
            x1="0"
            x2="28"
            y1="18"
            y2="18"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            transformOrigin="14px 18px"
            transform={isOpen ? 'translate(0px, 2px) rotate(-45deg)' : 'translate(0px, 0px) rotate(0deg)'}
            transition="transform .15s cubic-bezier(.4,0,.2,1)"
          />
        </chakra.svg>
        <Text
          as="span"
          fontSize="xs"
          pos="absolute"
          bottom={0}
          left={0}
          transition="opacity .15s cubic-bezier(.4,0,.2,1)"
          opacity={isOpen ? 0 : 1}
        >
          Menu
        </Text>
      </Button>
      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerContent maxW="384px" w="full">
          <DrawerCloseButton />
          <DrawerHeader py={10}>
            <Link href="/">
              <Image src="/assets/wordmark.svg" w="76px" />
            </Link>
          </DrawerHeader>
          <DrawerBody>
            <Stack h="full">
              <Stack spacing={4} fontSize="xl" fontWeight="bold">
                <Link disabled>ABOUT</Link>
                <Link disabled>GOVERNANCE</Link>
                <Link disabled>CLAIM</Link>
                <Link disabled>PROPOSALS</Link>
                <Link disabled>DISCUSSION</Link>
                <Link href="/collections">NFT MARKETPLACE</Link>
                <Box />
                <Link disabled>BUY/SELL</Link>
              </Stack>
              <Spacer />
              <Stack spacing={4}>
                <Link disabled>TERMS</Link>
                <Link disabled>PRIVACY</Link>
                <Link disabled>SUPPORT</Link>
                <Link disabled>PRESS INQUIRIES</Link>
                <Link disabled>PRESS KIT</Link>
              </Stack>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
