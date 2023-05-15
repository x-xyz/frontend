import Image from 'next/image'
import { useEffect, useMemo } from 'react'

import { Box, Stack, Text, Spacer, TextProps } from '@chakra-ui/layout'
import { Menu, MenuButton, MenuButtonProps, MenuItem, MenuList } from '@chakra-ui/menu'
import { ChainId, findToken, getErc20Tokens, getTokenId, getTokens, TokenMeta } from '@x/constants'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { FaCaretDown } from 'react-icons/fa'

export interface SelectTokenProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  buttonProps?: MenuButtonProps
  textProps?: TextProps
  chainId?: ChainId
  withNativeToken?: boolean
  onlyTradable?: boolean
}

export default function SelectToken({
  value,
  onChange,
  disabled,
  buttonProps = {},
  textProps = {},
  chainId = ChainId.Fantom,
  withNativeToken = true,
  onlyTradable = true,
}: SelectTokenProps) {
  const tokens = useMemo(() => {
    const tokens = withNativeToken ? getTokens(chainId) : getErc20Tokens(chainId)
    if (onlyTradable) return tokens.filter(token => token.isTradable)
    return tokens
  }, [chainId, withNativeToken, onlyTradable])

  const selected = useMemo(() => (value && findToken(value, chainId)) || getTokens(chainId)[0], [value, chainId])

  useEffect(() => {
    const currentToken = !!value && findToken(value, chainId)
    if (!currentToken && onChange) onChange(getTokenId(tokens[0]))
  }, [value, onChange, chainId, tokens])

  function renderLabel({ icon, symbol }: TokenMeta) {
    return (
      <Stack direction="row" alignItems="center">
        {/*<Box width="20px" height="20px">*/}
        {/*  <Image src={icon} width="20px" height="20px" />*/}
        {/*</Box>*/}
        <Text {...textProps}>{symbol.toUpperCase()}</Text>
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
    <Menu isLazy={true} placement="right">
      <MenuButton type="button" disabled={disabled} {...buttonProps}>
        <Stack direction="row" align="center" color="textSecondary">
          {renderLabel(selected)}
          <FaCaretDown />
        </Stack>
      </MenuButton>
      <MenuList>{tokens.map(renderOption)}</MenuList>
    </Menu>
  )
}
