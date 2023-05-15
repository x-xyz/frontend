import { Theme } from '@chakra-ui/theme'

function families(...families: string[]) {
  return families.join(', ')
}

const fonts: Partial<Theme['fonts']> = {
  heading: families(
    'A2Gothic-Bold',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Helvetica',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ),
  body: families(
    'HelveticaNowDisplay',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Helvetica',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ),
  mono: families('SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'),
}

export default fonts
