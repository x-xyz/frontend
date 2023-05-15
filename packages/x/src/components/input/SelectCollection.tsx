import Select, { Options, Props } from 'components/input/ReactSelect'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { fetchCollections } from '@x/apis/fn'
import { ChainId } from '@x/constants'
import { Collection, TokenType } from '@x/models'
import { compareAddress } from '@x/utils'

interface CollectionOption {
  label: string
  value?: { chainId: ChainId; contractAddress: string }
}

export interface SelectCollectionProps extends Omit<Props<CollectionOption, false>, 'value' | 'onChange'> {
  chainId?: ChainId
  value?: CollectionOption['value']
  onChange?: (value?: CollectionOption['value']) => void
  optionWhitelist?: { chainId: ChainId; contract: string }[]
  hideOptionAll?: boolean
  onlyErc721?: boolean
  addOptions?: CollectionOption[]
}

const optionAll: CollectionOption = {
  label: 'All Collections',
}

export default function SelectCollection({
  chainId,
  value,
  onChange,
  optionWhitelist,
  hideOptionAll,
  onlyErc721,
  addOptions,
  ...props
}: SelectCollectionProps) {
  const { data, isLoading } = useQuery(['collections', {}], fetchCollections)

  const options = useMemo<Options<CollectionOption>>(() => {
    if (!data?.items) return []

    let candidates = data.items

    if (chainId) {
      candidates = candidates.filter(c => c.chainId === chainId)
    }

    if (onlyErc721) {
      candidates = candidates.filter(c => c.tokenType === TokenType.Erc721)
    }

    if (optionWhitelist) {
      const m = optionWhitelist.reduce(
        (obj, { chainId, contract }, index) => ({ ...obj, [`${chainId}:${contract}`.toLowerCase()]: index + 1 }),
        {} as Record<string, number>,
      )
      candidates = candidates.filter(c => !!m[toKey(c)]).sort((a, b) => m[toKey(a)] - m[toKey(b)])
    }

    const options: CollectionOption[] = candidates.map(c => ({
      label: c.collectionName || 'Nonamed',
      value: { chainId: c.chainId, contractAddress: c.erc721Address },
    }))

    if (!hideOptionAll) options.unshift(optionAll)

    return [...options, ...(addOptions || [])].sort((a, b) => a.label.localeCompare(b.label))
  }, [data, chainId, optionWhitelist, hideOptionAll, onlyErc721, addOptions])

  const currentOption = useMemo(
    () =>
      value
        ? options.find(
            option =>
              option.value &&
              option.value.chainId === value?.chainId &&
              compareAddress(option.value.contractAddress, value.contractAddress),
          )
        : hideOptionAll
        ? void 0
        : optionAll,
    [value, options, hideOptionAll],
  )

  return (
    <Select
      value={currentOption}
      onChange={option => onChange?.(option?.value)}
      options={options}
      getOptionLabel={option => option.label}
      getOptionValue={option => (option.value ? `${option.value.chainId}:${option.value.contractAddress}` : 'all')}
      isLoading={isLoading}
      {...props}
    />
  )
}

function toKey(c: Collection) {
  return `${c.chainId}:${c.erc721Address}`.toLowerCase()
}
