import AccountLayout from 'components/account/v4/AccountLayout'
import FolderCard from 'components/account/v4/FolderCard'
import Link from 'components/Link'
import { isFeatureEnabled } from 'flags'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Button, Flex } from '@chakra-ui/react'
import { fetchAccount, fetchAccountFolders } from '@x/apis/fn'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { Account } from '@x/models'
import { call, compareAddress, getFirst, isAddress, isErrorResponse } from '@x/utils'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const resp = await call(() => fetchAccount(address), { maxAttempt: 5, timeout: i => i * 300 })
    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
    return { props: { account: resp.data } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

export default function AccountPortfolio({ account }: Props) {
  const [authToken] = useAuthToken()
  const { account: currentAccount } = useActiveWeb3React()
  const { data: folders = [] } = useQuery(['accountFolders', account.address, { authToken }], fetchAccountFolders)
  const builtInPublic = useMemo(() => folders.find(folder => folder.isBuiltIn && !folder.isPrivate), [folders])
  const buildInPrivate = useMemo(() => folders.find(folder => folder.isBuiltIn && folder.isPrivate), [folders])
  const customFolders = useMemo(() => folders.filter(folder => !folder.isBuiltIn), [folders])

  return (
    <AccountLayout account={account}>
      {compareAddress(account.address, currentAccount) && (
        <Link href={`/account/${account.address}/create-folder`}>
          <Button>Create Custom Folder</Button>
        </Link>
      )}
      <Flex wrap="wrap" sx={{ '&>*': { m: '1px' } }} mt={5}>
        {builtInPublic && (
          <FolderCard
            owner={account.address}
            folder={builtInPublic}
            folderTitle="Public NFTs"
            folderSubtitle="View all individual NFTs"
          />
        )}
        {buildInPrivate && (
          <FolderCard
            owner={account.address}
            folder={buildInPrivate}
            folderTitle="Private NFTs"
            folderSubtitle="Select & manage which NFTs to make private"
            isOwner={compareAddress(account.address, currentAccount)}
          />
        )}
        {customFolders.map(folder => (
          <FolderCard
            owner={account.address}
            key={folder.id}
            folder={folder}
            isOwner={compareAddress(account.address, currentAccount)}
          />
        ))}
      </Flex>
    </AccountLayout>
  )
}
