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

export default function ImageUploader({ image, isLoading, onFileChange, clear, ...props }: ImageUploaderProps) {
  const ref = useRef<HTMLInputElement>(null)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0] && onFileChange) onFileChange(e.target.files?.[0])
  }

  return (
    <Center
      width={{ base: '240px', sm: '300px' }}
      height={{ base: '240px', sm: '300px' }}
      background={`url(${image})`}
      backgroundSize="contain"
      backgroundRepeat="no-repeat"
      backgroundPosition="center center"
      cursor="pointer"
      onClick={() => ref.current?.click()}
      color="divider"
      borderRadius="8px"
      borderColor="divider"
      borderWidth="1px"
      _hover={{ color: 'primary', borderColor: 'primary' }}
      {...props}
    >
      <Input ref={ref} type="file" accept="image/*" onChange={onChange} hidden />
      {isLoading ? (
        <Spinner />
      ) : (
        <Stack alignItems="center">
          <Icon as={GalleryIcon} w={6} h={6} color="inherit" />
          <Text fontSize="sm" color="inherit" background="blackAlpha.400" px={2} textAlign="center">
            Upload Image
          </Text>
        </Stack>
      )}
    </Center>
  )
}
