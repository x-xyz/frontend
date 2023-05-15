import { Global } from '@emotion/react'

const extToFormat = {
  woff: 'woff',
  woff2: 'woff2',
  ttf: 'truetype',
}

function src(filename: string, ...extensions: Array<keyof typeof extToFormat>) {
  return `${extensions.map(ext => `url('/assets/fonts/${filename}.${ext}') format('${extToFormat[ext]}')`)}`
}

const styles = `
  @font-face {
    font-family: 'A2Gothic-Bold';
    font-weight: 700;
    src: ${src('A2Gothic-Bold', 'woff2', 'woff', 'ttf')}
  }
  @font-face {
    font-family: 'HelveticaNowDisplay';
    font-weight: 400;
    src: ${src('HelveticaNowDisplay-Regular', 'woff', 'ttf')}
  }
  @font-face {
    font-family: 'HelveticaNowDisplay';
    font-weight: 700;
    src: ${src('HelveticaNowDisplay-Bold', 'woff', 'ttf')}
  }
  @font-face {
    font-family: 'HelveticaNowDisplay';
    font-weight: 800;
    src: ${src('HelveticaNowDisplay-ExtraBold', 'woff', 'ttf')}
  }
`

export default function Fonts() {
  return <Global styles={styles} />
}
