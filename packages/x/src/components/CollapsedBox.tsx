import { useBoolean, useTheme, Box, BoxProps, Button, Center } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { getColor, transparentize } from '@chakra-ui/theme-tools'
import { useEffect, useMemo, useRef, useState } from 'react'

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
          variant="unstyled"
          w="full"
          p={3}
          pt={opened ? 3 : 12}
          onClick={toggle}
        >
          <Center>
            <ChevronDownIcon transform={`rotate(${opened ? 180 : 0}deg)`} />
          </Center>
        </Button>
      )}
    </Box>
  )
}
