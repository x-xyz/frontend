import { SkeletonText, Stack, Stat, StatLabel, StatNumber, StatProps, Text, Tooltip } from '@chakra-ui/react'
import InfoIcon from 'components/icons/InfoIcon'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export interface StatValueProps extends StatProps {
  label?: React.ReactNode
  value?: number | string
  unit?: React.ReactNode
  isLoading?: boolean
  center?: boolean
  numberFormatOption?: Intl.NumberFormatOptions
  tooltip?: string
  disablePercentageStyle?: boolean
}

export default function StatValue({
  label,
  value = 0,
  unit,
  isLoading,
  sx,
  center,
  children,
  numberFormatOption,
  tooltip,
  disablePercentageStyle,
  ...props
}: StatValueProps) {
  const { locale } = useRouter()
  const isPercentage = !disablePercentageStyle && unit === '%'
  const isPositive = useMemo(() => {
    if (typeof value === 'number') return value > 0
    return parseFloat(value) > 0
  }, [value])
  const isNegative = useMemo(() => {
    if (typeof value === 'number') return value < 0
    return parseFloat(value) < 0
  }, [value])
  return (
    <Stat
      maxH="68px"
      sx={{
        ...sx,
        dl: {
          display: center ? 'flex' : void 0,
          flexDirection: center ? 'column' : void 0,
          alignItems: center ? 'center' : void 0,
        },
      }}
      {...props}
    >
      <StatLabel>
        <Stack direction="row" align="center">
          <Text as="span" whiteSpace="nowrap" color="note">
            {label || 'Floor Price'}
          </Text>
          {tooltip && (
            <Tooltip label={tooltip}>
              <InfoIcon w={3} h={3} fill="primary" />
            </Tooltip>
          )}
        </Stack>
      </StatLabel>
      <SkeletonText
        as={StatNumber}
        noOfLines={1}
        minH="1.4rem"
        display="flex"
        alignItems="center"
        isLoaded={!isLoading}
        whiteSpace="nowrap"
        color={isPercentage ? (isPositive ? 'success' : isNegative ? 'danger' : void 0) : void 0}
        fontSize="sm"
      >
        {isPercentage && isPositive && '+'}
        {value || value === 0 ? value.toLocaleString(locale, { minimumFractionDigits: 3, ...numberFormatOption }) : '-'}
        {unit ? ` ${unit}` : ''}
      </SkeletonText>
      {children}
    </Stat>
  )
}
