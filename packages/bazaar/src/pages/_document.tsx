import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'
import theme from 'theme'

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" sizes="16x16" href="/favicon-16.ico" type="image/x-icon" />
          <link rel="icon" sizes="16x16" href="/favicon-16.png" type="image/png" />
          <link rel="icon" sizes="32x32" href="/favicon-32.png" type="image/png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link
            href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Work+Sans:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
