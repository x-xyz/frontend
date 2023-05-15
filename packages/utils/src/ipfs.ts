import random from 'lodash/random'
import { Cache } from './cache'

const ipfsGateways = ['https://x-xyz.mypinata.cloud/ipfs', 'https://cloudflare-ipfs.com/ipfs', 'https://ipfs.io/ipfs']

function getGateway(...excludes: string[]) {
  const candidates = ipfsGateways.filter(value => !excludes.includes(value))

  if (candidates.length === 0) return

  return candidates[0]
}

const cache = new Cache<Response>()

export interface FetchIpfsOptions {
  gateway?: string
  excludeGateways?: string[]
}

export async function fetchIpfs(
  cid: string,
  { gateway, excludeGateways = [] }: FetchIpfsOptions = {},
): Promise<Response> {
  const cached = cache.get(cid)

  if (cached) return cached.clone()

  gateway = gateway || getGateway(...excludeGateways)

  if (!gateway) throw new Error('fail to load ipfs data')

  try {
    const resp = await fetch(`${gateway}/${cid}`)

    if (resp.status >= 400) {
      return fetchIpfs(cid, { excludeGateways: [...excludeGateways, gateway] })
    }

    cache.set(cid, resp)

    return resp.clone()
  } catch {
    return fetchIpfs(cid, { excludeGateways: [...excludeGateways, gateway] })
  }
}
