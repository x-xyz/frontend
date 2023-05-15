import { useEffect, useMemo, useRef, useState } from 'react'

import { ChevronDownIcon } from '@chakra-ui/icons'
import { Box, BoxProps, Button, useBoolean, useTheme } from '@chakra-ui/react'
import { getColor, transparentize } from '@chakra-ui/theme-tools'

export interface CollapsedBoxProps extends BoxProps {
  collapsedHeight: number
}

export default function CollapsedBox({ children, collapsedHeight, ...props }: CollapsedBoxProps) {
  const [opened, { toggle, on, off }] = useBoolean()
  const theme = useTheme()
  const backgroundColor = getColor(theme, 'background')
  const ref = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const shouldCollapsed = useMemo(() => contentHeight > collapsedHeight, [contentHeight, collapsedHeight])
  useEffect(() => {
    if (ref.current) setContentHeight(ref.current.getBoundingClientRect().height)
  }, [])
  useEffect(() => {
    if (shouldCollapsed) off()
    else on()
  }, [shouldCollapsed, on, off])

  return (
    <Box
      ref={ref}
      {...props}
      pos="relative"
      maxH={contentHeight ? (opened ? 'unset' : collapsedHeight) : 'unset'}
      overflow="hidden"
      pb={opened ? 10 : 0}
    >
      {children}
      {shouldCollapsed && (
        <Button
          pos="absolute"
          bottom={0}
          left={0}
          bg={`linear-gradient(to bottom, ${transparentize(backgroundColor, 0)(theme)}, ${backgroundColor} 60%)`}
          color="primary"
          variant="unstyled"
          w="full"
          py={3}
          pt={opened ? 3 : 12}
          onClick={toggle}
          textAlign="left"
        >
          See more
          <ChevronDownIcon transform={`rotate(${opened ? 180 : 0}deg)`} />
        </Button>
      )}
    </Box>
  )
}
