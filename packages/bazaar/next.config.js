const { withSentryConfig } = require('@sentry/nextjs') //eslint-disable-line @typescript-eslint/no-var-requires

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
  dev: 'https://api-dev.bzr.xyz/',
  prod: 'https://api.bzr.xyz/',
}

const storageUrls = {
  dev: 'https://dev-storage.x.xyz',
  prod: 'https://storage.x.xyz',
}

const adminAddresses = {
  dev: '0xAb4F15b0bfaFE758371589c2524eB39d53E87dCa',
  prod: '0xbad0c8E3Dd88890c1d70a1DeBD42D7fe206b3eFc',
}

const ethereumRpcUrl = {
  dev: '',
  prod: '',
}

const features = {
  notification: APP_ENV === 'dev',
  'checking-listing-when-transfering': true,
}

const tokenWhitelist = {
  56: [
    '0x0000000000000000000000000000000000000000', // BNB
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  ],
  97: [
    '0x0000000000000000000000000000000000000000', // BNB
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', // WBNB
    '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7', // BUSD
  ],
}

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  env: {
    NETWORK: 'mainnet',
    DEFAULT_CHAIN_ID: APP_ENV === 'prod' ? '56' : '97',
    APP_ENV,
    EXPLORER_RUL: 'https://ftmscan.com',
    GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    GTAG_ID: process.env.NEXT_PUBLIC_GTAG_ID,
    SIGNATURE_MESSAGE: 'Approve Signature on bzr.xyz with nonce %s',
    CHAIN_ID_WHITELIST: '56,97',
    // x
    API_URL: apiUrls[APP_ENV],
    GOAPI_URL: goapiUrls[APP_ENV],
    STORAGE_URL: storageUrls[APP_ENV],

    AUCTION_CONTRACT_ADDRESS_56: '0x10FD27982Cefc27BfaC08da3e6A5C6c802C7d3F8',
    AUCTION_CONTRACT_ADDRESS_97: '0xd0E14688CAF1DB5ba1583B451207c7ee3025078b',

    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_56: '0xaA1aC7A597f9B1831159B1a72Aa90389AA84C873',
    BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_97: '0x090027A23CA66eca001c4b4495AA55753f39A890',

    MARKETPLACE_CONTRACT_ADDRESS_56: '0x937Ef0888a8e226c2FaD04EF39E82B8047E494fC',
    MARKETPLACE_CONTRACT_ADDRESS_97: '0x16eC29B0277a245CeDA5F80BECA8A345E27396Ec',

    ADMIN_WHITELIST: adminAddresses[APP_ENV],

    ETHEREUM_RPC_URL: ethereumRpcUrl[APP_ENV],

    FEATURE_FLAGS: JSON.stringify(features),
    TOKEN_WHITELIST: JSON.stringify(tokenWhitelist),
  },
  async redirects() {
    return []
  },
  async rewrites() {
    if (APP_ENV === 'dev') return []

    const rewrites = [
      // { source: '/account/:slug*', destination: '/404' },
      // { source: '/asset/:slug*', destination: '/404' },
      // { source: '/collection/:slug*', destination: '/404' },
      // { source: '/collections', destination: '/404' },
      // { source: '/marketplace', destination: '/404' },
      // { source: '/mint', destination: '/404' },
    ]

    return {
      beforeFiles: [...rewrites],
      afterFiles: [],
      fallback: [],
    }
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

/**
 * @type {import('@sentry/webpack-plugin').SentryCliPluginOptions}
 */
const sentryConfig = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = withSentryConfig(nextConfig, sentryConfig)
