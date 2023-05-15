import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { toArray } from '@x/utils'

export interface HeadMetaProps {
  title?: string
  subtitle?: string | string[]
  description?: string
  image?: string
  urlPath?: string
}

const defaultTitle = 'BAZAAR'

const defaultDescription =
  'Bazaar is One-stop shop for all your BNB Chain NFTs and dedicated to rewarding the community with high earning reward program, community-driven governance, and exclusive NFT LaunchPad.'

const defaultImage = `https://bzr.xyz/assets/card.jpg`

export default function HeadMeta({
  title = defaultTitle,
  subtitle,
  description = defaultDescription,
  image = defaultImage,
  urlPath,
}: HeadMetaProps) {
  const { asPath } = useRouter()

  const displayTitle = useMemo(() => [...toArray(subtitle), title].filter(Boolean).join(' | '), [title, subtitle])

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{displayTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={`https://bzr.xyz/${urlPath || asPath}`} />
      <meta property="og:site_name" content="Bazaar" />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@BZRdotxyz" />
    </Head>
  )
}
