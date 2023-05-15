const { withSentryConfig } = require('@sentry/nextjs') //eslint-disable-line @typescript-eslint/no-var-requires
const nextSafe = require('next-safe') //eslint-disable-line @typescript-eslint/no-var-requires

const NODE_ENV = normalizeEnv(process.env.NODE_ENV)
const APP_ENV = normalizeEnv(process.env.APP_ENV || NODE_ENV)

console.log('NODE_ENV', NODE_ENV)
console.log('APP_ENV', APP_ENV)

const apiUrls = {
  // dev: 'http://localhost:5001',
  dev: 'https://dev-api.x.xyz',
  stag: 'https://api.x.xyz',
  prod: 'https://api.x.xyz',
}

const goapiUrls = {
  // dev: 'http://localhost:9090',
  dev: 'https://dev-goapi.x.xyz',
  stag: 'https://goapi.x.xyz',
  prod: 'https://goapi.x.xyz',
}

const storageUrls = {
  dev: 'https://dev-storage.x.xyz',
  stag: 'https://storage.x.xyz',
  prod: 'https://storage.x.xyz',
}

const fantomContractAddresses = {
  dev: {
    auction: '0xd0E14688CAF1DB5ba1583B451207c7ee3025078b',
    marketplace: '0x16eC29B0277a245CeDA5F80BECA8A345E27396Ec',
    bundleMarketplace: '0x090027A23CA66eca001c4b4495AA55753f39A890',
  },
  stag: {
    auction: '0x36c42435f9558f5816ce020865CD71154675ccA1',
    marketplace: '0xC1e31C6BEAeD64AeE73bDb16632a2374cE452B61',
    bundleMarketplace: '0xF9c838e4bc91448C234Bce114548AD93F38aED42',
  },
  prod: {
    auction: '0x36c42435f9558f5816ce020865CD71154675ccA1',
    marketplace: '0xC1e31C6BEAeD64AeE73bDb16632a2374cE452B61',
    bundleMarketplace: '0xF9c838e4bc91448C234Bce114548AD93F38aED42',
  },
}

const adminAddresses = {
  dev: '0xAb4F15b0bfaFE758371589c2524eB39d53E87dCa',
  stag: '0x69633cbDb25be419E491fF718836c72b78A66369',
  prod: '0x69633cbDb25be419E491fF718836c72b78A66369',
}

const ethereumRpcUrl = {
  dev: '',
  stag: '',
  prod: '',
}

const features = {
  'claim-page': true,
  'vex-page': true,
  'promotion-page': true,
  notification: APP_ENV !== 'prod',
  'trait-filter': true,
  'trait-rarity': true,
  'checking-listing-when-transfering': true,
  'collections-sortor': true,
  'homepage.top-collections': true,
  'v3.collection-page': true,
  'v3.vex-dashboard-page': true,
  'v3.portfolio-page': true,
  'v3.portfolio-summary-table': true,
  'v3.portfolio-offers': true,
  'v3.portfolio-listings': true,
  'csp-header': false,
  'sale-modal.v2': true,
  'bulk-listing': true,
  'v4.homepage': true,
  'v4.marketplace-page': true,
  'v4.portfolio-page': APP_ENV !== 'prod',
}

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  env: {
    NETWORK: 'mainnet',
    DEFAULT_CHAIN_ID: '250',
    APP_ENV,
    EXPLORER_RUL: 'https://ftmscan.com',
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    GTAG_ID: process.env.GTAG_ID,
    SIGNATURE_MESSAGE: 'Approve Signature on x.xyz with nonce %s',

    // // artion.io
    // API_URL: 'https://api.artion.io',
    // STORAGE_URL: 'https://storage.artion.io',
    // AUCTION_CONTRACT_ADDRESS: '0x951Cc69504d39b3eDb155CA99f555E47E044c2F1',
    // MARKETPLACE_CONTRACT_ADDRESS: '0xa06aecbb8CD9328667f8E05f288e5b3ac1CFf852',
    // BUNDLE_MARKETPLACE_CONTRACT_ADDRESS: '0x56aD389A02Ea9d63f13106cB0c161342f537a92e',

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
  rewrites() {
    const beforeFiles = [
      // promotion page
      { has: [{ type: 'host', value: 'wagmi.x.xyz' }], source: '/', destination: '/wagmi' },
      { source: '/wagmi/:path*', destination: '/yuga-collections/:path*' },
      { source: '/create', destination: '/404' },
      { source: '/mint', destination: '/404' },
    ]

    if (features['v3.collection-page']) {
      beforeFiles.push({
        source: '/collection/:chainName/:collectionId',
        destination: '/v3/collection/:chainName/:collectionId',
      })
    }

    if (features['v3.vex-dashboard-page']) {
      beforeFiles.push({ source: '/vex', destination: '/v3/vex' })
    }

    if (features['v4.homepage']) {
      beforeFiles.push({ source: '/', destination: '/v4' })
    }

    if (features['v4.marketplace-page']) {
      beforeFiles.push({ source: '/marketplace', destination: '/v4/marketplace' })
    }

    if (features['v4.portfolio-page']) {
      beforeFiles.push({ source: '/account/:path*', destination: '/v4/account/:path*' })
    } else if (features['v3.portfolio-page']) {
      beforeFiles.push({ source: '/account/:path*', destination: '/v3/account/:path*' })
    }

    return {
      beforeFiles,
    }
  },
  redirects() {
    return []
  },
  headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: nextSafe({
          isDev: APP_ENV !== 'prod',
          frameOptions: 'DENY',
          referrerPolicy: 'no-referrer',
          xssProtection: '1; mode=block',
          contentSecurityPolicy: features['csp-header']
            ? {
                'base-uri': "'none'",
                'child-src': "'none'",
                'connect-src': '*',
                'default-src': "'self'",
                'font-src': ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
                'form-action': "'self'",
                'frame-ancestors': "'none'",
                'frame-src': "'none'",
                'img-src': ['*', 'blob:', 'data:'],
                'manifest-src': "'self'",
                'media-src': '*',
                'object-src': "'none'",
                'prefetch-src': '*',
                'script-src': ["'self'", 'https://www.googletagmanager.com', '{{script-src}}'],
                'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
                'worker-src': "'self'",
                reportOnly: false,
              }
            : false,
        }),
      },
    ]
  },
}

function normalizeEnv(env) {
  switch (env) {
    case 'dev':
    case 'development':
      return 'dev'
    case 'sta':
    case 'stag':
    case 'staing':
      return 'stag'
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

// module.exports = withSentryConfig(nextConfig, sentryConfig)
module.exports = nextConfig
