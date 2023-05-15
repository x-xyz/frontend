import { DateTime, Duration, DurationUnit } from 'luxon'
import { Stat, StatGroup, StatGroupProps, StatLabel, StatNumber } from '@chakra-ui/stat'
import { useState } from 'react'
import { Text, Stack } from '@chakra-ui/layout'
import { capitalize } from 'lodash'
import { useInterval } from '@x/hooks'
import FlipBox from 'components/FlipBox'

export interface CountdownProps extends StatGroupProps {
  // children: DateTime
  startTime: DateTime
  endTime: DateTime
  units?: DurationUnit[]
  concluded?: boolean
}

export default function Countdown({
  // children,
  startTime,
  endTime,
  color,
  units = ['hours', 'minutes', 'seconds'],
  concluded,
  ...props
}: CountdownProps) {
  const [duration, setDuration] = useState<Duration>()

  const started = startTime.diffNow().valueOf() <= 0

  const ended = !!duration && duration.valueOf() <= 0

  useInterval(pause => {
    const targetTime = startTime.diffNow().valueOf() > 0 ? startTime : endTime
    const diff = targetTime.diffNow([...units])
    setDuration(diff)
    if (diff.valueOf() <= 0) pause()
  }, 1000)

  function renderNumber(val: string, index: number) {
    return (
      <FlipBox key={`val-${index}`} w="24px" h="48px" version={val} color={color} as="span" fontSize="2xl">
        {val}
      </FlipBox>
    )
  }

  function renderUnit(unit: DurationUnit, index: number) {
    const reminded = duration ? ~~duration[unit] : 0

    return (
      <Stat key={unit}>
        {index === 0 && (
          <StatLabel color={color} fontWeight="bold" position="relative" width="300%" mb={2}>
            {started ? 'Auction ending in' : 'Auction will start in'}
          </StatLabel>
        )}
        <StatNumber display="flex" flexDirection="column" alignItems="flex-start">
          <Stack direction="row" alignItems="center">
            {`0${reminded}`.slice(-2).toString().split('').map(renderNumber)}
          </Stack>
          <Text color={color} as="span" fontSize="xs" fontWeight="medium" mt={2}>
            {capitalize(unit)}
          </Text>
        </StatNumber>
      </Stat>
    )
  }

  function render() {
    if (ended)
      return (
        <Stat alignItems="flex-start">
          <StatLabel color={color} fontSize="xs">
            {concluded ? 'Auction ended' : 'Auction ended at'}
          </StatLabel>
          <StatNumber color={color} fontSize="4xl">
            {concluded ? 'Concluded' : endTime.toLocaleString({ dateStyle: 'short', timeStyle: 'short' })}
          </StatNumber>
        </Stat>
      )

    return units.map(renderUnit)
  }

  return (
    <StatGroup color={color} alignItems="flex-end" {...props}>
      {render()}
    </StatGroup>
  )
}
