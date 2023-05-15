import { Box, BoxProps, keyframes } from '@chakra-ui/react'

export default function ScrollingMouse(props: BoxProps) {
  const mouseHeight = '50px'

  const mouseScrolling = keyframes`
  to {
    transform: translate(-50%, 6px) scale(1, 0.8);
  }
  `

  const animationStyle = {
    content: "''",
    display: 'block',
    position: 'absolute',
    top: '8px',
    left: '50%',
    width: '3px',
    height: '12px',
    borderRadius: '5px',
    backgroundColor: 'primary',
    animation: `${mouseScrolling} 0.8s infinite alternate`,
    transform: 'translateX(-50%)',
    zIndex: -1,
  }

  return (
    <Box
      display={{ base: 'none', md: 'flex' }}
      margin="auto"
      h={mouseHeight}
      borderRadius="23px"
      borderWidth="2px"
      borderColor="primary"
      borderStyle="solid"
      w="34px"
      position="relative"
      _after={animationStyle}
      {...props}
    />
  )
}
