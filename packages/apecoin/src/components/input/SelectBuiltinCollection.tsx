import { compareAddress } from '@x/utils/dist'
import { builtInCollections, CollectionData } from '../../configs'
import Select from './ReactSelect'

const allCollectionOption: CollectionData = { name: 'All Collections' } as any

function SelectBuiltinCollection(value: string | null, onChange: (collectionAddress: string | null) => void) {
  return () => (
    <Select
      options={[allCollectionOption, ...builtInCollections]}
      value={builtInCollections.find(option => compareAddress(value || '', option.address)) || allCollectionOption}
      onChange={option => onChange(option?.address || null)}
      getOptionLabel={option => option.name}
      isClearable
    />
  )
}

export default SelectBuiltinCollection
