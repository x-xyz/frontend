const data = require('./receiversMap.json')
const { formatUnits } = require('@ethersproject/units')

const addresses = Object.keys(data.receivers)

let l = []

for (const address of addresses) {
  l.push(parseFloat(formatUnits(data.receivers[address].hex)))
}
l.sort((a, b) => a - b)
console.log(l.join('\n'))
