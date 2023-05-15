import { ChainId, TokenV2SortOption } from '@x/models'

export enum CollectionGroup {
  Yuga = 'Yuga Labs Collection',
  Otherside = 'Otherside Metaverse Partners',
  L2 = 'L2 Projects for the Yuga-Verse',
  ApeCoinGovernance = 'ApeCoin Governance',
}

export interface CollectionData {
  name: string
  alias: string
  chainId: ChainId
  address: string
  image: string
  group?: CollectionGroup
  isErc1155?: boolean
  order?: number
}

export const TwelvefoldAddressPlaceholder = '0x0000000000000000000000000000000000000001'

export const builtInCollections: CollectionData[] = [
  {
    name: 'Bored Ape Yacht Club',
    chainId: ChainId.Ethereum,
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Mutant Ape Yacht Club',
    chainId: ChainId.Ethereum,
    address: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Otherdeed',
    chainId: ChainId.Ethereum,
    address: '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Bored Ape Kennel Club',
    chainId: ChainId.Ethereum,
    address: '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Bored Ape Chemistry Club',
    chainId: ChainId.Ethereum,
    address: '0x22c36bfdcef207f9c0cc941936eff94d4246d14a',
    isErc1155: true,
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Wrapped Cryptopunks',
    chainId: ChainId.Ethereum,
    address: '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Meebits',
    chainId: ChainId.Ethereum,
    address: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Cool Cats NFT',
    chainId: ChainId.Ethereum,
    address: '0x1a92f7381b9f03921564a437210bb9396471050c',
    group: CollectionGroup.Otherside,
  },
  {
    name: 'CrypToadz by GREMPLIN',
    chainId: ChainId.Ethereum,
    address: '0x1cb1a5e65610aeff2551a50f76a87a7d3fb649c6',
    group: CollectionGroup.Otherside,
  },
  {
    name: 'Nouns',
    chainId: ChainId.Ethereum,
    address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    group: CollectionGroup.Otherside,
  },
  {
    name: 'World of Women',
    chainId: ChainId.Ethereum,
    address: '0xe785e82358879f061bc3dcac6f0444462d4b5330',
    group: CollectionGroup.Otherside,
  },
  {
    name: 'World of Women Galaxy',
    chainId: ChainId.Ethereum,
    address: '0xf61f24c2d93bf2de187546b14425bf631f28d6dc',
    group: CollectionGroup.Otherside,
  },
  {
    name: 'WoW - Capacitors',
    chainId: ChainId.Ethereum,
    address: '0x09f717f77b5e7f2d2f37604fec3d0e3d53eb9808',
    group: CollectionGroup.Otherside,
  },
  {
    name: '10KTF',
    chainId: ChainId.Ethereum,
    address: '0x0cfb5d82be2b949e8fa73a656df91821e2ad99fd',
    group: CollectionGroup.Yuga,
  },
  {
    name: '10KTF Gucci Grail',
    chainId: ChainId.Ethereum,
    address: '0x572e33ffa523865791ab1c26b42a86ac244df784',
    group: CollectionGroup.Yuga,
  },
  {
    name: '10KTF Kagami',
    chainId: ChainId.Ethereum,
    address: '0xccc1825cf04cae4d497b202d1434ec0f79ee535f',
    group: CollectionGroup.Yuga,
  },
  {
    name: '10KTF Stockroom',
    chainId: ChainId.Ethereum,
    address: '0x7daec605e9e2a1717326eedfd660601e2753a057',
    group: CollectionGroup.Yuga,
  },
  {
    name: '10ktf Combat Crates',
    chainId: ChainId.Ethereum,
    address: '0x85ed8f10c4889b4bc60400a0c1f796254d35003d',
    group: CollectionGroup.Yuga,
  },
  {
    name: '10ktf Combat Gear',
    chainId: ChainId.Ethereum,
    address: '0xe75ef1ec029c71c9db0f968e389331609312aa22',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Applied Primate Scientist Keycard',
    chainId: ChainId.Ethereum,
    address: '0x19445bb9f1b704dd973f8f9a4dce5ea5e55444da',
    group: CollectionGroup.L2,
    order: 100,
  },
  {
    name: 'MegaForce Sentinels',
    chainId: ChainId.Ethereum,
    address: '0xb7abcc333209f3e8af129ab99ee2a470a2ac5bae',
    group: CollectionGroup.L2,
    order: 99,
  },
  {
    name: 'Mutant Hound Collars',
    chainId: ChainId.Ethereum,
    address: '0xae99a698156ee8f8d07cbe7f271c31eeaac07087',
    group: CollectionGroup.L2,
  },
  {
    name: 'Mutant Hound',
    chainId: ChainId.Ethereum,
    address: '0x354634c4621cdfb7a25e6486cca1e019777d841b',
    group: CollectionGroup.L2,
  },
  {
    name: 'Genesis Oath',
    chainId: ChainId.Ethereum,
    address: '0x89c3df79aa8a3cbc96caf32f83eba8f1bd3787b9',
    group: CollectionGroup.L2,
  },
  {
    name: 'Bored & Dangerous',
    chainId: ChainId.Ethereum,
    address: '0xba627f3d081cc97ac0edc40591eda7053ac63532',
    group: CollectionGroup.L2,
  },
  {
    name: "Jenkins the Valet: The Writer's Room",
    chainId: ChainId.Ethereum,
    address: '0x880644ddf208e471c6f2230d31f9027578fa6fcc',
    group: CollectionGroup.L2,
  },
  {
    name: 'ApeCoin WG0',
    chainId: ChainId.Ethereum,
    address: '0x5bd13ff0279639f7c27da270e4a0e1a73f073de8',
    group: CollectionGroup.ApeCoinGovernance,
  },
  {
    name: 'Sewer pass',
    chainId: ChainId.Ethereum,
    address: '0x764aeebcf425d56800ef2c84f2578689415a2daa',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'HV-MTL',
    chainId: ChainId.Ethereum,
    address: '0x4b15a9c28034dc83db40cd810001427d3bd7163d',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Twelvefold',
    chainId: ChainId.Ethereum,
    address: TwelvefoldAddressPlaceholder,
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Otherdeed Expanded',
    chainId: ChainId.Ethereum,
    address: '0x790b2cf29ed4f310bf7641f013c65d4560d28371',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Otherside Koda',
    chainId: ChainId.Ethereum,
    address: '0xe012baf811cf9c05c408e879c399960d1f305903',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Otherside Vessels',
    chainId: ChainId.Ethereum,
    address: '0x5b1085136a811e55b2bb2ca1ea456ba82126a376',
    group: CollectionGroup.Yuga,
  },
  {
    name: 'Otherside Relics',
    chainId: ChainId.Ethereum,
    address: '0x0dfc1bc020e2d6a7cf234894e79686a88fbe2b2a',
    group: CollectionGroup.Yuga,
  },
  ...(process.env.SHOW_DEBUG_COLLECTIONS
    ? [
        {
          name: 'STARLIGHTS x SOCIETY',
          chainId: ChainId.Ethereum,
          address: '0xc5e6af4dc9104d29bf4c9570203b666cada199bd',
        },
        {
          name: 'Sneaker News Membership Card',
          chainId: ChainId.Ethereum,
          address: '0x3ec0f025c96292522f10217b2bde667d181b4ed8',
          isErc1155: true,
        },
        {
          name: 'Arcade',
          chainId: ChainId.Ethereum,
          address: '0x4a8c9d751eeabc5521a68fb080dd7e72e46462af',
        },
        {
          name: 'Soul Legacy Legends',
          chainId: ChainId.Ethereum,
          address: '0x9e9e4a52e25774cb9d234170a5a5c3d7af387a12',
        },
        {
          name: 'VOGUE8SIAN',
          chainId: ChainId.Ethereum,
          address: '0xfdDC8E98532d41732D09BbC291bcD0698b21A4Eb',
        },
        {
          name: 'Chill Bear Club',
          chainId: ChainId.Ethereum,
          address: '0xc7b76846De3DB54DB45c8b5deBCabfF4b0834F78',
        },
      ]
    : []),
].map(item => ({ ...item, image: '', alias: item.name.toLowerCase().replace(/\s/g, '-') }))

