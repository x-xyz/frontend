import { Text, TextProps } from '@chakra-ui/layout'
import React from 'react'
import { useBreakpointValue } from '@chakra-ui/react'

interface ResTextProps extends Omit<TextProps, 'variant'> {
  variant: Record<string, string>
  children: React.ReactNode
}

function ResText({ variant, children, ...props }: ResTextProps) {
  const v = useBreakpointValue(variant)
  return (
    <Text variant={v} {...props}>
      {children}
    </Text>
  )
}

export default ResText
