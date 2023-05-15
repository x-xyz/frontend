import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Menu, MenuButton, MenuButtonProps, MenuItem, MenuList } from '@chakra-ui/menu'
import { Box, Stack, Text } from '@chakra-ui/layout'
import { Erc20TokenMeta, findToken, getErc20Tokens, getTokenId } from '@x/constants'
import { ChainId, defaultNetwork } from '@x/constants'

export interface SelectErc20TokenProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  buttonProps?: MenuButtonProps
  chainId?: ChainId
}

export default function SelectErc20Token({
  value,
  onChange,
  disabled,
  chainId = defaultNetwork,
  buttonProps = {},
}: SelectErc20TokenProps) {
  const tokens = useMemo(() => getErc20Tokens(chainId), [chainId])

  const selected = useMemo(() => tokens.find(token => token.address === value) || tokens[0], [value, tokens])

  useEffect(() => {
    const currentToken = !!value && findToken(value, chainId)
    if (!currentToken && onChange) onChange(getTokenId(tokens[0]))
  }, [value, onChange, chainId, tokens])

  function renderLabel({ icon, symbol }: Erc20TokenMeta) {
    return (
      <Stack direction="row" alignItems="center" width="84px">
        <Box width="20px" height="20px">
          {icon && <Image src={icon} width="20px" height="20px" />}
        </Box>
        <Text color="currentcolor">{symbol.toUpperCase()}</Text>
      </Stack>
    )
  }

  function renderOption(token: Erc20TokenMeta) {
    return (
      <MenuItem key={token.address} onClick={() => onChange && onChange(token.address)}>
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
