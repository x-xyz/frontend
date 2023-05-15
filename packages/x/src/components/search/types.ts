export interface Option {
  key: string
  label: React.ReactNode
  url: string
  icon?: string
  labelRight?: React.ReactNode
}

export interface Group {
  label: string
  options?: Option[]
  titleRight?: React.ReactNode
}

export interface FormData {
  keyword: string
}
