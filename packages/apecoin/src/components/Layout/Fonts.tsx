import { Global } from '@emotion/react'

const extToFormat = {
  woff: 'woff',
  woff2: 'woff2',
  ttf: 'truetype',
}

function src(filename: string, ...extensions: Array<keyof typeof extToFormat>) {
  return `${extensions.map(ext => `url('/fonts/${filename}.${ext}') format('${extToFormat[ext]}')`)}`
}

const styles = `
  @font-face {
    font-family: 'Default Font';
    font-weight: 400;
    font-variation-settings: 'wght' 400;
    src: ${src('RobotoMono-VariableFont_wght', 'ttf')}
  }
  @font-face {
    font-family: 'Default Font';
    font-weight: 500;
    font-variation-settings: 'wght' 500;
    src: ${src('RobotoMono-VariableFont_wght', 'ttf')}
  }
  @font-face {
    font-family: 'Default Font';
    font-weight: 700;
    font-variation-settings: 'wght' 700;
    src: ${src('RobotoMono-VariableFont_wght', 'ttf')}
  }
`

export default function Fonts() {
  return <Global styles={styles} />
}
