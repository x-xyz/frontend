import { useMemo } from 'react'
import Image from 'next/image'
import { Menu, MenuButton, MenuButtonProps, MenuItem, MenuList } from '@chakra-ui/menu'
import { Box, Stack, Text } from '@chakra-ui/layout'
import { TokenMeta, findToken, getTokens, getTokenId, getErc20Tokens } from '@x/constants'
import { ChainId, defaultNetwork } from '@x/constants'

export interface SelectTokenProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  buttonProps?: MenuButtonProps
  chainId?: ChainId
  withNativeToken?: boolean
  onlyTradable?: boolean
}

export default function SelectToken({
  value,
  onChange,
  disabled,
  buttonProps = {},
  chainId = defaultNetwork,
  withNativeToken = true,
  onlyTradable = true,
}: SelectTokenProps) {
  const tokens = useMemo(() => {
    const tokens = withNativeToken ? getTokens(chainId) : getErc20Tokens(chainId)
    if (onlyTradable) return tokens.filter(token => token.isTradable)
    return tokens
  }, [chainId, withNativeToken, onlyTradable])

  const selected = useMemo(() => (value && findToken(value, chainId)) || getTokens(chainId)[0], [value, chainId])

  function renderLabel({ icon, symbol }: TokenMeta) {
    return (
      <Stack direction="row" alignItems="center" width="84px">
        <Box width="20px" height="20px">
          {icon && <Image src={icon} width="20px" height="20px" />}
        </Box>
        <Text color="currentcolor">{symbol.toUpperCase()}</Text>
      </Stack>
    )
  }

  function renderOption(token: TokenMeta) {
    return (
      <MenuItem key={getTokenId(token)} onClick={() => onChange && onChange(getTokenId(token))}>
        {renderLabel(token)}
      </MenuItem>
    )
  }

  return (
    <Menu>
      <MenuButton type="button" disabled={disabled} {...buttonProps}>
        {renderLabel(selected)}
      </MenuButton>
      <MenuList>{tokens.map(renderOption)}</MenuList>
    </Menu>
  )
}
