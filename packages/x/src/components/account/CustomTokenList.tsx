import { Button } from '@chakra-ui/button'
import { FormControl, FormErrorMessage } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Center, Divider, List, ListItem, ListProps, Stack, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { chakra } from '@chakra-ui/system'
import { verifyMessage } from '@ethersproject/wallet'
import { fetchNonce } from '@x/apis/dist/fn'
import Address from 'components/Address'
import { useActiveWeb3React } from '@x/hooks'
import { useAuthToken } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLazyAccountQuery } from '@x/apis'
import { handleError, makeSignatureMessage } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { isAddress, signMessage } from '@x/utils'
import { useMutation } from 'react-query'

export type CustomTokenListProps = ListProps

export default function CustomTokenList(props: CustomTokenListProps) {
  const toast = useToast({ title: 'Custom Token List' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [fetch, { data, isLoading }] = useLazyAccountQuery()

  const nonceMutation = useMutation(fetchNonce)

  // const [addCustomToken] = useAddCustomTokenMutation()

  // const [removeCustomToken, { isLoading: isRemoving }] = useRemoveCustomTokenMutation()

  const [customTokens, setCustomTokens] = useState<string[]>([])

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting: isAdding, errors },
  } = useForm({ mode: 'onChange', defaultValues: { address: '' } })

  const searchAddress = watch('address')

  useEffect(() => {
    if (account) fetch({ address: account })
  }, [account, fetch])

  useEffect(() => {
    if (data?.data?.customTokens) setCustomTokens(data?.data?.customTokens)
  }, [data])

  async function remove(address: string) {
    if (!account || !authToken || !library) return

    try {
      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      // const removeResp = await removeCustomToken({ address, authToken, signature, signatureAddress })

      // if (isErrorResponse(removeResp)) throw removeResp.error

      // if (removeResp.data.status !== 'success') throw new Error('Remove custom token failed')

      // toast({ status: 'success', description: 'Custom token removed' })
    } catch (error) {
      handleError(error, { toast })
    }
  }

  const onSubmit = handleSubmit(async ({ address }) => {
    if (!account || !authToken || !library) return

    try {
      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      // const addResp = await addCustomToken({ address, authToken, signature, signatureAddress })

      // if (isErrorResponse(addResp)) throw addResp.error

      // if (addResp.data.status !== 'success') throw new Error('Add custom token failed')

      // toast({ status: 'success', description: 'Custom token added' })

      reset({ address: '' })

      setCustomTokens(prev => [address, ...prev])
    } catch (error) {
      handleError(error, { toast })
    }
  })

  return (
    <List {...props}>
      {isLoading && (
        <ListItem>
          <SkeletonText noOfLines={1} />
        </ListItem>
      )}
      {!isLoading && (
        <ListItem>
          <chakra.form onSubmit={onSubmit}>
            <FormControl isInvalid={!!errors.address}>
              <Stack direction="row" alignItems="center">
                <Input
                  {...register('address', {
                    validate: value => {
                      if (!isAddress(value)) return 'Invalid address'
                      if (customTokens.includes(value)) return 'Repeated address'
                    },
                  })}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  isLoading={isLoading || isLoadingAuthToken || isAdding}
                  disabled={!isDirty || !isValid || isLoading || isLoadingAuthToken || isAdding}
                >
                  +
                </Button>
              </Stack>
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>
          </chakra.form>
        </ListItem>
      )}
      <Divider orientation="horizontal" my={4} />
      {!isLoading && customTokens.length === 0 && (
        <ListItem>
          <Center w="100%">No custom tokens</Center>
        </ListItem>
      )}
      {customTokens
        .filter(customToken => customToken.includes(searchAddress))
        .map(customToken => (
          <ListItem key={customToken} mb={2}>
            <Stack direction="row" alignItems="center">
              <Text flexGrow={1}>
                <Address type="address">{customToken}</Address>
              </Text>
              <Button
                size="sm"
                variant="outline"
                color="danger"
                onClick={() => remove(customToken)}
                isLoading={
                  isLoading || isLoadingAuthToken
                  // || isRemoving
                }
                disabled={
                  isLoading || isLoadingAuthToken
                  // || isRemoving
                }
              >
                -
              </Button>
            </Stack>
          </ListItem>
        ))}
    </List>
  )
}
