import { Box, BoxProps } from '@chakra-ui/react'

export interface CardProps extends BoxProps {
  dark?: boolean
}

export default function Card({ dark, children, ...props }: CardProps) {
  return (
    <Box
      p={dark ? '2px' : undefined}
      borderRadius="10px"
      pos="relative"
      _before={
        dark
          ? {
              content: '""',
              display: 'block',
              bg: 'linear-gradient(150.71deg, #C471ED -30.38%, #F7797D 41.23%, rgba(251, 215, 134, 0.81) 115.2%)',
              bgSize: 'contain',
              borderRadius: '10px',
              pos: 'absolute',
              w: '100%',
              h: '100%',
              top: 0,
              left: 0,
              // zIndex: -1,
            }
          : undefined
      }
      {...props}
    >
      <Box
        p={5}
        top="2px"
        left="2px"
        pos="absolute"
        w="calc(100% - 4px)"
        h="calc(100% - 4px)"
        background={dark ? '#444557' : 'rgba(255, 255, 255, 0.88)'}
        color={dark ? 'text' : 'black'}
        borderRadius="10px"
        spacing={0}
      >
        {children}
      </Box>
    </Box>
  )
}
