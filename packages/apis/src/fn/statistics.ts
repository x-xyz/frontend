import { goapiUrl } from '@x/constants'
import { ResponseOf } from '@x/models'

import { checkResponse } from '../utils'

export async function fetchApecoinBurned() {
  const url = `${goapiUrl}/statistics/apeburned`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<{ apeburned: number }> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}
