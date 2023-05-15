import EnsureConsistencyChain from 'components/EnsureConsistencyChain'
import ReactSelect from 'components/input/ReactSelect'
import Layout from 'components/Layout/v2'
import { isFeatureEnabled } from 'flags'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Button, ButtonProps } from '@chakra-ui/button'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { Box, BoxProps, Center, Grid, GridItem, Spacer, Stack, Text, TextProps } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { VisuallyHiddenInput } from '@chakra-ui/visually-hidden'
import { MaxUint256, Zero } from '@ethersproject/constants'
import { ContractTransaction } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, findToken } from '@x/constants'
import {
  useActiveWeb3React,
  useClaimableFeeDistribution,
  useClaimFeeDistribution,
  useEnvValue,
  useErc20Allowance,
  useErc20Balance,
  useErc20Contract,
  useVotingEscrowBalance,
  useVotingEscrowContract,
  useVotingEscrowLockedState,
  useVotingEscrowTotalSupply,
  useVotingEscrowWithdraw,
} from '@x/hooks'
import useToast from 'hooks/useToast'
import { ensureNumber } from '@x/utils'
import { handleError } from '@x/web3'

export const getServerSideProps = createServerSidePropsGetter(void 0, { requrieAuth: !isFeatureEnabled('vex-page') })

interface FormData {
  amount: string
  lockTime: number
}

const WEEK = 86400 * 7

function roundDownWeek(timestamp: number) {
  return Math.floor(timestamp / WEEK) * WEEK
}

enum Operation {
  None = 'Invalid Operation',
  CreateLock = 'Lock',
  IncreaseAmount = 'Increase amount',
  ExtendLockTime = 'Extend lock time',
}

const breakpoint = 'md'

