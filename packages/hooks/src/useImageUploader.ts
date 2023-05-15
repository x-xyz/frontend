import { useCallback, useEffect, useState } from 'react'

export function useImageUploader(defaultImage?: string) {
  const [file, onFileChange] = useState<File>()

  const [isLoading, setLoading] = useState(false)

  const [image, setImage] = useState<string>()

  const clear = useCallback(() => setImage(undefined), [])

  useEffect(() => {
    if (defaultImage) setImage(defaultImage)
  }, [defaultImage])

  useEffect(() => {
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result?.toString())

      setLoading(false)
    }

    setLoading(true)

    reader.readAsDataURL(file)

    return () => {
      reader.onload = null
    }
  }, [file])

  return { isLoading, image, onFileChange, clear }
}
