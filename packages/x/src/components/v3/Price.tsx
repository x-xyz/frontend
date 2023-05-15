import { SkeletonText, StatHelpText, StatProps } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import StatValue from './StatValue'

export interface PriceProps extends StatProps {
  label?: React.ReactNode
  price?: number
  priceInUsd?: number
  unit?: React.ReactNode
  isLoading?: boolean
  center?: boolean
  tooltip?: string
}

export default function Price({
  label = 'Floor Price',
  price,
  priceInUsd,
  unit,
  isLoading,
  center,
  tooltip,
  ...props
}: PriceProps) {
  const { locale } = useRouter()
  return (
    <StatValue
      label={label}
      value={price || '-'}
      unit={unit}
      center={center}
      isLoading={isLoading}
      tooltip={tooltip}
      {...props}
    >
      {typeof priceInUsd === 'number' && (
        <SkeletonText
          as={StatHelpText}
          noOfLines={1}
          minH="1.4rem"
          display="flex"
          alignItems="center"
          isLoaded={!isLoading}
          whiteSpace="nowrap"
          color="value"
          mt={-1}
        >
          {priceInUsd.toLocaleString(locale, { maximumFractionDigits: 0 })} USD
        </SkeletonText>
      )}
    </StatValue>
  )
}
