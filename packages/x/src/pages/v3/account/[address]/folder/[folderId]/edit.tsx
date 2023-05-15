import ManageFolderLogic, { FormData } from 'components/account/v3/ManageFolderLogic'
import Layout from 'components/Layout/v3'
import { isFeatureEnabled } from 'flags'
import useToast from 'hooks/useToast'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Button, Center, Container, Heading } from '@chakra-ui/react'
import {
  deleteAccountFolder,
  fetchAccountFolder,
  fetchAccountFolderNfts,
  fetchAccountV2,
  fetchNonce,
  updateAccountFolder,
  markTokenPrivate,
} from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account, Folder, NftItem, NftItemId } from '@x/models'
import { call, getFirst, isAddress, signMessage, compareAddress } from '@x/utils'
import { handleError, makeSignatureMessage } from '@x/web3'

const breakpoint = 'lg'
interface Props {
  account: Account
  folder: Folder
  folderNfts: NftItem[]
}

const isThisNft = (a: NftItemId) => (b: NftItemId) =>
  a.chainId === b.chainId && compareAddress(a.contractAddress, b.contractAddress) && a.tokenId === b.tokenId

const toNftItemId = ({ chainId, contractAddress, tokenId }: NftItem): NftItemId => ({
  chainId,
  contractAddress,
  tokenId,
})

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async (ctx, authToken) => {
    if (!authToken) return { notFound: true }

    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }

    const folderId = getFirst(ctx.params?.folderId)
    if (typeof folderId !== 'string') return { notFound: true }

    try {
      const [account, folder, folderNfts] = await Promise.all([
        call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }), {
          maxAttempt: 5,
          timeout: i => i * 300,
        }),
        call(() => fetchAccountFolder({ queryKey: ['account-folder', address, folderId, { authToken }], meta: {} }), {
          maxAttempt: 5,
          timeout: i => i * 300,
        }),
        call(
          () =>
            fetchAccountFolderNfts({ queryKey: ['account-folder-nfts', address, folderId, { authToken }], meta: {} }),
          { maxAttempt: 5, timeout: i => i * 300 },
        ),
      ])
      return { props: { account, folder, folderNfts } }
    } catch (error) {
      console.error(error)
      return { notFound: true }
    }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountFolderEdit({ account, folder, folderNfts }: Props) {
  const { push } = useRouter()

  const toast = useToast({ title: 'Update Folder' }, true)

  const { library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const editMutation = useMutation(updateAccountFolder, {
    onSuccess: () => push(`/account/${account.address}/folder/${folder.id}`),
  })

  const deleteMutation = useMutation(deleteAccountFolder, {
    onSuccess: () => push(`/account/${account.address}`),
  })

  const markTokenPrivateMutation = useMutation(markTokenPrivate, {
    onSuccess: () => push(`/account/${account.address}/folder/${folder.id}`),
  })

  const isBuiltInPrivateFolder = folder.isBuiltIn && folder.isPrivate

  async function submit(data: FormData) {
    try {
      if (!library) throw new Error('not found connected wallet')
      const nonce = await nonceMutation.mutateAsync(authToken)
      const message = makeSignatureMessage(nonce)
      const signature = await signMessage(library.getSigner(), account.address, message)
      if (isBuiltInPrivateFolder) {
        const marks = data.nfts.filter(nft => !folderNfts.some(isThisNft(nft)))
        const unmarks = folderNfts.filter(nft => !data.nfts.some(isThisNft(nft))).map(toNftItemId)
        await markTokenPrivateMutation.mutateAsync({ queryKey: [authToken, { marks, unmarks, signature }], meta: {} })
      } else {
        await editMutation.mutateAsync({
          queryKey: [authToken, account.address, folder.id, { ...data, signature }],
          meta: {},
        })
      }
      toast({ status: 'success', description: 'Folder updated' })
    } catch (error) {
      handleError(error, { toast })
      throw error
    }
  }

  async function deleteFolder() {
    try {
      if (!library) throw new Error('not found connected wallet')
      const nonce = await nonceMutation.mutateAsync(authToken)
      const message = makeSignatureMessage(nonce)
      const signature = await signMessage(library.getSigner(), account.address, message)
      await deleteMutation.mutateAsync({
        queryKey: [account.address, folder.id, { authToken, signature }],
        meta: {},
      })
      toast({ status: 'success', description: 'Folder deleted' })
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
      <ManageFolderLogic
        account={account}
        folder={folder}
        folderNfts={folderNfts}
        submit={submit}
        submitLabel="Save & Exit"
        actions={
          !folder.isBuiltIn && (
            <Button
              color="danger"
              onClick={deleteFolder}
              disabled={deleteMutation.isLoading}
              isLoading={deleteMutation.isLoading}
            >
              Delete Folder
            </Button>
          )
        }
      />
    </Layout>
  )
}
