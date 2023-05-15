/* eslint-disable @typescript-eslint/no-var-requires */
const cp = require('child_process')

const pkgs = [
  '@x/models',
  '@x/abis',
  '@x/utils',
  '@x/constants',
  '@x/apis',
  '@x/web3',
  '@x/store',
  '@x/hooks',
  '@x/components',
]

for (const pkg of pkgs) {
  const out = cp.execSync(`yarn w ${pkg} build`, { encoding: 'utf-8' })
  console.log(out)
}
