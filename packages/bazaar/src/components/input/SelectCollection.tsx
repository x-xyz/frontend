import { useCollectionsQuery } from '@x/apis'
import Select, { Options } from 'components/input/ReactSelect'
import { useMemo } from 'react'
import { ChainId, defaultNetwork, getChainName } from '@x/constants'
import { compareAddress } from '@x/utils'

interface CollectionOption {
  label: string
  value: { chainId: ChainId; contractAddress: string }
}

export interface SelectCollectionProps {
  chainId?: ChainId
  value?: CollectionOption['value']
  onChange?: (value?: CollectionOption['value']) => void
}

export default function SelectCollection({ chainId, value, onChange }: SelectCollectionProps) {
  const { data, isLoading } = useCollectionsQuery({})

  const options = useMemo<Options<CollectionOption>>(
    () =>
      data?.data
        ?.filter(collection => !chainId || collection.chainId === chainId)
        .map(collection => ({
          label: `${getChainName(collection.chainId)} - ${collection.collectionName || 'Nonamed'}`,
          value: {
            chainId: collection.chainId || defaultNetwork,
            contractAddress: collection.erc721Address,
          },
        })) || [],
    [data, chainId],
  )

  return (
    <Select
      value={options.find(
        option =>
          option.value.chainId === value?.chainId &&
          compareAddress(option.value.contractAddress, value.contractAddress),
      )}
      onChange={option => onChange?.(option?.value)}
      options={options}
      getOptionLabel={option => option.label}
      getOptionValue={option => `${option.value.chainId}@${option.value.contractAddress}`}
      isLoading={isLoading}
    />
  )
}
