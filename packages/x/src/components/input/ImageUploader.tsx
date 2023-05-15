import { useRef } from 'react'
import Icon from '@chakra-ui/icon'
import { Input } from '@chakra-ui/input'
import { Center, Stack, Text, CenterProps } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { GalleryIcon } from '@x/components/icons'

export interface ImageUploaderProps extends CenterProps {
  image?: string
  isLoading?: boolean
  onFileChange?: (file: File) => void
  clear?: () => void
}

export default function ImageUploader({
  image,
  isLoading,
  onFileChange,
  // to prevent bypass to native element
  clear, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...props
}: ImageUploaderProps) {
  const ref = useRef<HTMLInputElement>(null)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0] && onFileChange) onFileChange(e.target.files?.[0])
  }

  return (
    <Center
      w={{ base: '240px', sm: '300px' }}
      h={{ base: '240px', sm: '300px' }}
      background={image ? `url(${image})` : 'rgba(46, 47, 67, 0.89)'}
      backgroundSize="contain"
      backgroundRepeat="no-repeat"
      backgroundPosition="center center"
      cursor="pointer"
      onClick={() => ref.current?.click()}
      color="rgba(255, 255, 255, 0.44)"
      borderRadius="12px"
      border={image ? 'none' : '7px dashed #E5E5E5'}
      _hover={{ color: 'primary', borderColor: 'primary' }}
      {...props}
    >
      <Input ref={ref} type="file" accept="image/*" onChange={onChange} hidden />
      {isLoading && <Spinner />}
      {!isLoading && !image && (
        <Stack alignItems="center">
          <Icon as={GalleryIcon} w={6} h={6} color="inherit" />
          <Text fontSize="2xl" color="currentcolor" px={2} textAlign="center">
            Add Image
          </Text>
        </Stack>
      )}
    </Center>
  )
}
