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
}

export default function Price({ label, price, priceInUsd, unit, isLoading, center, ...props }: PriceProps) {
  const { locale } = useRouter()
  return (
    <StatValue
      label={label || 'Floor Price'}
      value={price}
      unit={unit}
      center={center}
      isLoading={isLoading}
      {...props}
    >
      {priceInUsd && (
        <SkeletonText
          as={StatHelpText}
          noOfLines={1}
          minH="1.4rem"
          display="flex"
          alignItems="center"
          isLoaded={!isLoading}
          whiteSpace="nowrap"
          mt={-1}
        >
          {priceInUsd.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </SkeletonText>
      )}
    </StatValue>
  )
}
