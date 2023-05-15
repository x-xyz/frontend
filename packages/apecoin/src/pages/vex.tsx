import { TextProps } from '@chakra-ui/layout'
import Address from 'components/Address'
import ReactSelect from 'components/input/ReactSelect'
import Layout from 'components/Layout'
import Link from 'components/Link'
import { VexClaimableAmountInfoModalButton, VexUnlockDateInfoModalButton } from 'components/modal'
import useToast from 'hooks/useToast'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonProps,
  Center,
  chakra,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  SkeletonText,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { MaxUint256, Zero } from '@ethersproject/constants'
import { ContractTransaction } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useVexAprQuery } from '@x/apis'
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
import { ensureNumber } from '@x/utils'
import { handleError } from '@x/web3'

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

const breakpoint = 'lg'

function makeLockTimes() {
  return [
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
  ].sort((a, b) => b.value - a.value)
}

export default function Vex() {
  const toast = useToast({ title: 'veX' })

  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  const chainId = useEnvValue({ dev: ChainId.Ropsten, stag: ChainId.Ethereum, prod: ChainId.Ethereum })

  const lockTimes = useMemo(makeLockTimes, [])

  const xTokenInfo = findToken('X', chainId)

  const xToken = useErc20Contract(xTokenInfo?.address, chainId)

  const veXToken = useVotingEscrowContract(chainId)

  const xBalance = useErc20Balance(xToken)

  const [allowance, isLoadingAllowance, refreshAllowance] = useErc20Allowance(xToken, account, veXToken?.address)

  const [isApproving, setApproving] = useState(false)

  const [veXBalance, isLoadingVeXBalance, refreshVeXBalance] = useVotingEscrowBalance(chainId, account)

  const [lockedState, isLoadingLockedState, refreshState] = useVotingEscrowLockedState(chainId, account)

  const [supply, isLoadingSupply, refreshSupply] = useVotingEscrowTotalSupply(chainId)

  const useDesktopView = useBreakpointValue({ base: false, lg: true })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting, isDirty, errors },
  } = useForm<FormData>({ mode: 'onChange' })

  const amount = watch('amount') || '0'

  const lockTime = watch('lockTime') || 0

  const amountInBigNumber = useMemo(() => {
    // to handle underflow case
    try {
      return parseUnits(amount.toString(), xTokenInfo?.decimals)
    } catch {
      return Zero
    }
  }, [amount, xTokenInfo])

  const requireApprove = allowance.isZero() || amountInBigNumber.gt(allowance)

  const [slectedLockTimeOption, lockTimeOptions] = useMemo(() => {
    const fallback = {
      label: '-',
      value: lockedState.end,
      amount: lockTimes.find(o => lockedState.end > o.value)?.amount || 0,
    }
    const selected = lockTimes.find(o => o.value === lockTime) || fallback
    const options = [fallback, ...lockTimes]
    return [selected, options] as const
  }, [lockTimes, lockTime, lockedState.end])

  const minRatio = useMemo(() => {
    const maxTime = 4 * 365 * 86400
    const now = Math.floor(Date.now() / 1000)
    const unlockTime = lockedState.end || slectedLockTimeOption.value
    const ratio = (unlockTime - now) / maxTime
    return Math.max(ratio, 0)
  }, [slectedLockTimeOption, lockedState.end])

  const operation =
    lockedState.end === 0
      ? Operation.CreateLock
      : lockedState.end === lockTime
      ? Operation.IncreaseAmount
      : amountInBigNumber.isZero()
      ? Operation.ExtendLockTime
      : Operation.None

  const isLoading = isLoadingVeXBalance || isLoadingAllowance || isLoadingLockedState || isSubmitting

  const disabled = isLoading || !isValid || !isDirty || operation === Operation.None

  // auto fill in after fetched on chain lock time
  useEffect(() => {
    if (lockedState.end) setValue('lockTime', lockedState.end, { shouldDirty: false })
  }, [lockedState.end, setValue])

  async function approve() {
    if (!xToken || !veXToken) return

    setApproving(true)

    try {
      const tx = await xToken.approve(veXToken.address, MaxUint256)

      await tx.wait()

      refreshVeXBalance()
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
          xBalance.refresh()
          refreshVeXBalance()
          refreshSupply()
          refreshAllowance()
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

  function renderLockDescription(props: TextProps) {
    return (
      <Text
        color="tableHeader"
        maxW={{ base: '560px', [breakpoint]: '1000px' }}
        w="full"
        px={{ base: 2, [breakpoint]: 5 }}
        pb={10}
        mx="auto"
        {...props}
      >
        Users who lock their X tokens for veX are provided with governance rights and platform emissions.
        <br />
        The time-lock is variable from 1 month to 4 years, and the longer a user locks their X tokens the greater the
        conversion ratio into veX.
        <br />
        <br />
        For full details on how X token locking works, refer to this{' '}
        <Link href="https://medium.com/@x.xyz/update-vex-tokens-and-x-marketplace-c5ab669b5ae3">medium article</Link>.
        <br />
        For full details on DAO governance for X Marketplace, refer to this{' '}
        <Link href="https://medium.com/@x.xyz/launch-of-dao-governance-for-x-marketplace-32c2a9c647b4">
          medium article
        </Link>
        .
      </Text>
    )
  }

  function renderMintChart(desktop: boolean) {
    const title = 'Minting Chart'
    const description =
      'The estimated figures below show the number of veX minted, in relation to the lock duration. The values below are assuming 1,000 X Tokens are locked.'

    return desktop ? (
      <Stack maxW="560px" w="full" border="1px solid" borderColor="divider" p={5} spacing={4} bg="#262b2c">
        <Text fontWeight="bold">{title}</Text>
        <Text color="tableHeader">{description}</Text>
        <Box pb={5}>
          <Grid templateColumns="168px 1fr" fontSize="sm">
            <GridItem fontSize="xs" color="tableHeader">
              veX Minted
            </GridItem>
            <GridItem fontSize="xs" color="tableHeader">
              Duration to Lock
            </GridItem>
          </Grid>
          <Grid templateColumns="168px 1fr" fontSize="sm" rowGap={1}>
            {lockTimes.map(({ amount, description }) => (
              <Fragment key={description}>
                <GridItem>{amount.toLocaleString(locale)}</GridItem>
                <GridItem>{description}</GridItem>
              </Fragment>
            ))}
          </Grid>
        </Box>
      </Stack>
    ) : (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Text flex="1" textAlign="left" fontWeight="bold">
                {title}
              </Text>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} px={0}>
            <Text color="tableHeader" mb={4}>
              {description}
            </Text>
            <Box pb={5}>
              <Grid templateColumns="168px 1fr" fontSize="sm">
                <GridItem fontSize="xs" color="tableHeader">
                  veX Minted
                </GridItem>
                <GridItem fontSize="xs" color="tableHeader">
                  Duration to Lock
                </GridItem>
              </Grid>
              <Grid templateColumns="168px 1fr" fontSize="sm" rowGap={1}>
                {lockTimes.map(({ amount, description }) => (
                  <Fragment key={description}>
                    <GridItem>{amount.toLocaleString(locale)}</GridItem>
                    <GridItem>{description}</GridItem>
                  </Fragment>
                ))}
              </Grid>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Layout>
      <Stack pt={{ base: '32px', [breakpoint]: '50px' }} spacing={5} pb={{ base: 7, [breakpoint]: 15 }}>
        {account && (
          <Box flexGrow={0}>
            <Address type="copy" fontSize="xl" iconProps={{ w: 8, h: 8 }}>
              {account}
            </Address>
          </Box>
        )}
        <Stack flexWrap="wrap" direction="row" justifyContent="space-between" spacing={0}>
          <ClaimPanel />
          <Stats
            xBalance={xBalance}
            lockedState={lockedState}
            isLoadingLockedState={isLoadingLockedState}
            veXBalance={veXBalance}
            isLoadingVeXBalance={isLoadingVeXBalance}
            supply={supply}
            isLoadingSupply={isLoadingSupply}
          />
        </Stack>
      </Stack>
      {useDesktopView ? (
        <>
          <Center
            bgColor="##151515"
            bgImg="url(/assets/v3/full_width_banner_2560x80_bg.jpg)"
            bgSize="auto 100%"
            bgRepeat="no-repeat"
            bgPos="center"
            borderTopWidth="1px"
            borderColor="divider"
            w="full"
            h={20}
          >
            <Heading fontSize="md">Lock your X Tokens for veX</Heading>
          </Center>
          {renderLockDescription({ textAlign: 'center' })}
        </>
      ) : (
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex="1" textAlign="left" fontWeight="bold">
                  Lock your X Tokens for veX
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={10} px={0}>
              {renderLockDescription({ textAlign: 'left', p: 0 })}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      {!useDesktopView && renderMintChart(false)}
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', [breakpoint]: 'row' }}
          spacing={10}
          justify="center"
          align={{ base: 'center', [breakpoint]: 'unset' }}
        >
          {useDesktopView && renderMintChart(true)}
          <chakra.form maxW="560px" w="full" onSubmit={onSubmit}>
            <Stack w="full" h="full" bg="#262b2c" border="1px solid" borderColor="divider" p={5} spacing={10}>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 10 }}>
                <FormControl
                  isInvalid={!!errors.amount}
                  isRequired={operation !== Operation.ExtendLockTime}
                  flexGrow={1}
                >
                  <FormLabel fontWeight="bold">Amount of X Tokens Lock</FormLabel>
                  <InputGroup>
                    <Input
                      variant="solid"
                      type="number"
                      placeholder="Enter amount"
                      min={0}
                      step={10 ** -(xTokenInfo?.decimals || 18)}
                      {...register('amount', {
                        required: operation !== Operation.ExtendLockTime,
                        max: {
                          message: 'Insufficient X Tokens',
                          value: formatUnits(xBalance.value, xTokenInfo?.decimals),
                        },
                      })}
                      disabled={operation === Operation.ExtendLockTime}
                    />
                    <InputRightElement w="fit-content" pr={2}>
                      <Button
                        variant="unstyled"
                        color="primary"
                        onClick={() => setValue('amount', formatUnits(xBalance.value, xTokenInfo?.decimals))}
                      >
                        Max
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
                </FormControl>
                <FormControl
                  isInvalid={!errors.lockTime}
                  isRequired={operation === Operation.ExtendLockTime}
                  w={{ base: 'full', md: '180px' }}
                  flexShrink={0}
                >
                  <FormLabel fontWeight="bold">Duration to Lock</FormLabel>
                  <ReactSelect
                    name={register('lockTime').name}
                    onBlur={register('lockTime').onBlur}
                    options={lockTimeOptions}
                    onChange={option => {
                      if (!option) return
                      setValue('lockTime', option.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }}
                    value={slectedLockTimeOption}
                    isOptionDisabled={option => lockedState.end > 0 && option.value < lockedState.end}
                  />
                  {/* <Select variant="solid" {...register('lockTime', { valueAsNumber: true, required: true })}>
                    {lockedState.end && <option value={lockedState.end}>-</option>}
                    {lockTimeOptions.map(option => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select> */}
                </FormControl>
              </Stack>
              <Grid templateColumns="180px 1fr" columnGap={6}>
                <GridItem fontSize="xs" color="tableHeader" whiteSpace="nowrap">
                  X : veX Conversion Ratio
                </GridItem>
                <GridItem fontSize="xs" color="tableHeader">
                  veX You&apos;ll Receive
                </GridItem>
                <GridItem fontSize="sm">
                  1 X = {minRatio.toLocaleString(locale, { maximumFractionDigits: 2 })} veX
                </GridItem>
                <GridItem fontSize="sm">
                  {(ensureNumber(amount, 0) * minRatio).toLocaleString(locale, { maximumFractionDigits: 2 })} veX
                </GridItem>
              </Grid>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 4 }}>
                <Button
                  disabled={!account || !requireApprove}
                  isLoading={isApproving}
                  onClick={approve}
                  minW={28}
                  h={8}
                >
                  Approve
                </Button>
                <Button
                  disabled={!account || requireApprove || disabled}
                  isLoading={isLoading}
                  type="submit"
                  minW={28}
                  h={8}
                >
                  {operation}
                </Button>
                <WithdrawButton
                  disabled={lockedState.value === 0 || DateTime.now().toSeconds() < lockedState.end}
                  minW={28}
                  h={8}
                />
              </Stack>
              {operation === Operation.None && (
                <Text color="danger">Cannot increase amount and extend lock time at same time</Text>
              )}
            </Stack>
          </chakra.form>
        </Stack>
      </Container>
      <Box h={14} />
    </Layout>
  )
}

