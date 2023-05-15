import { Button } from '@chakra-ui/button'
import { Divider, Stack, StackProps, Text } from '@chakra-ui/layout'
import { verifyMessage } from '@ethersproject/wallet'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import { useToast } from '@x/hooks'
// import { useNonceMutation } from '@x/apis'
import { useNonceMutation } from '@x/apis'
import { useUnlockableContentMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'

export interface UnlockableContentProps extends StackProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  isOwner?: boolean
}

export default function UnlockableContent({
  chainId,
  contractAddress,
  tokenID,
  isOwner,
  ...props
}: UnlockableContentProps) {
  const toast = useToast({ title: 'Unlockable Content' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [fetchNonce, { isLoading: isLoadingNonce }] = useNonceMutation()

  const [fetchUnlockableContent, { data: unlockableContent, isLoading: isLoadingUnlockableContent }] =
    useUnlockableContentMutation()

  async function onClick() {
    try {
      if (!account) throw new Error('cannot get account')

      if (!library) throw new Error('cannot get library')

      if (!authToken) throw new Error('cannot get auth token')

      const nonceResp = await fetchNonce({ authToken })

      if (isErrorResponse(nonceResp)) throw nonceResp.error

      if (nonceResp.data.status === 'fail') throw new Error('fetch nonce failed')

      const message = makeSignatureMessage(nonceResp.data.data)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      await fetchUnlockableContent({
        chainId,
        contract: contractAddress,
        tokenId: tokenID.toString(),
        signature,
        signatureAddress,
        authToken,
      })

      toast({ status: 'success', description: 'Content unlocked' })
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  }

  const isLoading = isLoadingAuthToken || isLoadingNonce || isLoadingUnlockableContent

  const disabled = isLoading || !account || !library || !authToken

  return (
    <Stack borderWidth="1px" borderColor="primary" borderRadius="10px" p={4} {...props}>
      <Text>This item has unlockable content.</Text>
      {!isOwner && <Text>Only owner can unlock the content.</Text>}
      {isOwner && !unlockableContent && (
        <Button isLoading={isLoading} disabled={disabled} onClick={onClick}>
          Reveal Content
        </Button>
      )}
      {unlockableContent && (
        <>
          <Divider />
          <Text>{unlockableContent.data}</Text>
        </>
      )}
    </Stack>
  )
}
