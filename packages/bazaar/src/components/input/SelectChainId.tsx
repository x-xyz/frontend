import { useCallbackRef } from '@chakra-ui/hooks'
import { Stack, Text } from '@chakra-ui/layout'
import { Radio, RadioGroup, RadioGroupProps } from '@chakra-ui/radio'
import ChainIcon from 'components/ChainIcon'
import { appEnv } from '@x/constants'
import { ChainId, getChain, supportedChainIds } from '@x/constants'
import { useMemo } from 'react'
import { ensureNumber } from '@x/utils'

export interface ChainIdOption {
  value: ChainId
  label: string
}

export interface SelectChainIdProps extends Omit<RadioGroupProps, 'children'> {
  value?: ChainId
  onValueChange?: (value?: ChainId) => void
}

export default function SelectChainId({ onValueChange, value: inputValue, ...props }: SelectChainIdProps) {
  const value = useMemo(() => (inputValue ? inputValue.toString() : '0'), [inputValue])

  const onChange = useCallbackRef(
    (value: string) => {
      const chainId = value !== '0' ? ensureNumber(value) : undefined
      if (onValueChange) chainId ? onValueChange(chainId) : onValueChange()
      if (props.onChange) chainId && props.onChange(chainId.toString())
    },
    [onValueChange, props.onChange],
  )

  function renderOption(chainId: ChainId) {
    const { name, isTestnet } = getChain(chainId)

    if (appEnv === 'prod' && isTestnet) return

    return (
      <Radio key={chainId} value={chainId.toString()}>
        <Stack direction="row" alignItems="center">
          <Stack w="24px" alignItems="center" flexShrink={0}>
            <ChainIcon chainId={chainId} h="24px" />
          </Stack>
          <Text>{name}</Text>
        </Stack>
      </Radio>
    )
  }

  return (
    <RadioGroup {...props} onChange={onChange} value={value}>
      <Stack>
        <Radio value="0">All</Radio>
        {supportedChainIds.map(renderOption)}
      </Stack>
    </RadioGroup>
  )
}
