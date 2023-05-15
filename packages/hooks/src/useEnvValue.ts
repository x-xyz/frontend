import { Env, appEnv, validEnvs } from '@x/constants'
import { getFirst } from '@x/utils'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export function useEnvValue<T>(value: Record<Env, T>) {
  const { query } = useRouter()

  const queryEnv = getFirst(query.env)

  const env = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (validEnvs.includes(queryEnv as any)) return queryEnv as Env
    return appEnv
  }, [queryEnv])

  return value[env]
}
