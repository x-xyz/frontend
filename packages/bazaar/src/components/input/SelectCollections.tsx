import { useCollectionsQuery } from '@x/apis'
import Select, { Options } from 'components/input/ReactSelect'
import { useMemo } from 'react'
import { ChainId } from '@x/constants'

interface CollectionOption {
  label: string
  value: string
}

export interface SelectCollectionProps {
  chainId?: ChainId
  value?: string[]
  onChange?: (value: string[]) => void
}

export default function SelectCollections({ chainId, value = [], onChange }: SelectCollectionProps) {
  const { data, isLoading } = useCollectionsQuery({})

  const options = useMemo<Options<CollectionOption>>(
    () =>
      data?.data
        ?.filter(collection => !chainId || collection.chainId === chainId)
        .map(collection => ({
          value: collection.erc721Address,
          label: collection.collectionName || 'Nonamed',
        })) || [],
    [data, chainId],
  )

  return (
    <Select
      closeMenuOnSelect={false}
      isMulti
      value={options.filter(option => value.includes(option.value))}
      onChange={value => onChange?.(value.map(option => option.value))}
      options={options}
      getOptionValue={option => option.value}
      getOptionLabel={option => option.label}
      isLoading={isLoading}
    />
  )
}