function ClaimPanel() {
  const { locale } = useRouter()

  const { account, chainId } = useActiveWeb3React()

  const rewardToken = findToken('WETH', chainId)

  const [claimable, isLoadingClaimable, refreshClaimable] = useClaimableFeeDistribution(chainId, account)

  const [claim, isClaiming, isClaimable] = useClaimFeeDistribution(chainId, { onClaimed: refreshClaimable })

  const formatedClaimable = useMemo(() => {
    const value = formatUnits(claimable, rewardToken?.decimals)
    return parseFloat(value).toLocaleString(locale, { minimumFractionDigits: 4 })
  }, [claimable, rewardToken, locale])

  return (
    <Box pb={5}>
      <Stack direction="row" align="flex-end" width="fit-content">
        <Stat>
          <StatLabel>
            <Stack direction="row" align="center">
              <Text color="value" whiteSpace="nowrap" fontSize="xs">
                Claimable Amount
              </Text>
              <VexClaimableAmountInfoModalButton />
            </Stack>
          </StatLabel>
          <StatNumber>
            <SkeletonText isLoaded={!isLoadingClaimable} noOfLines={2} whiteSpace="nowrap" fontSize="xl">
              {formatedClaimable} {rewardToken?.symbol}
            </SkeletonText>
          </StatNumber>
        </Stat>
        {chainId === ChainId.Ethereum && (
          <Button onClick={claim} isLoading={isClaiming} disabled={!isClaimable || claimable.isZero()} h={6} w={20}>
            Claim
          </Button>
        )}
      </Stack>
    </Box>
  )
}

