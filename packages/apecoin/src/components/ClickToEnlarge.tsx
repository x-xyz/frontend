import { useCallback, useState } from 'react'

import { Center, CenterProps } from '@chakra-ui/react'

export default function ClickToEnlarge({ children, ...props }: CenterProps) {
  const [isLarge, setLarge] = useState(false)
  const onClick = useCallback(() => {
    setLarge(prev => !prev)
  }, [])
  return (
    <Center
      onClick={onClick}
      {...props}
      cursor="pointer"
      pos={isLarge ? 'fixed' : props.pos}
      top={isLarge ? 0 : props.top}
      left={isLarge ? 0 : props.left}
      w={isLarge ? '100vw' : props.w}
      h={isLarge ? '100vh' : props.h}
      bg={isLarge ? 'rgba(0,0,0,0.8)' : props.bg}
      zIndex={isLarge ? 'overlay' : props.zIndex}
    >
      {children}
    </Center>
  )
}
