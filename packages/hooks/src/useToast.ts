import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/toast'
import { useRef } from 'react'

export type { UseToastOptions } from '@chakra-ui/toast'

export type useBaseToast = ReturnType<typeof useToast>

export function useToast(options: UseToastOptions = {}) {
  const optionsRef = useRef<UseToastOptions>({ position: 'top-right', isClosable: true, ...options })
  return useChakraToast(optionsRef.current)
}
