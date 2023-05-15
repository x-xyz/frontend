export interface ResourceProps<T> {
  value?: T
  isLoading?: boolean
  skeleton?: React.ReactNode
  fallback?: React.ReactNode
  children?: (value: T) => React.ReactNode
}

export function Resource<T>({ value, isLoading, skeleton, fallback, children }: ResourceProps<T>) {
  if (isLoading) return <>{skeleton}</>

  if (!value) return <>{fallback}</>

  if (value && children) return <>{children(value)}</>

  return null
}
