const NODE_ENV = normalizeEnv(process.env.NODE_ENV)
const APP_ENV = normalizeEnv(process.env.APP_ENV || NODE_ENV)

console.log('NODE_ENV', NODE_ENV)
console.log('APP_ENV', APP_ENV)

const apiUrls = {
  // dev: 'http://localhost:5001',
  dev: 'https://dev-api.x.xyz',
  prod: 'https://api.x.xyz',
}

const goapiUrls = {
  // dev: 'http://localhost:9090',
  dev: 'https://dev-goapi.x.xyz',
  prod: 'https://goapi.x.xyz',
}

const storageUrls = {
  dev: 'https://dev-storage.x.xyz',
  prod: 'https://storage.x.xyz',
}

const fantomContractAddresses = {
  dev: {
    auction: '0xd0E14688CAF1DB5ba1583B451207c7ee3025078b',
    marketplace: '0x16eC29B0277a245CeDA5F80BECA8A345E27396Ec',
    bundleMarketplace: '0x090027A23CA66eca001c4b4495AA55753f39A890',
  },
  prod: {
    auction: '0x36c42435f9558f5816ce020865CD71154675ccA1',
    marketplace: '0xC1e31C6BEAeD64AeE73bDb16632a2374cE452B61',
    bundleMarketplace: '0xF9c838e4bc91448C234Bce114548AD93F38aED42',
  },
}

const adminAddresses = {
  dev: '0xAb4F15b0bfaFE758371589c2524eB39d53E87dCa',
  prod: '0x69633cbDb25be419E491fF718836c72b78A66369',
}

const ethereumRpcUrl = {
  dev: '',
  prod: '',
}

const features = {}

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  env: {
    DEFAULT_CHAIN_ID: '1',
    APP_ENV,
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    GTAG_ID: process.env.GTAG_ID,
    SIGNATURE_MESSAGE: 'Approve Signature on x.xyz with nonce %s',
    SHOW_DEBUG_COLLECTIONS: process.env.SHOW_DEBUG_COLLECTIONS,

    // x
    API_URL: apiUrls[APP_ENV],
    GOAPI_URL: goapiUrls[APP_ENV],
    STORAGE_URL: storageUrls[APP_ENV],

    AUCTION_CONTRACT_ADDRESS_1: '0x6E900BCCBaf41B61DEF40F351Ed0c94b8C47C0B1',
    AUCTION_CONTRACT_ADDRESS_3: '0xE6B17a03250796fad18d5208cF74B2F61F0C7981',
    AUCTION_CONTRACT_ADDRESS_56: '0x6E900BCCBaf41B61DEF40F351Ed0c94b8C47C0B1',
    AUCTION_CONTRACT_ADDRESS_97: '0xd0E14688CAF1DB5ba1583B451207c7ee3025078b',
    AUCTION_CONTRACT_ADDRESS_250: fantomContractAddresses[APP_ENV].auction,

    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_1: '0xdB15CD9bf661802D1B3f5fe38BAda0493897ED14',
    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_3: '0xB10c699D6B46f308d56d1eD921abB14dc3502eEB',
    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_56: '0xdB15CD9bf661802D1B3f5fe38BAda0493897ED14',
    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_97: '0x090027A23CA66eca001c4b4495AA55753f39A890',
    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_250: fantomContractAddresses[APP_ENV].bundleMarketplace,

    MARKETPLACE_CONTRACT_ADDRESS_1: '0x187e8e5c70457C756A5779AEB2227eF098bCA776',
    MARKETPLACE_CONTRACT_ADDRESS_3: '0x3864E8C46993261845863e25415C6E850377e320',
    MARKETPLACE_CONTRACT_ADDRESS_56: '0x187e8e5c70457C756A5779AEB2227eF098bCA776',
    MARKETPLACE_CONTRACT_ADDRESS_97: '0x16eC29B0277a245CeDA5F80BECA8A345E27396Ec',
    MARKETPLACE_CONTRACT_ADDRESS_250: fantomContractAddresses[APP_ENV].marketplace,

    ADMIN_WHITELIST: adminAddresses[APP_ENV],

    ETHEREUM_RPC_URL: ethereumRpcUrl[APP_ENV],

    // veX token
    VOTING_ESCROW_1: '0x5B8c598ef69E8Eb97eb55b339A45dcf7bdc5C3A3',
    VOTING_ESCROW_3: '0x57Cb7324039Dd3b2688Dd563AcFb35F1278a2e08',

    FEE_DISTRIBUTION_1: '0x96B1BE20543f0DF56D731328b23A7AA06d038a12',
    FEE_DISTRIBUTION_3: '0x9731db6b0b5106dc21b5676b60aa374c0efc48db',

    FEATURE_FLAGS: JSON.stringify(features),
  },
  redirects() {
    return [
      { source: '/', destination: '/thankyou', permanent: false },
      { source: '/account/:path*', destination: '/thankyou', permanent: false },
      { source: '/asset/:path*', destination: '/thankyou', permanent: false },
      { source: '/collection/:path*', destination: '/thankyou', permanent: false },
      { source: '/ip/:path*', destination: '/thankyou', permanent: false },
      { source: '/bulk-listing', destination: '/thankyou', permanent: false },
      { source: '/collections', destination: '/thankyou', permanent: false },
      { source: '/maas', destination: '/thankyou', permanent: false },
      { source: '/past-rewards', destination: '/thankyou', permanent: false },
      { source: '/rewards', destination: '/thankyou', permanent: false },
      { source: '/vex', destination: '/thankyou', permanent: false },
    ]
  },
}

function normalizeEnv(env) {
  switch (env) {
    case 'dev':
    case 'development':
      return 'dev'
    case 'prod':
    case 'production':
    default:
      return 'prod'
  }
}

module.exports = nextConfig
