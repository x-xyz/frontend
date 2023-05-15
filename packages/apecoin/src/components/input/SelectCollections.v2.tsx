import { builtInCollections, CollectionData } from 'configs'

import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  Button,
  Checkbox,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useControllableState,
} from '@chakra-ui/react'

export interface SelectCollectionsProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
}

export default function SelectCollections({ value = [], onValueChange }: SelectCollectionsProps) {
  const [state, setState] = useControllableState({ value, onChange: onValueChange })

  function toggle(value: string) {
    setState(prev => {
      if (!prev.includes(value)) return [...prev, value]
      const index = prev.indexOf(value)
      return [...prev.slice(0, index), ...prev.slice(index + 1)]
    })
  }

  function renderOption({ address, name }: CollectionData) {
    return (
      <Button
        key={address}
        variant="unstyled"
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          toggle(address)
        }}
      >
        <Stack
          direction="row"
          justify="space-between"
          align="center"
          h="40px"
          borderColor="#575757"
          borderBottomWidth="1px"
          px="16px"
        >
          <Text maxW="240px" textOverflow="ellipsis" overflow="hidden">
            {name}
          </Text>
          <Checkbox isChecked={state.includes(address)} readOnly />
        </Stack>
      </Button>
    )
  }

  function renderSelectedNames() {
    return value.map(val => builtInCollections.find(bic => bic.address === val)?.name).join(',')
  }

  return (
    <Popover placement="bottom" lazyBehavior="unmount" isLazy>
      <PopoverTrigger>
        <Stack direction="row" h="40px" justify="space-between" align="center" px={3} bg="panel" color="#fff">
          <Text whiteSpace="nowrap" maxW="200px" overflow="hidden" textOverflow="ellipsis">
            {value.length > 0 ? renderSelectedNames() : 'All Collections'}
          </Text>
          <TriangleDownIcon w={2.5} />
        </Stack>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody p={0} maxH="400px" overflowY="auto">
          <Stack spacing={0}>{builtInCollections.map(renderOption)}</Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
