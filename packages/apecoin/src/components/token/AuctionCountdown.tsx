import { DateTime, Duration } from 'luxon'
import { useMemo, useState } from 'react'

import { Badge, BadgeProps, Stack, Text } from '@chakra-ui/react'
import { useInterval } from '@x/hooks'

export interface AuctionCountdownProps extends BadgeProps {
  saleEndsAt: string
}

export default function AuctionCountdown({ saleEndsAt, ...props }: AuctionCountdownProps) {
  const [duration, setDuration] = useState<Duration>()
  const endedAt = useMemo(() => DateTime.fromISO(saleEndsAt), [saleEndsAt])

  useInterval(pause => {
    const diff = endedAt.diffNow()
    setDuration(diff)
    if (diff.valueOf() <= 0) pause()
  }, 1000)

  return (
    <Badge size="sm" {...props}>
      <Stack direction="row">
        <Text fontSize="sm" color="value" minW="60px" textAlign="center">
          {duration?.toFormat(duration.days > 0 ? 'dd:hh:mm' : 'hh:mm:ss')}
        </Text>
      </Stack>
    </Badge>
  )
}
