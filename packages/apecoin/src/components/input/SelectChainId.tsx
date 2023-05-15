import { useCallbackRef } from '@chakra-ui/hooks'
import { Stack, Text } from '@chakra-ui/layout'
import { Radio, RadioGroup, RadioGroupProps } from '@chakra-ui/radio'
import ChainIcon from 'components/icons/ChainIcon'
import { appEnv } from '@x/constants'
import { ChainId, getChain, supportedChainIds } from '@x/constants'
import { useMemo } from 'react'
import { ensureNumber } from '@x/utils'
import { Image } from '@chakra-ui/react'

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
          <ChainIcon chainId={chainId} w="30px" h="30px" flexShrink={0} />
          <Text fontSize="sm" variant="emphasis">
            {name}
          </Text>
        </Stack>
      </Radio>
    )
  }

  return (
    <RadioGroup {...props} onChange={onChange} value={value}>
      <Stack>
        <Radio value="0">
          <Stack direction="row" alignItems="center">
            <Image
              src="/assets/v3/ico-blockchain-60x60.svg"
              w="30px"
              h="30px"
              borderRadius="15px"
              border="2px solid"
              borderColor="divider"
            />
            <Text fontSize="sm" variant="emphasis">
              All Blockchains
            </Text>
          </Stack>
        </Radio>
        {supportedChainIds.map(renderOption)}
      </Stack>
    </RadioGroup>
  )
}
