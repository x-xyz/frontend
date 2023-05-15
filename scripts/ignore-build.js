/* eslint-disable @typescript-eslint/no-var-requires */
const cp = require('child_process')
const path = require('path')

const [, , ...ignorePkgs] = process.argv

const cwd = path.resolve(__dirname, '../')

const files = cp.execSync('git diff --name-only HEAD^ HEAD ./packages', { encoding: 'utf-8', cwd })

const changedPkgs = [...new Set(files.split('\n').map(parsePkg).filter(Boolean))]

const shouldIgnore = changedPkgs.every(pkg => ignorePkgs.includes(pkg))

console.log('shouldIgnore', shouldIgnore)

process.exit(shouldIgnore ? 0 : 1)

function parsePkg(file) {
  const [, pkgName] = /^packages\/([^/]+)/.exec(file) || []
  return pkgName
}
