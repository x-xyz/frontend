import { Auction } from '@x/models/dist'
import { DateTime, Duration, DurationUnit } from 'luxon'
import { Stat, StatGroup, StatGroupProps, StatLabel, StatNumber } from '@chakra-ui/stat'
import { useState } from 'react'
import { Text, HStack, Box, Stack } from '@chakra-ui/layout'
import { capitalize } from 'lodash'
import { useInterval } from '@x/hooks'

export interface CountdownProps extends StatGroupProps {
  auction: Auction
  units?: DurationUnit[]
}

export default function Countdown({
  auction,
  units = ['days', 'hours', 'minutes', 'seconds'],
  ...props
}: CountdownProps) {
  const [duration, setDuration] = useState<Duration>()

  const endTime = DateTime.fromSeconds(auction.endTime.toNumber())
  const startTime = DateTime.fromSeconds(auction.startTime.toNumber())
  const started = startTime < DateTime.now()
  const ended = endTime < DateTime.now()

  useInterval(pause => {
    const targetTime = started ? endTime : startTime
    const diff = targetTime.diffNow([...units])
    setDuration(diff)
    if (diff.valueOf() <= 0) {
      setDuration(Duration.fromMillis(0))
    }
    if (ended) pause()
  }, 1000)

  function renderUnit(unit: DurationUnit, index: number) {
    return (
      <Stat key={unit} flex="0 0 0">
        <StatLabel fontSize="xs">{capitalize(unit)}</StatLabel>
        <StatNumber fontSize="lg">{duration ? Math.floor(duration[unit]) : '-'}</StatNumber>
      </Stat>
    )
  }

  function render() {
    return units.map(renderUnit)
  }

  return (
    <Stack {...props}>
      {started ? (
        <Text color="note">Sale ends at {endTime.toLocaleString(DateTime.DATETIME_MED)}</Text>
      ) : (
        <Text color="note">Sale starts at {startTime.toLocaleString(DateTime.DATETIME_MED)}</Text>
      )}
      <HStack spacing={10}>{render()}</HStack>
    </Stack>
  )
}
