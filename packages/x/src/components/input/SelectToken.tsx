import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Menu, MenuButton, MenuButtonProps, MenuItem, MenuList } from '@chakra-ui/menu'
import { Box, Stack, Text } from '@chakra-ui/layout'
import { TokenMeta, findToken, getTokens, getTokenId, getErc20Tokens } from '@x/constants'
import { ChainId } from '@x/constants'
import { Portal } from '@chakra-ui/react'

export interface SelectTokenProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  buttonProps?: MenuButtonProps
  chainId?: ChainId
  withNativeToken?: boolean
  onlyTradable?: boolean
  withoutIcon?: boolean
}

export default function SelectToken({
  value,
  onChange,
  disabled,
  buttonProps = {},
  chainId = ChainId.Fantom,
  withNativeToken = true,
  onlyTradable = true,
  withoutIcon,
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
      <Stack direction="row" alignItems="center" minW={withoutIcon ? '40px' : '84px'}>
        {!withoutIcon && (
          <Box width="20px" height="20px">
            <Image src={icon} width="20px" height="20px" />
          </Box>
        )}
        <Text color="currentcolor" fontWeight="bold">
          {symbol.toUpperCase()}
        </Text>
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
    <Menu isLazy={true}>
      <MenuButton type="button" disabled={disabled} {...buttonProps}>
        {renderLabel(selected)}
      </MenuButton>
      <Portal>
        <MenuList zIndex="popover">{tokens.map(renderOption)}</MenuList>
      </Portal>
    </Menu>
  )
}
