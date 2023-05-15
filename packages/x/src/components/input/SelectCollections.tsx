import { useCollectionsQuery } from '@x/apis'
import Select, { Options } from 'components/input/ReactSelect'
import { useMemo } from 'react'
import { ChainId } from '@x/constants'

interface CollectionOption {
  label: string
  value: string
  chainId: ChainId
}

export interface SelectCollectionProps {
  chainId?: ChainId
  value?: string[]
  onChange?: (value: string[]) => void
  onValueChange?: (value: { chainId: ChainId; address: string }[]) => void
  optionWhitelist?: { chainId: ChainId; contract: string }[]
}

export default function SelectCollections({
  chainId,
  value = [],
  onChange,
  onValueChange,
  optionWhitelist,
}: SelectCollectionProps) {
  const { data, isLoading } = useCollectionsQuery({})

  const options = useMemo<Options<CollectionOption>>(() => {
    if (!data?.data) return []

    let candidates = data.data

    if (chainId) {
      candidates = candidates.filter(c => c.chainId === chainId)
    }

    if (optionWhitelist) {
      const m: Record<string, boolean> = {}
      for (const { chainId, contract } of optionWhitelist) {
        const key = `${chainId}:${contract}`.toLowerCase()
        m[key] = true
      }
      candidates = candidates.filter(c => m[`${c.chainId}:${c.erc721Address}`.toLowerCase()])
    }

    return candidates
      .map(collection => ({
        value: collection.erc721Address,
        label: collection.collectionName || 'Nonamed',
        chainId: collection.chainId,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data, chainId, optionWhitelist])

  return (
    <Select
      closeMenuOnSelect={false}
      isMulti
      value={options.filter(option => value.includes(option.value))}
      onChange={value => {
        onChange?.(value.map(option => option.value))
        onValueChange?.(value.map(({ chainId, value }) => ({ chainId, address: value })))
      }}
      options={options}
      getOptionValue={option => option.value}
      getOptionLabel={option => option.label}
      isLoading={isLoading}
    />
  )
}
