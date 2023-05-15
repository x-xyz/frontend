import { Button } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import AccountLayout from 'components/account/AccountLayout'
import CustomTokenModal from 'components/account/CustomTokenModal'
import Layout from 'components/Layout'
import NftCardPage from 'components/token/NftCardPage'
import { useActiveWeb3React } from '@x/hooks'
import { useFetchTokens, FetchTokensProvider, parseFetchTokensParamsFromQuery } from '@x/hooks'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getFirst, isErrorResponse } from '@x/utils'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { compareAddress } from '@x/utils'
import { defaultNetwork } from '@x/constants'
import { fetchAccount } from '@x/apis/fn'
import { Account } from '@x/models'
import HeadMeta from 'components/HeadMeta'

interface Props {
  address: string
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.query.address)

    if (!address) return { notFound: true }

    const resp = await fetchAccount(address)

    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }

    return { props: { address, account: resp.data } }
  },
  { requrieAuth: true },
)

export default function Index({ address, account: pageAccount }: Props) {
  const { query } = useRouter()

  const { account } = useActiveWeb3React()

  const isMe = compareAddress(account, address)

  const fetchTokensParams = useFetchTokens({
    defaultValue: { ...parseFetchTokensParamsFromQuery(query), address, sortBy: 'createdAt', chainId: defaultNetwork },
    id: 'account',
  })

  // useFetchTokensParamsQuery(fetchTokensParams, { shouldReplace: query => keys(omit(query, 'address')).length === 0 })

  const { setAddress } = fetchTokensParams

  useEffect(() => {
    setAddress(address)
  }, [address, setAddress])

  const customTokenModal = useDisclosure()

  return (
    <Layout>
      <HeadMeta subtitle={pageAccount.alias || address} description={pageAccount.bio} />
      <AccountLayout address={address}>
        <FetchTokensProvider value={fetchTokensParams} id="account">
          <NftCardPage
            afterSortBy={
              isMe && (
                <Button variant="outline" size="sm" onClick={customTokenModal.onOpen}>
                  Custom Tokens
                </Button>
              )
            }
          />
        </FetchTokensProvider>
        <CustomTokenModal isOpen={customTokenModal.isOpen} onClose={customTokenModal.onClose} />
      </AccountLayout>
    </Layout>
  )
}
