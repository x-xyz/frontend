import { useRef, useEffect, useCallback } from 'react'
import throttle from 'lodash/throttle'
import { GridOnScrollProps } from 'react-window'
import { useMergeRefs } from '@chakra-ui/react'

type Axis = 'x' | 'y'

const windowScrollPositionKey: Record<Axis, keyof Window> = {
  y: 'pageYOffset',
  x: 'pageXOffset',
}

const documentScrollPositionKey: Record<Axis, keyof HTMLElement> = {
  y: 'scrollTop',
  x: 'scrollLeft',
}

const getScrollPosition = (axis: Axis) =>
  (window[windowScrollPositionKey[axis]] as number) ||
  (document.documentElement[documentScrollPositionKey[axis]] as number) ||
  (document.body[documentScrollPositionKey[axis]] as number) ||
  0

export interface ReactWindowScrollerProps {
  throttleTime?: number
  isGrid?: boolean
  windowRef?: React.RefObject<any>
  children: (args: {
    ref: React.LegacyRef<any>
    outerRef: React.RefObject<HTMLElement | null>
    style: {
      width?: string
      height?: string
      display?: string
    }
    onScroll: (e: GridOnScrollProps) => void
  }) => React.ReactNode
}

export default function ReactWindowScroller({
  children,
  throttleTime = 10,
  isGrid = false,
  windowRef,
}: ReactWindowScrollerProps) {
  const innerRef = useRef<any>(null)
  const ref = useMergeRefs(innerRef, windowRef)
  const outerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleWindowScroll = throttle(() => {
      const { offsetTop = 0, offsetLeft = 0 } = outerRef.current || {}
      const scrollTop = getScrollPosition('y') - offsetTop
      const scrollLeft = getScrollPosition('x') - offsetLeft
      if (isGrid) innerRef.current && innerRef.current.scrollTo({ scrollTop, scrollLeft })
      if (!isGrid) innerRef.current && innerRef.current.scrollTo({ scrollTop })
    }, throttleTime)

    window.addEventListener('scroll', handleWindowScroll)
    return () => {
      handleWindowScroll.cancel()
      window.removeEventListener('scroll', handleWindowScroll)
    }
  }, [isGrid, throttleTime])

  const onScroll = useCallback(
    ({ scrollLeft, scrollTop, scrollOffset, scrollUpdateWasRequested }) => {
      if (!scrollUpdateWasRequested) return
      const top = getScrollPosition('y')
      const left = getScrollPosition('x')
      const { offsetTop = 0, offsetLeft = 0 } = outerRef.current || {}

      scrollOffset += Math.min(top, offsetTop)
      scrollTop += Math.min(top, offsetTop)
      scrollLeft += Math.min(left, offsetLeft)

      if (!isGrid && scrollOffset !== top) window.scrollTo(0, scrollOffset)
      if (isGrid && (scrollTop !== top || scrollLeft !== left)) {
        window.scrollTo(scrollLeft, scrollTop)
      }
    },
    [isGrid],
  )

  return (
    <>
      {children({
        ref,
        outerRef,
        style: {
          width: isGrid ? 'auto' : '100%',
          height: '100%',
          display: 'inline-block',
        },
        onScroll,
      })}
    </>
  )
}
