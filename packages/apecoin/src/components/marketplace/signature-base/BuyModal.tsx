import Media from 'components/Media'
import UsdPrice from 'components/UsdPrice'
import useToast from 'hooks/useToast'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import {
  Box,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Radio,
  RadioGroup,
  SkeletonText,
  Spacer,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import { keccak256 } from '@ethersproject/solidity'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { fetchCollectionV2, fetchOrder } from '@x/apis/fn'
import { findToken, getChain } from '@x/constants'
import { useActiveWeb3React, useBalance, useErc20Balance, useErc20Contract, useExchangeContract } from '@x/hooks'
import { NftItem, OrderItem, SignedOrder } from '@x/models'
import { compareAddress } from '@x/utils'
import { ensureEnoughErc20Allowance, ensureEnoughNativeToken, handleError } from '@x/web3'
import Overlay from './Overlay'

export interface BuyModalProps extends Omit<ModalProps, 'children'> {
  item: NftItem
  orderItem: OrderItem
}

interface OneInchQuote {
  fromTokenAmount: string
  toTokenAmount: string
  fromToken: {
    address: string
    decimals: number
    name: string
    symbol: string
  }
  toToken: {
    address: string
    decimals: number
    name: string
    symbol: string
  }
}

interface OneInchSwap extends OneInchQuote {
  tx: {
    data: string
  }
}

export default function BuyModal({ item, orderItem, ...props }: BuyModalProps) {
  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', item.chainId, item.contractAddress],
    fetchCollectionV2,
  )

  // origin, ape
  const [selected, setSeleted] = useState('origin')

  const originToken = useMemo(
    () => findToken(orderItem.currency, orderItem.chainId),
    [orderItem.currency, orderItem.chainId],
  )

  const apeToken = useMemo(() => findToken('APE', orderItem.chainId), [orderItem.chainId])

  const chain = useMemo(() => getChain(orderItem.chainId), [orderItem.chainId])

  const nativeTokenBalance = useBalance(orderItem.chainId)

  const erc20OriginTokenContract = useErc20Contract(orderItem.currency, orderItem.chainId)

  const erc20OriginTokenBalance = useErc20Balance(erc20OriginTokenContract)

  const isOriginTokenNative = compareAddress(orderItem.currency, chain.nativeCurrency.address)

  const originTokenBalance = isOriginTokenNative
    ? formatUnits(nativeTokenBalance.value, chain.nativeCurrency.decimals)
    : formatUnits(erc20OriginTokenBalance.value, originToken?.decimals)

  const erc20ApeTokenContract = useErc20Contract(apeToken?.address, orderItem.chainId)

  const erc20ApeTokenBalance = useErc20Balance(erc20ApeTokenContract)

  const apeTokenBalance = formatUnits(erc20ApeTokenBalance.value, apeToken?.decimals)

  const { data: swap, isLoading: isLoading1InchSwapData } = useQuery(
    [
      '1inch-swap',
      apeToken?.address,
      isOriginTokenNative ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : originToken?.address,
      orderItem.price,
    ] as string[],
    ({ queryKey }) => lookupAmount(queryKey[1], queryKey[2], queryKey[3]),
  )

  const isInsufficientOriginTokenBalance = useMemo(
    () => nativeTokenBalance.value.lt(orderItem.price),
    [nativeTokenBalance.value, orderItem.price],
  )

  const isInsufficientApeTokenBalance = useMemo(
    () => (swap ? erc20ApeTokenBalance.value.lt(swap.fromTokenAmount) : false),
    [erc20ApeTokenBalance, swap],
  )

  const [isBuying, setBuying] = useState(false)

  const { account, library, callContract } = useActiveWeb3React()

  const exchangeContract = useExchangeContract(orderItem.chainId)

  const { data: order, isFetching: isLoadingOrder } = useQuery<SignedOrder>(
    ['fetchOrder', orderItem.orderHash],
    async () => fetchOrder(orderItem.chainId, orderItem.orderHash),
  )

  const toast = useToast({ title: 'Buy' })

  async function buyWithOriginToken() {
    setBuying(true)

    try {
      const token = findToken(orderItem.currency, orderItem.chainId)

      if (!token) throw new Error(`unknown token: ${orderItem.currency}`)

      if (!account) throw new Error('cannot get account')

      if (!library) throw new Error('cannot get library')

      if (!exchangeContract) throw new Error('cannot get exchange contract')

      if (!order) throw new Error('cannot get order')

      const priceInEther = BigNumber.from(orderItem.price)

      if (token.isNative) {
        await ensureEnoughNativeToken(library, account, priceInEther, token)
      } else {
        if (!erc20OriginTokenContract) throw new Error('cannot get erc20 contract')

        const approveTxHash = await ensureEnoughErc20Allowance(
          erc20OriginTokenContract,
          account,
          exchangeContract.address,
          priceInEther,
          token,
        )

        if (approveTxHash) toast({ status: 'success', description: `Approve. ${approveTxHash}` })
      }

      let tx: ContractTransaction

      const takerOrder = {
        isAsk: false,
        taker: account,
        itemIdx: orderItem.itemIdx,
        item: orderItem,
        minPercentageToAsk: 0,
        marketplace: keccak256(['string'], ['apecoin']),
        params: [],
      }

      if (token.isNative) {
        tx = await callContract({
          contract: exchangeContract,
          method: 'matchAskWithTakerBidUsingETH',
          args: [order, takerOrder],
          value: orderItem.price,
        })
      } else {
        tx = await callContract({
          contract: exchangeContract,
          method: 'matchAskWithTakerBid',
          args: [order, takerOrder],
        })
      }

      await tx.wait()

      toast({ status: 'success', description: `Bought. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setBuying(false)
    }
  }

  async function buyViaZap() {
    setBuying(true)

    try {
      // const token = findToken(orderItem.currency, orderItem.chainId)

      if (!originToken) throw new Error('cannot get origin token')

      if (!apeToken) throw new Error('cannot get ape token')

      if (!account) throw new Error('cannot get account')

      if (!library) throw new Error('cannot get library')

      if (!exchangeContract) throw new Error('cannot get exchange contract')

      if (!order) throw new Error('cannot get order')

      if (!swap) throw new Error('cannot get swap data from 1inch')

      if (!erc20ApeTokenContract) throw new Error('cannot get apecoin contract')

      const approveTxHash = await ensureEnoughErc20Allowance(
        erc20ApeTokenContract,
        account,
        exchangeContract.address,
        BigNumber.from(swap.fromTokenAmount),
        apeToken,
      )

      if (approveTxHash) toast({ status: 'success', description: `Approve. ${approveTxHash}` })

      let tx: ContractTransaction

      const takerOrder = {
        isAsk: false,
        taker: account,
        itemIdx: orderItem.itemIdx,
        item: orderItem,
        minPercentageToAsk: 0,
        marketplace: keccak256(['string'], ['apecoin']),
        params: [],
      }

      if (originToken.isNative) {
        // swap apecoin to native eth and buy
        tx = await callContract({
          contract: exchangeContract,
          method: 'zapMatchAskWithTakerBidUsingETH',
          args: [
            [{ fromToken: swap.fromToken.address, fromAmount: swap.fromTokenAmount, data: swap.tx.data }],
            order,
            takerOrder,
          ],
          value: orderItem.price,
        })
      } else {
        // swap apecoin to erc20 token and buy
        tx = await callContract({
          contract: exchangeContract,
          method: 'zapMatchAskWithTakerBid',
          args: [
            [{ fromToken: swap.fromToken.address, fromAmount: swap.fromTokenAmount, data: swap.tx.data }],
            order,
            takerOrder,
          ],
        })
      }

      await tx.wait()

      toast({ status: 'success', description: `Bought. ${tx.hash}` })
    } catch (error) {
      handleError(error, { toast })

      throw error
    } finally {
      setBuying(false)
    }
  }

  function buy() {
    if (selected === 'origin') buyWithOriginToken()
    else buyViaZap()
  }

  const useMobileLayout = useBreakpointValue({ base: true, lg: false })

  function renderPrice() {
    return (
      <Stat textAlign="right">
        {useMobileLayout && <StatLabel>Total Price</StatLabel>}
        {useMobileLayout && <Spacer />}
        <StatNumber mb={{ lg: '8px' }} fontSize={{ base: 'xs', lg: 'md' }}>
          {orderItem.displayPrice} {originToken?.symbol}
        </StatNumber>
        {useMobileLayout && <Box w="4" />}
        <StatHelpText fontSize="xs">${orderItem.priceInUsd.toLocaleString()}</StatHelpText>
      </Stat>
    )
  }

  function rednerInsufficientBalance() {
    return (
      <Text
        fontSize="xs"
        color="#FF7A00"
        pos={{ base: 'absolute', lg: void 0 }}
        bottom={{ base: '16px', lg: void 0 }}
        right={{ base: '16px', lg: void 0 }}
      >
        Insufficient Balance
      </Text>
    )
  }

  return (
    <Overlay title="Buy with Available Tokens" showCloseButton {...props}>
      <Stack direction="row" align="center">
        <Box w="60px" h="60px">
          <Media
            contentType={item.animationUrlContentType || item.contentType}
            mimetype={item.animationUrlMimeType}
            src={item.hostedAnimationUrl || item.hostedImageUrl || item.imageUrl}
          />
        </Box>
        <Stack>
          <SkeletonText noOfLines={1} isLoaded={!isLoadingCollection} fontSize="xs">
            {collection?.collectionName || '-'}
          </SkeletonText>
          <Text>{item.name}</Text>
        </Stack>
        {!useMobileLayout && <Spacer />}
        {!useMobileLayout && renderPrice()}
      </Stack>
      {useMobileLayout && <Divider my={4} />}
      {useMobileLayout && renderPrice()}
      <Box h={4} />
      <RadioGroup
        value={selected}
        onChange={setSeleted}
        display="flex"
        flexDir="column"
        sx={{
          '.chakra-radio': {
            flexDir: 'row-reverse',
            borderWidth: '1px',
            px: { base: 4, lg: 6 },
            py: 4,
          },
          '.chakra-radio__label': { w: 'full' },
          '.chakra-radio:first-child': {
            borderColor: selected === 'origin' ? 'primary' : '#575757',
            '& .chakra-radio__control': {
              display: isInsufficientOriginTokenBalance ? 'none' : 'inline-flex',
            },
          },
          '.chakra-radio:last-child': {
            borderColor: selected === 'ape' ? 'primary' : '#575757',
            '& .chakra-radio__control': {
              display: isInsufficientApeTokenBalance ? 'none' : 'inline-flex',
            },
          },
          '.chakra-radio__control': {
            pos: { base: 'absolute', lg: void 0 },
            bottom: { base: '24px', lg: void 0 },
            right: { base: '16px', lg: void 0 },
          },
        }}
      >
        {useMobileLayout ? (
          <>
            <Radio value="origin">
              <Stack direction="row" w="full">
                <Stack minW="120px">
                  <Text>{originToken?.symbol}</Text>
                  <Stack spacing={0}>
                    <Text fontSize="sm">
                      {orderItem.displayPrice} {originToken?.symbol}
                    </Text>
                    <Text fontSize="xs" color="#898989">
                      ${orderItem.priceInUsd.toLocaleString()}
                    </Text>
                  </Stack>
                </Stack>
                <Spacer maxW="120px" />
                <Text fontSize="xs" color="#898989" textAlign="right">
                  Balance: {parseFloat(originTokenBalance).toLocaleString(void 0, { maximumFractionDigits: 4 })}
                </Text>
                {isInsufficientOriginTokenBalance && (
                  <Text fontSize="xs" color="#FF7A00">
                    Insufficient Balance
                  </Text>
                )}
              </Stack>
            </Radio>
            <Box h={2} />
            <Radio value="ape">
              <Stack direction="row" w="full">
                <Stack minW="120px">
                  <Text>{apeToken?.symbol}</Text>
                  <Stack spacing={0}>
                    <Text fontSize="sm">{swap ? formatUnits(swap.fromTokenAmount, apeToken?.decimals) : '-'} APE</Text>
                    <UsdPrice
                      chainId={orderItem.chainId}
                      tokenId={apeToken?.address}
                      fontSize="xs"
                      color="#898989"
                      prefix="$"
                    >
                      {swap ? parseFloat(formatUnits(swap.fromTokenAmount, apeToken?.decimals)) : 0}
                    </UsdPrice>
                  </Stack>
                </Stack>
                <Spacer maxW="120px" />
                <Text fontSize="xs" color="#898989" textAlign="right">
                  Balance: {parseFloat(apeTokenBalance).toLocaleString(void 0, { maximumFractionDigits: 4 })}
                </Text>
                {isInsufficientApeTokenBalance && rednerInsufficientBalance()}
              </Stack>
            </Radio>
          </>
        ) : (
          <>
            <Radio value="origin">
              <Stack direction="row" align="center" w="full">
                <Stack minW="120px">
                  <Text>{originToken?.symbol}</Text>
                  <Text fontSize="xs" color="#898989">
                    Balance: {parseFloat(originTokenBalance).toLocaleString(void 0, { maximumFractionDigits: 4 })}
                  </Text>
                </Stack>
                <Spacer maxW="120px" />
                <Stack justify="flex-end" textAlign="right">
                  <Text fontSize="sm">
                    {orderItem.displayPrice} {originToken?.symbol}
                  </Text>
                  <Text fontSize="xs" color="#898989">
                    ${orderItem.priceInUsd.toLocaleString()}
                  </Text>
                </Stack>
                <Spacer flexGrow={3} maxW="140px" />
                {isInsufficientOriginTokenBalance && rednerInsufficientBalance()}
              </Stack>
            </Radio>
            <Box h={2} />
            <Radio value="ape">
              <Stack direction="row" align="center" w="full">
                <Stack minW="120px">
                  <Text>{apeToken?.symbol}</Text>
                  <Text fontSize="xs" color="#898989">
                    Balance: {parseFloat(apeTokenBalance).toLocaleString(void 0, { maximumFractionDigits: 4 })}
                  </Text>
                </Stack>
                <Spacer maxW="120px" />
                <Stack justify="flex-end" textAlign="right">
                  <Text fontSize="sm">{swap ? formatUnits(swap.fromTokenAmount, apeToken?.decimals) : '-'} APE</Text>
                  <UsdPrice
                    chainId={orderItem.chainId}
                    tokenId={apeToken?.address}
                    fontSize="xs"
                    color="#898989"
                    prefix="$"
                  >
                    {swap ? parseFloat(formatUnits(swap.fromTokenAmount, apeToken?.decimals)) : 0}
                  </UsdPrice>
                </Stack>
                <Spacer flexGrow={3} maxW="140px" />
                {isInsufficientApeTokenBalance && (
                  <Text fontSize="xs" color="#FF7A00">
                    Insufficient Balance
                  </Text>
                )}
              </Stack>
            </Radio>
          </>
        )}
      </RadioGroup>
      <Box h={2} />
      <Text>
        To account for slippage during the swap, $APE token value will be up to 2% higher than the listed token.
      </Text>
      <Box h={8} />
      <Button
        disabled={isBuying || isLoadingOrder || isLoading1InchSwapData}
        isLoading={isBuying || isLoadingOrder || isLoading1InchSwapData}
        onClick={buy}
        w="full"
      >
        Confirm Purchase
      </Button>
    </Overlay>
  )
}

async function lookupAmount(fromTokenAddress: string, toTokenAddress: string, expectAmount: string) {
  const params: Record<string, string> = {
    fromTokenAddress,
    toTokenAddress,
    fromAddress: '0xb4a2E49818dd8a5CdD818f22aB99263b62DDEB6c', // exchange contract
    slippage: '1',
    disableEstimate: 'true',
    amount: `${10 ** 18}`, // hard code for getting unit price from quote api
  }

  // one fromToken can get `unitPrice` of toToken
  let unitPrice = '0'

  {
    const res = await fetch(`https://api.1inch.io/v5.0/1/quote?${new URLSearchParams(params)}`)

    const data: OneInchQuote = await res.json()

    unitPrice = data.toTokenAmount
  }

  const estimateAmount = BigNumber.from(expectAmount)
    .mul(10 ** 3)
    .div(unitPrice)
    // apply 2% slippage
    .mul(102)
    .div(100)
    .mul(10 ** 15)
    .toString()

  {
    const res = await fetch(
      `https://api.1inch.io/v5.0/1/swap?${new URLSearchParams({
        ...params,
        amount: estimateAmount,
      })}`,
    )

    const data: OneInchSwap = await res.json()

    return data
  }
}
