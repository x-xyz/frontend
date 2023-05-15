import { GetServerSideProps, GetServerSidePropsResult, GetServerSidePropsContext } from 'next'
import initializeBasicAuth from 'nextjs-basic-auth'
import merge from 'lodash/merge'
import { appEnv } from '@x/constants'
import { ParsedUrlQuery } from 'querystring'

const basicAuth = initializeBasicAuth({
  users: [{ user: 'x', password: 'tothemoon' }],
})

export interface CreateServerSidePropsGetterOptions {
  requrieAuth?: boolean
}

type GetServerSidePropsEx<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
> = (context: GetServerSidePropsContext<Q>, authToken?: string) => Promise<GetServerSidePropsResult<P>>

export default function createServerSidePropsGetter<P = void>(
  override?: GetServerSidePropsEx<P> | null,
  { requrieAuth }: CreateServerSidePropsGetterOptions = {},
): GetServerSideProps<P> {
  return async ctx => {
    if (appEnv !== 'prod' || requrieAuth) basicAuth(ctx.req, ctx.res)

    let result: GetServerSidePropsResult<P> = { props: {} as P }

    const authToken = ctx.req.cookies['auth-token']

    if (override) result = merge(result, await override(ctx, authToken))

    return result
  }
}
