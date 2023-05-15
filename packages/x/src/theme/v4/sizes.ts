import { Theme } from '@chakra-ui/theme'
import space from './space'

const largeSizes = {
  max: 'max-content',
  min: 'min-content',
  full: '100%',
  '3xs': '14rem',
  '2xs': '16rem',
  xs: '20rem',
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
  '3xl': '48rem',
  '4xl': '56rem',
  '5xl': '64rem',
  '6xl': '72rem',
  '7xl': '80rem',
  '8xl': '90rem',
  card: '22.5rem', // 360px
}

const container = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1240px',
  '2xl': '2000px',
  '3xl': '2560px',
}

const sizes: Theme['sizes'] = {
  ...space,
  ...largeSizes,
  container,
}

export default sizes
