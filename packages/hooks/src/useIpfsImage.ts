import { useEffect, useState } from 'react'
import { fetchImageFromIpfs } from '@x/utils'

export function useIpfsImage(cid?: string) {
  const [data, setData] = useState<string>()

  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (!cid) {
      setData(void 0)
      return
    }

    setLoading(true)

    let stale = false

    fetchImageFromIpfs(cid)
      .then(data => {
        if (!stale) setData(data)
      })
      .catch()
      .then(() => {
        if (!stale) setLoading(false)
      })

    return () => {
      stale = true
    }
  }, [cid])

  return [data, isLoading] as const
}
