import { fetchTokens } from '@x/apis/fn'
import { ChainId, NftItem } from '@x/models'
import { useQuery } from 'react-query'
import Select from 'components/input/ReactSelect'
import SimpleNftCard from 'components/token/SimpleNftCard'

export interface SelectNftProps {
  chainId?: ChainId
  collections?: string[]
  belongsTo?: string
  value?: readonly NftItem[]
  onValueChange?: (value: readonly NftItem[]) => void
  disabled?: boolean
}

export default function SelectNft({ chainId, collections, belongsTo, value, onValueChange, disabled }: SelectNftProps) {
  const { data, isLoading } = useQuery(['tokens', { chainId, collections, belongsTo }], fetchTokens, {
    enabled: !disabled,
  })

  return (
    <Select
      isMulti
      hideSelectedOptions
      options={data?.data.items || []}
      value={value}
      onChange={onValueChange}
      isLoading={isLoading}
      formatOptionLabel={option => (
        <SimpleNftCard item={option} imageSize="40px" w="full" h="64px" border="none" hidePrice />
      )}
      getOptionLabel={option => `${option.chainId}:${option.contractAddress}:${option.tokenId}`}
      getOptionValue={option => `${option.chainId}:${option.contractAddress}:${option.tokenId}`}
      isDisabled={disabled}
    />
  )
}
