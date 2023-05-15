import Head from 'next/head'

export interface HeadMetaProps {
  title?: string
  description?: string
  twitterDescription?: string
  url?: string
  image?: string
  twitterImage?: string
}

export default function HeadMeta({
  title = 'Burn $APE',
  description = 'ApeCoin Marketplace',
  twitterDescription = 'X is the first marketplace for the NFT economy, built for Apes by Apes.',
  url = 'https://x.xyz',
  image = 'https://apecoin.com/assets/share.jpg',
  twitterImage = 'https://x.xyz/assets/x_120x120.jpg',
}: HeadMetaProps) {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="robots" name="robots" content="index, follow" />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:image" property="og:image" content={image} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:site_name" property="og:site_name" content="X" />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={twitterDescription} />
      <meta key="twitter:image" name="twitter:image" content={twitterImage} />
      <meta key="twitter:card" name="twitter:card" content="summary" />
      <meta key="twitter:site" name="twitter:site" content="@Xdotxyz" />
    </Head>
  )
}
