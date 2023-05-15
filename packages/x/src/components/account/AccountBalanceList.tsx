import Link from 'components/Link'
import { useRouter } from 'next/router'

import {
  Button,
  IconButton,
  Image,
  List,
  ListItem,
  ListProps,
  SkeletonText,
  Spacer,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import { formatUnits } from '@ethersproject/units'
import { findToken, getChain, TokenMeta } from '@x/constants'
import { useActiveWeb3React, useBalance, useErc20BalanceByToken } from '@x/hooks'
import { ChainId } from '@x/models'
import getTokenIcon from 'utils/getTokenIcon'

import { useAccountModal } from './AccountModalProvider'
import InfoIcon from 'components/icons/InfoIcon'

export interface AccountBalanceListProps extends ListProps {
  showX?: boolean
  showWrapButton?: boolean
}

interface InnerAccountBalanceListProps extends AccountBalanceListProps {
  account: string
  chainId: ChainId
}

export default function DefaultAccountBalanceList(props: AccountBalanceListProps) {
  const { account, chainId } = useActiveWeb3React()
  if (!account || !chainId) return null
  return <InnerAccountBalanceList account={account} chainId={chainId} {...props} />
}

function InnerAccountBalanceList({ account, chainId, showX, showWrapButton, ...props }: InnerAccountBalanceListProps) {
  const { wrapNativeModal, wrapNativeExplanationModal } = useAccountModal()

  const xToken = findToken('X', chainId)
  const nativeToken = getChain(chainId).nativeCurrency
  const wrappedToken = findToken(`W${nativeToken.symbol}`, chainId)

  function renderBalance(token: TokenMeta, children?: React.ReactNode, afterLabel?: React.ReactNode) {
    return (
      <ListItem>
        <Stack direction="row" align="center">
          <Image
            src={getTokenIcon(token)}
            w={8}
            h={8}
            border="2px solid"
            borderColor="divider"
            borderRadius="16px"
            overflow="hidden"
          />
          {token.isNative ? (
            <NativeBalance token={token} afterLabel={afterLabel} />
          ) : (
            <Erc20Balance token={token} afterLabel={afterLabel} />
          )}
          <Spacer />
          {children}
        </Stack>
      </ListItem>
    )
  }

  return (
    <List variant="round-border" {...props}>
      {showX &&
        xToken &&
        renderBalance(
          xToken,
          <Link
            fontSize="lg"
            color="primary"
            href="https://app.sushi.com/swap?outputCurrency=0x7f3141c4d6b047fb930991b450f1ed996a51cb26"
          >
            Buy
          </Link>,
        )}
      {renderBalance(nativeToken)}
      {wrappedToken &&
        renderBalance(
          wrappedToken,
          showWrapButton && (
            <Button variant="link" fontSize="lg" color="primary" onClick={wrapNativeModal.onOpen}>
              Convert
            </Button>
          ),
          showWrapButton && (
            <IconButton
              ml={1}
              variant="icon"
              aria-label="explanation wrapped native token"
              icon={<InfoIcon w={3} h={3} fill="primary" />}
              onClick={wrapNativeExplanationModal.onOpen}
            />
          ),
        )}
    </List>
  )
}

interface BalanceProps {
  token: TokenMeta
  afterLabel?: React.ReactNode
}

function NativeBalance({ token, afterLabel }: BalanceProps) {
  const { locale } = useRouter()
  const { value, isLoading } = useBalance(token.chainId)
  return (
    <Stat>
      <StatLabel display="flex" alignItems="center">
        Balance{afterLabel}
      </StatLabel>
      <StatNumber>
        <SkeletonText isLoaded={!isLoading} noOfLines={1}>
          {parseFloat(formatUnits(value, token.decimals)).toLocaleString(locale)} {token.symbol}
        </SkeletonText>
      </StatNumber>
    </Stat>
  )
}

function Erc20Balance({ token, afterLabel }: BalanceProps) {
  const { locale } = useRouter()
  const { value } = useErc20BalanceByToken(token)
  return (
    <Stat>
      <StatLabel display="flex" alignItems="center">
        Balance{afterLabel}
      </StatLabel>
      <StatNumber>
        {parseFloat(formatUnits(value, token.decimals)).toLocaleString(locale)} {token.symbol}
      </StatNumber>
    </Stat>
  )
}
