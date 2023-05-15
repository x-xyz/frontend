import { useCollectionsQuery } from '@x/apis'
import Select, { Options } from 'components/input/ReactSelect'
import { useMemo } from 'react'
import { ChainId } from '@x/constants'
import { useQuery } from 'react-query'
import { fetchCollections } from '@x/apis/fn'

interface CollectionOption {
  label: string
  value: string
}

export interface SelectCollectionProps {
  chainId?: ChainId
  value?: string[]
  onChange?: (value: string[]) => void
  optionWhitelist?: { chainId: ChainId; contract: string }[]
}

export default function SelectCollections({ chainId, value = [], onChange, optionWhitelist }: SelectCollectionProps) {
  const { data, isLoading } = useQuery(['collections', { chainId, yugaLab: true }], fetchCollections)

  const options = useMemo<Options<CollectionOption>>(() => {
    if (!data) return []

    let candidates = data.items

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
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data, optionWhitelist])

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
