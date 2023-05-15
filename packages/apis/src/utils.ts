export type Header = Record<string, string>

export function makeAuthHeader(authToken?: string, header: Header = {}): Header {
  const next = { ...header }
  if (authToken) next.Authorization = `Bearer ${authToken}`
  return next
}

export function makeQueryArray<T>(name: string, value: T[]) {
  return value.length > 0 ? value.map(v => `${name}=${v}`).join('&') : ''
}

export function concatQueries(...queries: (string | undefined)[]) {
  return queries.filter(Boolean).join('&')
}

export function makeQuery(obj: any) {
  return concatQueries(
    ...Object.keys(obj).reduce((queries, key) => {
      const value = obj[key]
      let query: string | undefined
      if (Array.isArray(value)) query = makeQueryArray(key, value)
      else if (typeof value !== 'undefined') query = `${key}=${value}`
      return [...queries, query]
    }, [] as (string | undefined)[]),
  )
}

export async function checkResponse(resp: Response) {
  if (resp.status >= 400) {
    const data = await resp.text()
    throw new Error(data)
  }
}