export default function VeX() {
  const toast = useToast({ title: 'veX' })

  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  const chainId = useEnvValue({ dev: ChainId.Ropsten, stag: ChainId.Ethereum, prod: ChainId.Ethereum })

  /**
   * @todo switch to mainnet
   */

  const [balance, isLoadingBalance, refreshBalance] = useVotingEscrowBalance(chainId, account)

  const [state, isLoadingState, refreshState] = useVotingEscrowLockedState(chainId, account)

  const [supply, isLoadingSupply, refreshSupply] = useVotingEscrowTotalSupply(chainId)

  const xTokenInfo = findToken('X', chainId)

  const xToken = useErc20Contract(xTokenInfo?.address, chainId)

  const veXToken = useVotingEscrowContract(chainId)

  const xBalance = useErc20Balance(xToken)

  const formatedXBalance = useMemo(
    () => parseFloat(formatUnits(xBalance.value, xTokenInfo?.decimals)),
    [xBalance.value, xTokenInfo],
  )

  const [allowance, isLoadingAllowance, refreshAllowance] = useErc20Allowance(xToken, account, veXToken?.address)

  const [isApproving, setApproving] = useState(false)

  const lockTimeOptions = useMemo(
    () =>
      [
        {
          label: '1M',
          value: roundDownWeek(DateTime.now().plus({ months: 1 }).toSeconds()),
          amount: 21.23,
          description: '1 Month',
        },
        {
          label: '3M',
          value: roundDownWeek(DateTime.now().plus({ months: 3 }).toSeconds()),
          amount: 63.7,
          description: '3 Months',
        },
        {
          label: '6M',
          value: roundDownWeek(DateTime.now().plus({ months: 6 }).toSeconds()),
          amount: 127.4,
          description: '6 Months',
        },
        {
          label: '1Y',
          value: roundDownWeek(DateTime.now().plus({ years: 1 }).toSeconds()),
          amount: 250,
          description: '1 Year',
        },
        {
          label: '4Y',
          value: roundDownWeek(
            DateTime.now()
              .plus({ days: 4 * 365 })
              .toSeconds(),
          ),
          amount: 1000,
          description: '4 Years',
        },
      ].sort((a, b) => b.value - a.value),
    [],
  )

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<FormData>({ mode: 'onChange' })

  const amount = watch('amount') || '0'

  const parsedAmount = useMemo(() => {
    // to handle underflow case
    try {
      return parseUnits(amount.toString(), xTokenInfo?.decimals)
    } catch (error) {
      return Zero
    }
  }, [amount, xTokenInfo])

  const lockTime = watch('lockTime') || 0

  const slectedLockTimeOption = useMemo(() => {
    return (
      lockTimeOptions.find(o => o.value === lockTime) || {
        label: '-',
        value: state.end,
        amount: lockTimeOptions.find(o => state.end > o.value)?.amount || 0,
      }
    )
  }, [lockTimeOptions, lockTime, state.end])

  const minRatio = useMemo(() => {
    const maxTime = 4 * 365 * 86400
    const now = Math.floor(Date.now() / 1000)
    const unlockTime = state.end || slectedLockTimeOption.value
    const ratio = (unlockTime - now) / maxTime
    return Math.max(ratio, 0)
  }, [slectedLockTimeOption, state.end])

  const requireApprove = allowance.isZero() || parsedAmount.gt(allowance)

  const operation =
    state.end === 0
      ? Operation.CreateLock
      : state.end === lockTime
      ? Operation.IncreaseAmount
      : parsedAmount.isZero()
      ? Operation.ExtendLockTime
      : Operation.None

  const isLoading = isLoadingBalance || isLoadingAllowance || isLoadingState || isSubmitting

  const disabled = isLoading || !isValid || !isDirty || operation === Operation.None

  useEffect(() => {
    if (state.end) setValue('lockTime', state.end, { shouldDirty: false })
  }, [state.end, setValue])

  async function approve() {
    if (!xToken || !veXToken) return

    setApproving(true)

    try {
      const tx = await xToken.approve(veXToken.address, MaxUint256)

      await tx.wait()

      refreshBalance()
      refreshState()
      refreshSupply()

      toast({ status: 'success', description: 'Approved' })
    } catch (error) {
      handleError(error, { toast })
    } finally {
      setApproving(false)
    }

    refreshAllowance()
  }

  const onSubmit = handleSubmit(async data => {
    if (!veXToken) return

    try {
      const value = parseUnits(data.amount.toString(), xTokenInfo?.decimals)

      let tx: ContractTransaction

      switch (operation) {
        case Operation.CreateLock:
          tx = await veXToken.create_lock(value, data.lockTime)
          break
        case Operation.IncreaseAmount:
          tx = await veXToken.increase_amount(value)
          break
        case Operation.ExtendLockTime:
          tx = await veXToken.increase_unlock_time(data.lockTime)
          break
        default:
          throw new Error('invalid operation')
      }

      await tx.wait()

      switch (operation) {
        case Operation.CreateLock:
        case Operation.IncreaseAmount:
          refreshState()
          refreshBalance()
          refreshSupply()
          break
        case Operation.ExtendLockTime:
          refreshState()
          break
      }

      reset()

      toast({ status: 'success', description: 'Locked' })
    } catch (error) {
      handleError(error, { toast })
    }
  })

  return (
    <Layout title="veX Dashboard">
      <Center pt={8}>
        <Stack spacing={3}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
            <Panel
              title="Total veX"
              titleProps={{ pt: { [breakpoint]: '0.8rem' } }}
              w={{ [breakpoint]: '320px' }}
              flexDirection={{ base: 'row', [breakpoint]: 'column' }}
              alignItems={{ base: 'center', [breakpoint]: 'flex-start' }}
            >
              <Stack flexGrow={1} justify="center" align="flex-end" pt={{ md: 6 }}>
                <SkeletonText isLoaded={!isLoadingSupply} noOfLines={2}>
                  <Text variant="gradient" fontSize={{ base: 'xs', [breakpoint]: '2xl' }} fontWeight="bold">
                    {supply.toLocaleString(locale, { minimumFractionDigits: 4 })}
                  </Text>
                </SkeletonText>
              </Stack>
            </Panel>
            <Panel
              title="My veX Balance"
              titleProps={{ pt: { [breakpoint]: '0.8rem' } }}
              w={{ [breakpoint]: '320px' }}
              flexDirection={{ base: 'row', [breakpoint]: 'column' }}
              alignItems={{ base: 'center', [breakpoint]: 'flex-start' }}
            >
              <Stack flexGrow={1} justify="center" align="flex-end" pt={{ md: 6 }}>
                <SkeletonText isLoaded={!isLoadingBalance} noOfLines={2}>
                  <Text variant="gradient" fontSize={{ base: 'xs', [breakpoint]: '2xl' }} fontWeight="bold">
                    {balance.toLocaleString(locale, { minimumFractionDigits: 4 })}
                  </Text>
                </SkeletonText>
              </Stack>
            </Panel>
            <Panel
              w={{ [breakpoint]: '206px' }}
              flexDirection={{ base: 'row', [breakpoint]: 'column' }}
              alignItems="center"
            >
              <Text fontSize={{ base: '14px', md: '24px' }} fontWeight="bold" textAlign={{ [breakpoint]: 'center' }}>
                My veX
                <br />
                Unlock Date
              </Text>
              <Stack
                flexGrow={1}
                justify="center"
                align={{ base: 'flex-end', [breakpoint]: 'center' }}
                pt={{ [breakpoint]: 3 }}
              >
                <UnlockDate isLoading={isLoadingState}>{state.end}</UnlockDate>
              </Stack>
            </Panel>
          </Stack>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
            <Stack w={{ [breakpoint]: '412px' }}>
              <ClaimPanel />
              <Panel
                title="Minting"
                subtitle="Assuming 1,000 X tokens Locked"
                minW="240px"
                px={{ base: 9, [breakpoint]: 12 }}
              >
                <Box h={6} />
                <Grid templateColumns="1fr auto" rowGap={6}>
                  <GridItem fontWeight="bold">Minted</GridItem>
                  <GridItem fontWeight="bold" textAlign="right">
                    Locked
                  </GridItem>
                  {lockTimeOptions.map(({ amount, description }) => (
                    <Fragment key={description}>
                      <GridItem>{amount.toLocaleString(locale)}</GridItem>
                      <GridItem textAlign="right">{description}</GridItem>
                    </Fragment>
                  ))}
                </Grid>
              </Panel>
            </Stack>
            <EnsureConsistencyChain expectedChainId={chainId} flexGrow={1}>
              <Panel title="Lock X for veX" h="100%" w={{ [breakpoint]: '450px' }} px={{ base: 9, [breakpoint]: 12 }}>
                <form onSubmit={onSubmit}>
                  <Grid
                    my={14}
                    templateColumns="auto 1fr"
                    columnGap={8}
                    rowGap={4}
                    fontSize={{ base: 'sm', [breakpoint]: 'lg' }}
                    fontWeight="bold"
                  >
                    <GridItem>
                      <Text>Balance</Text>
                    </GridItem>
                    <GridItem>
                      <SkeletonText isLoaded={!xBalance.isLoading} noOfLines={2}>
                        <Text variant="gradient">
                          {formatedXBalance.toLocaleString(locale, { minimumFractionDigits: 4 })} X
                        </Text>
                      </SkeletonText>
                    </GridItem>
                    <GridItem>
                      <Text>Locked</Text>
                    </GridItem>
                    <GridItem>
                      <SkeletonText isLoaded={!isLoadingState} noOfLines={2}>
                        <Text variant="gradient">
                          {state.value.toLocaleString(locale, { minimumFractionDigits: 4 })} X
                        </Text>
                      </SkeletonText>
                    </GridItem>
                  </Grid>
                  <Grid templateColumns="1fr auto" columnGap={2} rowGap={2} mb={8}>
                    <GridItem colSpan={2}>
                      <InputGroup>
                        <Input
                          type="number"
                          placeholder="Lock Amount"
                          min={0}
                          step={10 ** -(xTokenInfo?.decimals || 18)}
                          {...register('amount', { required: true })}
                        />
                        <InputRightElement w="fit-content" pr={2}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setValue('amount', formatUnits(xBalance.value, xTokenInfo?.decimals), {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                          >
                            Max
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </GridItem>
                    <GridItem>
                      <Input
                        placeholder={
                          lockTime > 0
                            ? DateTime.fromSeconds(lockTime).toLocaleString(undefined, { locale })
                            : 'Lock Until'
                        }
                        disabled
                      />
                      <VisuallyHiddenInput {...register('lockTime', { valueAsNumber: true, required: true })} />
                    </GridItem>
                    <GridItem>
                      <ReactSelect
                        isSearchable={false}
                        options={lockTimeOptions}
                        onChange={option => {
                          if (!option) return
                          setValue('lockTime', option.value, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                          if (parsedAmount.isZero()) setValue('amount', '0')
                        }}
                        value={slectedLockTimeOption}
                        isOptionDisabled={option => state.end > 0 && option.value <= state.end}
                      />
                    </GridItem>
                  </Grid>
                  <Grid templateColumns={{ md: '1fr auto' }} rowGap={3} mb={14} fontSize="sm">
                    <GridItem fontWeight="bold">X : veX Conversion Ratio</GridItem>
                    <GridItem textAlign={{ md: 'right' }}>
                      1X = {minRatio.toLocaleString(locale, { maximumFractionDigits: 2 })} veX
                    </GridItem>
                    <GridItem fontWeight="bold">You&apos;ll Recieve</GridItem>
                    <GridItem textAlign={{ md: 'right' }}>
                      {(ensureNumber(amount, 0) * minRatio).toLocaleString(locale, { maximumFractionDigits: 2 })} veX
                    </GridItem>
                  </Grid>
                  <Stack>
                    <Stack direction={{ base: 'column', md: 'row' }}>
                      <Button
                        variant="primary"
                        disabled={!requireApprove || !account}
                        isLoading={isApproving}
                        onClick={approve}
                        flexGrow={1}
                      >
                        {requireApprove ? 'Approve' : 'Approved'}
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={requireApprove || disabled || !account}
                        isLoading={isLoading}
                        flexGrow={1}
                      >
                        {operation}
                      </Button>
                    </Stack>
                    <WithdrawButton disabled={state.value == 0 || DateTime.now().toSeconds() < state.end} />
                    {operation === Operation.None && (
                      <Text maxW="300px" color="danger">
                        Cannot increase amount and extend lock time at same time
                      </Text>
                    )}
                  </Stack>
                </form>
              </Panel>
            </EnsureConsistencyChain>
          </Stack>
        </Stack>
      </Center>
    </Layout>
  )
}

interface PanelProps extends Omit<BoxProps, 'title'> {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  titleProps?: TextProps
}

function Panel({ children, title, subtitle, titleProps, ...props }: PanelProps) {
  return (
    <Stack bg="panel" borderRadius="12px" padding={6} flexGrow={1} spacing={0} {...props}>
      {title && (
        <Text fontSize={{ base: '14px', md: '24px' }} fontWeight="bold" {...titleProps}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text fontSize="xs" color="inactive" pt={1}>
          {subtitle}
        </Text>
      )}
      {children}
    </Stack>
  )
}

function UnlockDate({ children, isLoading }: { children?: number; isLoading?: boolean }) {
  if (!children)
    return (
      <SkeletonText isLoaded={!isLoading} noOfLines={2}>
        <Text variant="gradient" fontSize={{ base: 'sm', lg: '48px' }} fontWeight="bold" lineHeight={1}>
          -
        </Text>
      </SkeletonText>
    )

  return (
    <Stack align="center">
      <SkeletonText isLoaded={!isLoading} noOfLines={2}>
        <Text variant="gradient" fontSize={{ base: 'sm', [breakpoint]: '36px' }} fontWeight="bold" lineHeight={1}>
          {DateTime.fromSeconds(children).toFormat('dd')}
        </Text>
      </SkeletonText>
      <SkeletonText isLoaded={!isLoading} noOfLines={2}>
        <Text variant="gradient" fontSize={{ base: 'xs', [breakpoint]: 'sm' }} fontWeight="medium">
          {DateTime.fromSeconds(children).toFormat('LLL yyyy').toUpperCase()}
        </Text>
      </SkeletonText>
    </Stack>
  )
}

function ClaimPanel() {
  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  const chainId = useEnvValue({ dev: ChainId.Ropsten, stag: ChainId.Ethereum, prod: ChainId.Ethereum })

  const rewardToken = findToken('X', chainId)

  const [claimable, isLoadingClaimable, refreshClaimable] = useClaimableFeeDistribution(chainId, account)

  const [claim, isClaiming, isClaimable] = useClaimFeeDistribution(chainId, { onClaimed: refreshClaimable })

  return (
    <EnsureConsistencyChain expectedChainId={chainId}>
      <Panel>
        <Stack direction="row" align="center">
          <Stack>
            <Text fontSize={{ base: 'xs', [breakpoint]: 'sm' }} fontWeight="bold">
              Claimable Amount
            </Text>
            <Stack direction="row" align="center">
              <SkeletonText
                isLoaded={!isLoadingClaimable}
                fontSize={{ base: 'xs', [breakpoint]: '2xl' }}
                fontWeight="bold"
                noOfLines={2}
              >
                <Text variant="gradient">
                  {parseFloat(formatUnits(claimable, rewardToken?.decimals)).toLocaleString(locale, {
                    minimumFractionDigits: 4,
                  })}
                </Text>
              </SkeletonText>
              <Spacer />
              <Text fontSize={{ base: 'xs', [breakpoint]: 'sm' }} fontWeight="bold">
                WETH
              </Text>
            </Stack>
          </Stack>
          <Spacer />
          <Button
            variant="primary"
            onClick={claim}
            isLoading={isClaiming}
            disabled={!isClaimable || claimable.isZero()}
            minW={{ base: '96px', [breakpoint]: void 0 }}
          >
            Claim
          </Button>
        </Stack>
      </Panel>
    </EnsureConsistencyChain>
  )
}

function WithdrawButton({ disabled, isLoading, ...props }: ButtonProps) {
  const toast = useToast({ title: 'veX' })

  const chainId = useEnvValue({ dev: ChainId.Ropsten, stag: ChainId.Ethereum, prod: ChainId.Ethereum })

  const [withdraw, { isWithdrawing, canWithdraw }] = useVotingEscrowWithdraw({ chainId, toast })

  return (
    <Button
      variant="primary"
      disabled={!canWithdraw || disabled}
      isLoading={isWithdrawing || isLoading}
      onClick={withdraw}
      {...props}
    >
      Withdraw
    </Button>
  )
}
