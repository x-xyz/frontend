import ManageFolderLogic, { FormData } from 'components/account/v3/ManageFolderLogic'
import Layout from 'components/Layout/v3'
import { isFeatureEnabled } from 'flags'
import useToast from 'hooks/useToast'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center, Container, Heading } from '@chakra-ui/react'
import { createAccountFolder, fetchAccount, fetchNonce } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account } from '@x/models'
import { call, getFirst, isAddress, isErrorResponse, signMessage } from '@x/utils'
import { handleError, makeSignatureMessage } from '@x/web3'

const breakpoint = 'lg'
interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async (ctx, authToken) => {
    if (!authToken) return { notFound: true }
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const resp = await call(() => fetchAccount(address), { maxAttempt: 5, timeout: i => i * 300 })
    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
    return { props: { account: resp.data } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountFolderCreate({ account }: Props) {
  const { replace } = useRouter()

  const toast = useToast({ title: 'Create Folder' }, true)

  const { library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const createMutation = useMutation(createAccountFolder, {
    onSuccess: data => replace(`/account/${account.address}/folder/${data.folderId}`),
  })

  async function submit(data: FormData) {
    try {
      if (!library) throw new Error('not found connected wallet')
      const nonce = await nonceMutation.mutateAsync(authToken)
      const message = makeSignatureMessage(nonce)
      const signature = await signMessage(library.getSigner(), account.address, message)
      await createMutation.mutateAsync({ queryKey: [authToken, account.address, { ...data, signature }], meta: {} })
      toast({ status: 'success', description: 'Folder created' })
    } catch (error) {
      handleError(error, { toast })
      throw error
    }
  }

  return (
    <Layout>
      <Center
        bgImg={{
          base: 'url(/assets/v3/mobile_folder_custom_2560x120_bg.jpg)',
          md: 'url(/assets/v3/folder_custom_2560x120_bg.jpg)',
        }}
        bgSize="auto 100%"
        bgRepeat="no-repeat"
        bgPos="center"
        h="120px"
        borderBottomWidth="1px"
        borderColor="divider"
        alignItems="flex-end"
        pb={3}
      >
        <Container maxW="container.xl">
          <Heading textAlign={{ base: 'center', [breakpoint]: 'unset' }}>Folder Customization</Heading>
        </Container>
      </Center>
      <ManageFolderLogic account={account} submit={submit} submitLabel="Create" />
    </Layout>
  )
}
