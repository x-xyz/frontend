import { createElement } from 'react'
import * as CSS from 'csstype'
import { Box, BoxProps } from '@chakra-ui/layout'
import { ResponsiveValue } from '@chakra-ui/styled-system'
import { useTheme } from '@chakra-ui/system'
import { getColor } from '@chakra-ui/theme-tools'

export type Preset = 'default' | 'token-page'

interface PresetData {
  image: ResponsiveValue<CSS.Property.BackgroundImage>
  repeat?: ResponsiveValue<CSS.Property.BackgroundRepeat>
  position?: ResponsiveValue<CSS.Property.BackgroundPosition>
  size?: ResponsiveValue<CSS.Property.BackgroundSize>
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
}

const presets: Record<Preset, (PresetData | React.JSXElementConstructor<any>)[]> = {
  default: [
    // {
    //   image: '/assets/bg-color.png',
    //   repeat: 'no-repeat',
    //   position: 'top right',
    //   top: 0,
    //   right: 0,
    //   // size: 'contain',
    // },
    {
      image: '/assets/token-page-bg-color-1.png',
      repeat: 'no-repeat',
      position: 'center right',
      top: '400px',
      right: 0,
      size: 'contain',
    },
    {
      image: '/assets/token-page-bg-color-2.png',
      repeat: 'no-repeat',
      position: 'bottom left',
      top: '800',
      left: 0,
      size: 'contain',
    },
  ],
  'token-page': [
    () => (
      <Box
        bg="cyan"
        filter="blur(100px)"
        w="250px"
        h="300px"
        position="absolute"
        left="50%"
        top="100px"
        opacity="0.75"
      />
    ),
    () => (
      <Box
        bg="purple"
        filter="blur(100px)"
        w="300px"
        h="250px"
        position="absolute"
        left="50%"
        top="300px"
        opacity="0.75"
        transform="translateX(-100%)"
      />
    ),
    () => (
      <Box
        bg="linear-gradient(to top, rgba(255, 255, 255, 0.4), transparent), url(https://grainy-gradients.vercel.app/noise.svg)"
        bgSize="cover"
        bgPos="center center"
        filter="contrast(170%) brightness(1000%)"
        w="500px"
        h="500px"
        position="absolute"
        left="50%"
        top="150px"
        transform="translateX(-50%)"
        opacity="0.06"
      />
    ),
    // {
    //   image: '/assets/token-page-bg-color.png',
    //   repeat: 'no-repeat',
    //   position: 'top center',
    //   top: 0,
    //   right: 0,
    // },
    // {
    //   image: '/assets/token-page-bg-color-1.png',
    //   repeat: 'no-repeat',
    //   position: 'center right',
    //   top: '400px',
    //   right: 0,
    //   size: 'contain',
    // },
    // {
    //   image: '/assets/token-page-bg-color-2.png',
    //   repeat: 'no-repeat',
    //   position: 'bottom left',
    //   top: '800',
    //   left: 0,
    //   size: 'contain',
    // },
  ],
}

export interface GridBackgroundProps extends BoxProps {
  preset?: Preset
  watermark?: boolean
}

export default function GridBackground({ preset = 'default', watermark, ...props }: GridBackgroundProps) {
  const theme = useTheme()
  return (
    <Box
      position={watermark ? 'fixed' : 'absolute'}
      top={0}
      left={0}
      overflow="hidden"
      width="100%"
      height="100%"
      zIndex={-1}
      {...props}
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        top={0}
        right={0}
        backgroundImage={`linear-gradient(to top, ${getColor(
          theme,
          'background',
        )} 50%, transparent), url(/assets/bg-grid.png)`}
        zIndex={-1}
      />
      {presets[preset].map((preset, index) => {
        if (typeof preset === 'function') return createElement(preset, { key: index })
        return (
          <Box
            key={index}
            position="absolute"
            width="100%"
            height="100%"
            top={preset.top}
            left={preset.left}
            right={preset.right}
            bottom={preset.bottom}
            backgroundImage={`url(${preset.image})`}
            backgroundRepeat={preset.repeat}
            backgroundPosition={preset.position}
            backgroundSize={preset.size}
            zIndex={-1}
          />
        )
      })}
    </Box>
  )
}