export const sortLabel: Record<TokenV2SortOption, string> = {
  [TokenV2SortOption.ListedAtDesc]: 'Recently Listed',
  [TokenV2SortOption.SoldAtDesc]: 'Recently Sold',
  [TokenV2SortOption.PriceAsc]: 'Price: Low to High',
  [TokenV2SortOption.PriceDesc]: 'Price: High to Low',
  [TokenV2SortOption.ViewedDesc]: 'Most Viewed',
  [TokenV2SortOption.LikedDesc]: 'Most Favorited',
  [TokenV2SortOption.CreatedAtAsc]: 'Oldest',
  [TokenV2SortOption.CreatedAtDesc]: 'Recently Created',
  [TokenV2SortOption.AuctionEndingSoon]: 'Auction Ending Soon',
  [TokenV2SortOption.LastSalePriceAsc]: 'Lowest Last Sale',
  [TokenV2SortOption.LastSalePriceDesc]: 'Highest Last Sale',
  [TokenV2SortOption.OfferPriceAsc]: 'Offer Price: Low to High',
  [TokenV2SortOption.OfferPriceDesc]: 'Offer Price: High to Low',
  [TokenV2SortOption.OfferDeadlineAsc]: 'Offer Ending Soon',
  [TokenV2SortOption.OfferCreatedAsc]: 'Oldest',
  [TokenV2SortOption.OfferCreatedDesc]: 'Recently Created',
}
