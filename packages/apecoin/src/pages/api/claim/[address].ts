import { NextApiHandler } from 'next'
import treasuryClaims from './treasuryClaims.json'
import receiversMap from './receiversMap.json'
import { getAddress } from '@ethersproject/address'

const handler: NextApiHandler = async (req, res) => {
  if (typeof req.query.address !== 'string') {
    res.status(400).json({ messageg: 'invalid address' })
    return
  }

  let address: string

  try {
    address = getAddress(req.query.address)
  } catch {
    res.status(400).json({ messageg: 'invalid address' })
    return
  }

  const claimData = (treasuryClaims as any).claims[address]

  const receiveData = (receiversMap as any).receivers[address]

  console.log({ address, receiveData, claimData })

  if (!claimData && !receiveData) {
    res.status(404).end()
    return
  }

  if (claimData) {
    res.status(200).json({ action: 'claim', ...claimData })
    return
  }

  if (receiveData) {
    res.status(200).json({ action: 'airdrop', ...receiveData })
    return
  }
}

export default handler
