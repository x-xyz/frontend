import { SkeletonText, Stat, StatLabel, StatNumber, StatProps } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export interface StatValueProps extends StatProps {
  label?: React.ReactNode
  value?: number
  unit?: React.ReactNode
  isLoading?: boolean
  center?: boolean
  numberFormatOption?: Intl.NumberFormatOptions
}

export default function StatValue({
  label,
  value,
  unit,
  isLoading,
  sx,
  center,
  children,
  numberFormatOption,
  ...props
}: StatValueProps) {
  const { locale } = useRouter()
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
      <StatLabel>{label || 'Floor Price'}</StatLabel>
      <SkeletonText
        as={StatNumber}
        noOfLines={1}
        minH="1.4rem"
        display="flex"
        alignItems="center"
        isLoaded={!isLoading}
        whiteSpace="nowrap"
      >
        {value ? value.toLocaleString(locale, { minimumFractionDigits: 3, ...numberFormatOption }) : '-'}
        {unit ? ` ${unit}` : ''}
      </SkeletonText>
      {children}
    </Stat>
  )
}
