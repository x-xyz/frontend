import { Theme } from '@chakra-ui/theme'

function families(...families: string[]) {
  return families.join(', ')
}

const fonts: Partial<Theme['fonts']> = {
  heading: families(
    '"Default Font"',
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
    '"Default Font"',
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
