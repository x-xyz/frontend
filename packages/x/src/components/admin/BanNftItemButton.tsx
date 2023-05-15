import { Button, ButtonProps } from '@chakra-ui/button'
import { verifyMessage } from '@ethersproject/wallet'
import { fetchNonce } from '@x/apis/dist/fn'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import useToast from 'hooks/useToast'
import { capitalize } from 'lodash'
import { useState } from 'react'
import { useBanTokenMutation, useUnbanTokenMutation } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { signMessage } from '@x/utils'
import { useMutation } from 'react-query'

export interface BanNftItemButtonProps extends ButtonProps {
  mode: 'ban' | 'unban'
  chainId: ChainId
  contract: string
  tokenId: string | number
}

export default function BanNftItemButton({ mode, chainId, contract, tokenId, ...props }: BanNftItemButtonProps) {
  const toast = useToast({ title: `${capitalize(mode)} NFT Item` })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const [ban] = useBanTokenMutation()

  const [unban] = useUnbanTokenMutation()

  const [isLoading, setLoading] = useState(false)

  async function onClick() {
    if (!account || !library || !authToken) return

    setLoading(true)

    try {
      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const resp =
        mode === 'ban'
          ? await ban({ chainId, contract, tokenId, authToken, signature, signatureAddress })
          : await unban({ chainId, contract, tokenId, authToken, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status !== 'success') throw new Error(`${capitalize(mode)} failed`)

      toast({ status: 'success', description: `${capitalize(mode)} succeeded` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button textTransform="capitalize" onClick={onClick} isLoading={isLoadingAuthToken || isLoading} {...props}>
      {mode}
    </Button>
  )
}
