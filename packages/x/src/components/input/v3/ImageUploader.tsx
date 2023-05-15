import { useRef } from 'react'
import { Input } from '@chakra-ui/input'
import { Center, Text, CenterProps } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'

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
      background={`url(${image})`}
      backgroundSize="contain"
      backgroundRepeat="no-repeat"
      backgroundPosition="center center"
      cursor="pointer"
      onClick={() => ref.current?.click()}
      color="primary"
      border="1px solid"
      borderColor="divider"
      {...props}
    >
      <Input ref={ref} type="file" accept="image/*" onChange={onChange} hidden />
      {isLoading && <Spinner />}
      {!isLoading && !image && (
        <Text fontWeight="extrabold" color="currentcolor" textAlign="center">
          Upload Image
        </Text>
      )}
    </Center>
  )
}
