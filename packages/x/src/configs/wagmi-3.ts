import { appEnv } from '@x/constants'

export const collections = [
  { name: 'World of Women', contract: '0xe785e82358879f061bc3dcac6f0444462d4b5330' },
  { name: 'Tasty Toastys', contract: '0x6264e45d7118f727314633d8e4c503d51d3b0d03' },
  { name: '8sian', contract: '0x198478f870d97d62d640368d111b979d7ca3c38f' },
  { name: 'Stoner Cats', contract: '0xd4d871419714b778ebec2e22c7c53572b573706e' },
  { name: 'Sad Girls Bar', contract: '0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8' },
  { name: 'Boss Beauties', contract: '0xb5c747561a185a146f83cfff25bdfd2455b31ff4' },
  { name: 'Crypto Coven', contract: '0x5180db8f5c931aae63c74266b211f580155ecac8' },
  { name: 'Women Rise', contract: '0x7f7685b4cc34bd19e2b712d8a89f34d219e76c35' },
  { name: 'Women and Weapons', contract: '0x338866f8ba75bb9d7a00502e11b099a2636c2c18' },
  { name: 'Rebel Society', contract: '0x8cd3cea52a45f30ed7c93a63fb2b5c13b453d5a1' },
  { name: 'The Flower Girls', contract: '0x2efa07cac3395599db83035d196f2a0e7263f766' },
  { name: 'Girls Riding Things', contract: '0x015b192a652129f6ea8c03dddb030297cf721af2' },
  { name: 'Encryptas', contract: '0x6391a41819c699972b75bf61db6b34ef940c96f0' },
  { name: 'Meta Angels', contract: '0xad265ab9b99296364f13ce5b8b3e8d0998778bfb' },
  { name: 'Wonderpals', contract: '0x3acce66cd37518a6d77d9ea3039e00b3a2955460' },
  { name: 'Girlies NFT', contract: '0x4f7e2a72a99d45f4fd5a2fc211f8dc5c36a049bd' },
  { name: 'Eyes of Fashion Official', contract: '0xef9e3414339a236cbfc8bf84c7fac24c2513b317' },
  { name: 'Long Neckie Ladies', contract: '0xbb3d13260b3f6893ace34a4284be70eccf4cc0f1' },
  { name: 'Fatales', contract: '0x0bb3e1c80c0ffde985fb0ec6392aa18a1d2de40e' },
  { name: 'Women Tribe', contract: '0x916fb29aa1a560c4540401b30c8199611d3a1809' },
  { name: 'Deadfellaz', contract: '0x2acab3dea77832c09420663b0e1cb386031ba17b' },
  { name: 'Empwr', contract: '0x0c84298dbaf3b714dd33bd0d3e3714a8b6648fd2' },
  { name: 'Remarkable Women NFT', contract: '0x3e69baab7a742c83499661c5db92386b2424df11' },
  { name: "Zipcy's SuperNormal", contract: '0xd532b88607b1877fe20c181cba2550e3bbd6b31c' },
  { name: 'Rebels Haunted Mansion', contract: '0x3af65d01f6cde41965a2d591bb399c8f0db76afd' },
  { name: 'Kumo x World Residents', contract: '0x0a098221bb295704ac70f60def959828f935ac4e' },
  { name: 'Mfer Chicks', contract: '0xda858c5183e9024c0d5301ee85ae1e41dbe0f880' },
  { name: 'Pixie Jars', contract: '0xea508034fcc8eeff24bf43effe42621008359a2e' },
  { name: 'FREE_DOM', contract: '0x12fc36fde2d63284b4eb5aee643c2603e24ff20f' },
]

// prettier-ignore
const scheduledNfts = [
  { chainId: 1, contract: '0x0c84298dbaf3b714dd33bd0d3e3714a8b6648fd2', tokenId: '663', startTime: new Date('2022-03-01T00:00:00+0800').valueOf(), endTime: new Date('2022-03-16T12:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x0c84298dbaf3b714dd33bd0d3e3714a8b6648fd2', tokenId: '645', startTime: new Date('2022-03-01T00:00:00+0800').valueOf(), endTime: new Date('2022-03-16T12:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x0c84298dbaf3b714dd33bd0d3e3714a8b6648fd2', tokenId: '848', startTime: new Date('2022-03-01T00:00:00+0800').valueOf(), endTime: new Date('2022-03-16T12:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x6264e45d7118f727314633d8e4c503d51d3b0d03', tokenId: '1179', startTime: new Date('2022-03-16T12:00:00+0800').valueOf(), endTime: new Date('2022-03-21T13:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x6264e45d7118f727314633d8e4c503d51d3b0d03', tokenId: '2358', startTime: new Date('2022-03-16T12:00:00+0800').valueOf(), endTime: new Date('2022-03-21T13:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x6264e45d7118f727314633d8e4c503d51d3b0d03', tokenId: '1814', startTime: new Date('2022-03-16T12:00:00+0800').valueOf(), endTime: new Date('2022-03-21T13:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x6264e45d7118f727314633d8e4c503d51d3b0d03', tokenId: '2356', startTime: new Date('2022-03-16T12:00:00+0800').valueOf(), endTime: new Date('2022-03-21T13:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x6264e45d7118f727314633d8e4c503d51d3b0d03', tokenId: '5115', startTime: new Date('2022-03-16T12:00:00+0800').valueOf(), endTime: new Date('2022-03-21T13:00:00+0800').valueOf() },
  { chainId: 1, contract: '0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8', tokenId: '6298', startTime: new Date('2022-03-21T13:00:00+0800').valueOf(), endTime: Number.MAX_SAFE_INTEGER },
  { chainId: 1, contract: '0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8', tokenId: '1408', startTime: new Date('2022-03-21T13:00:00+0800').valueOf(), endTime: Number.MAX_SAFE_INTEGER },
  { chainId: 1, contract: '0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8', tokenId: '9994', startTime: new Date('2022-03-21T13:00:00+0800').valueOf(), endTime: Number.MAX_SAFE_INTEGER },
]

const now = Date.now()

export const nfts =
  appEnv === 'dev'
    ? [
        { chainId: 3, contract: '0x53c3f6072bd09e5988cbb8c10232314133b78c27', tokenId: '1911' },
        { chainId: 3, contract: '0x53c3f6072bd09e5988cbb8c10232314133b78c27', tokenId: '1910' },
        { chainId: 3, contract: '0x53c3f6072bd09e5988cbb8c10232314133b78c27', tokenId: '1909' },
      ]
    : scheduledNfts.filter(nft => now >= nft.startTime && now < nft.endTime)