interface StatsProps {
  xBalance: ReturnType<typeof useErc20Balance>
  lockedState: ReturnType<typeof useVotingEscrowLockedState>[0]
  isLoadingLockedState: boolean
  veXBalance: number
  isLoadingVeXBalance: boolean
  supply: number
  isLoadingSupply: boolean
}

function Stats({
  xBalance,
  lockedState,
  isLoadingLockedState,
  veXBalance,
  isLoadingVeXBalance,
  supply,
  isLoadingSupply,
}: StatsProps) {
  const { locale } = useRouter()

  const chainId = useEnvValue({ dev: ChainId.Ropsten, stag: ChainId.Ethereum, prod: ChainId.Ethereum })

  const xTokenInfo = findToken('X', chainId)

  const formatedXBalance = useMemo(() => {
    const value = formatUnits(xBalance.value, xTokenInfo?.decimals)
    return parseFloat(value).toLocaleString(locale, { minimumFractionDigits: 4 })
  }, [xBalance.value, xTokenInfo, locale])

  const vexApr = useVexAprQuery({})

  return (
    <Stack maxW="full" overflowX="auto">
      <Stack direction="row" divider={<Box h={15} />} spacing={5}>
        <Stack alignItems="center">
          <Text color="value" fontSize="xs" whiteSpace="nowrap">
            My X Token Balance
          </Text>
          <SkeletonText fontSize="xs" noOfLines={2} isLoaded={!xBalance.isLoading} whiteSpace="nowrap">
            {formatedXBalance} X
          </SkeletonText>
        </Stack>
        <Stack alignItems="center">
          <Text color="value" fontSize="xs" whiteSpace="nowrap">
            My X Token Locked
          </Text>
          <SkeletonText fontSize="xs" noOfLines={2} isLoaded={!isLoadingLockedState} whiteSpace="nowrap">
            {lockedState.value.toLocaleString(locale, { minimumFractionDigits: 4 })} X
          </SkeletonText>
        </Stack>
        <Stack colSpan={{ base: 1, md: 2, [breakpoint]: 1 }} alignItems="center">
          <Text color="value" fontSize="xs" whiteSpace="nowrap">
            Total Platform veX
          </Text>
          <SkeletonText fontSize="xs" noOfLines={2} isLoaded={!isLoadingSupply} whiteSpace="nowrap">
            {supply.toLocaleString(locale, { minimumFractionDigits: 4 })}
          </SkeletonText>
        </Stack>
        <Stack alignItems="center">
          <Text color="value" fontSize="xs" whiteSpace="nowrap">
            My veX Balance
          </Text>
          <SkeletonText fontSize="xs" noOfLines={2} isLoaded={!isLoadingVeXBalance} whiteSpace="nowrap">
            {veXBalance.toLocaleString(locale, { minimumFractionDigits: 4 })}
          </SkeletonText>
        </Stack>
        <Stack alignItems="center">
          <Text color="value" fontSize="xs" whiteSpace="nowrap">
            My veX Unlock Date
            <VexUnlockDateInfoModalButton verticalAlign="middle" h="fit-content" />
          </Text>
          <SkeletonText fontSize="xs" noOfLines={2} isLoaded={!isLoadingLockedState} whiteSpace="nowrap">
            {lockedState.end ? DateTime.fromSeconds(lockedState.end).toFormat('dd LLL yyyy') : '--'}
          </SkeletonText>
        </Stack>
        <Stack colSpan={{ base: 1, md: 2, [breakpoint]: 1 }} alignItems="center">
          <Text color="value" fontSize="xs" whiteSpace="nowrap">
            Annualised Percentage Rate (APR)
          </Text>
          <SkeletonText
            fontSize="xs"
            noOfLines={2}
            isLoaded={!vexApr.isFetching && !vexApr.isLoading}
            color={vexApr.data?.data ? 'success' : 'text'}
            whiteSpace="nowrap"
          >
            {typeof vexApr.data?.data === 'number' ? `${(vexApr.data.data * 100).toFixed(2)}%` : '-'}
          </SkeletonText>
        </Stack>
      </Stack>
      <Text color="value" fontSize="xs">
        Data presented in the above table is updated hourly
      </Text>
    </Stack>
  )
}

function WithdrawButton({ disabled, isLoading, ...props }: ButtonProps) {
  const toast = useToast({ title: 'veX' })

  const chainId = useEnvValue({ dev: ChainId.Ropsten, stag: ChainId.Ethereum, prod: ChainId.Ethereum })

  const [withdraw, { isWithdrawing, canWithdraw }] = useVotingEscrowWithdraw({ chainId, toast })

  return (
    <Button disabled={!canWithdraw || disabled} isLoading={isWithdrawing || isLoading} onClick={withdraw} {...props}>
      Withdraw
    </Button>
  )
}
