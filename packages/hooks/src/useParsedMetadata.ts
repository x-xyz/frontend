import fetchJsonp from 'fetch-jsonp'
import { useEffect, useState } from 'react'

export interface ParsedMetadata {
  name: string
  description?: string
  image: string
  attributes?: { trait_type: string; value: string }[]
  properties?: Record<string, unknown>
  external_url?: string
}

export function useParsedMetadata(uri?: string): [ParsedMetadata | undefined, boolean] {
  const [parsedMetadata, setParsedMetadata] = useState<ParsedMetadata>()

  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (!uri) {
      setParsedMetadata(void 0)
      return
    }

    setLoading(true)

    const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

    if (base64Regex.test(uri)) {
      try {
        setParsedMetadata(JSON.parse(atob(uri)))
      } catch (error) {
        console.error('parse data failed', error)
      } finally {
        setLoading(false)
      }
    } else {
      let stale = false

      fetch(uri)
        .catch(() => fetchJsonp(uri))
        .then(resp => resp.json())
        .then(data => {
          if (!stale) setParsedMetadata(data)
        })
        .catch(console.error)
        .then(() => {
          if (!stale) setLoading(false)
        })

      return () => {
        stale = false
      }
    }
  }, [uri])

  return [parsedMetadata, isLoading]
}
