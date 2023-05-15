import { fetchNonce } from '@x/apis/fn'
import { forwardRef, useEffect, useState } from 'react'
import { Button } from '@chakra-ui/button'
import { Box, BoxProps, Stack } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import SelectFileButton from 'components/input/SelectFileButton'
import { useAuthToken } from '@x/hooks'
import { useImageUploader } from '@x/hooks'
import useToast from 'hooks/useToast'
// import { useUploadBannerMutation } from '@x/apis'
import { useUpdateBannerMutation } from '@x/apis'
import { handleError } from '@x/web3'
import { isErrorResponse } from '@x/utils'
import { useIpfsImage } from '@x/hooks'
import { useActiveWeb3React } from '@x/hooks'
import { signMessage } from '@x/utils'
import { verifyMessage } from '@ethersproject/wallet'
import { makeSignatureMessage } from '@x/web3/src'
import { useMutation } from 'react-query'

export interface AccountBannerProps extends BoxProps {
  bannerHash?: string
  isLoading?: boolean
  isEditable?: boolean
}

function AccountBanner(
  { bannerHash, isLoading, isEditable, ...props }: AccountBannerProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const toast = useToast({ title: 'Banner' })

  const { account, library } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const nonceMutation = useMutation(fetchNonce)

  const [imageCid, setImageCid] = useState(bannerHash)

  useEffect(() => setImageCid(bannerHash), [bannerHash])

  const [imageData] = useIpfsImage(imageCid)

  const { image, isLoading: isLoadingImage, onFileChange, clear } = useImageUploader()

  const [uploadBanner, { isLoading: isUploading }] = useUpdateBannerMutation()

  async function onSave() {
    if (!authToken) return

    if (!image) return

    try {
      if (!account || !library) throw new Error('cannot get account')

      const nonce = await nonceMutation.mutateAsync(authToken)

      const message = makeSignatureMessage(nonce)

      const signature = await signMessage(library.getSigner(), account, message)

      const signatureAddress = verifyMessage(message, signature)

      const resp = await uploadBanner({ authToken, imgData: image, signature, signatureAddress })

      if (isErrorResponse(resp)) throw resp.error

      if (resp.data.status === 'fail') throw new Error('Upload banner failed')

      setImageCid(resp.data.data)

      clear()
    } catch (error) {
      handleError(error, { toast })

      throw error
    }
  }

  const isProcessing = isLoadingAuthToken || isLoadingImage || isUploading

  return (
    <Skeleton isLoaded={!isLoading} maxW="600px" w="100%" h="400px" borderRadius="10px" ref={ref}>
      <Box
        w="100%"
        h="100%"
        bg={`url(${image || imageData}), url(/assets/account-banner.png)`}
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundPosition="center center"
        position="relative"
        borderRadius="10px"
        sx={{
          WebkitBoxReflect:
            'below 0px linear-gradient(to bottom, rgba(0,0,0,0) 80%, rgba(0,0,0,0.2) 100%, rgba(0,0,0.3) 140%)',
        }}
        {...props}
      >
        <Stack direction="row" justifyContent="center" w="100%" position="absolute" left={0} bottom={-14}>
          {isEditable && (
            <SelectFileButton variant="outline" isLoading={isProcessing} onFileChange={onFileChange}>
              Change Banner
            </SelectFileButton>
          )}
          {image && (
            <Button variant="outline" onClick={clear} isLoading={isProcessing}>
              Cancel
            </Button>
          )}
          {image && (
            <Button onClick={onSave} isLoading={isProcessing}>
              Save
            </Button>
          )}
        </Stack>
      </Box>
    </Skeleton>
  )
}

export default forwardRef(AccountBanner)
