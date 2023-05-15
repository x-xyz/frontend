import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import initializeBasicAuth from 'nextjs-basic-auth'
import merge from 'lodash/merge'
import { appEnv } from '@x/constants'

const basicAuth = initializeBasicAuth({
  users: [{ user: 'bazaar', password: 'domination' }],
})

export interface CreateServerSidePropsGetterOptions {
  requrieAuth?: boolean
}

export default function createServerSidePropsGetter<P = void>(
  override?: GetServerSideProps<P>,
  { requrieAuth }: CreateServerSidePropsGetterOptions = {},
): GetServerSideProps<P> {
  return async ctx => {
    if (appEnv === 'dev' || requrieAuth) basicAuth(ctx.req, ctx.res)

    let result: GetServerSidePropsResult<P> = { props: {} as P }

    if (override) result = merge(result, await override(ctx))

    return result
  }
}
