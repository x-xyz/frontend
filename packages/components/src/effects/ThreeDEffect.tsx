import React from 'react'
import { Children, cloneElement, isValidElement, useCallback, useMemo, useRef } from 'react'
import { Box, BoxProps } from '@chakra-ui/layout'
import debounce from 'lodash/debounce'
import { useBreakpointValue } from '@chakra-ui/media-query'

const maxScale = 1.06

export type ThreeDEffectProps = BoxProps

export function ThreeDEffect({ children, ...props }: ThreeDEffectProps) {
  const disabled = useBreakpointValue({ base: true, md: false })

  const containerRef = useRef<HTMLDivElement>(null)

  const childRef = useRef<HTMLDivElement>(null)

  const dataRef = useRef({ x: 0, y: 0, scale: 1 })

  const apply = useCallback(() => {
    if (!containerRef.current) return
    if (!childRef.current) return
    const { x, y, scale } = dataRef.current
    childRef.current.style.transform = `
      rotateX(${y.toFixed(2)}deg)
      rotateY(${x.toFixed(2)}deg)
      scale(${scale})
    `

    containerRef.current.style.zIndex = `${scale > 1 ? 999 : 0}`
  }, [])

  const rotate = useCallback(
    (x: number, y: number) => {
      dataRef.current.x = x
      dataRef.current.y = y
      apply()
    },
    [apply],
  )

  const resetAfter1Seconds = useMemo(() => {
    function animateFlating() {
      let { x, y } = dataRef.current
      let requireNextFrame = false
      if (Math.abs(x) > 1) {
        x -= x / 4
        requireNextFrame = true
      } else {
        x = 0
      }
      if (Math.abs(y) > 1) {
        y -= y / 4
        requireNextFrame = true
      } else {
        y = 0
      }
      rotate(x, y)
      if (requireNextFrame) {
        requestAnimationFrame(animateFlating)
      }
    }

    return debounce(animateFlating, 1000)
  }, [rotate])

  function scaleUp() {
    const { scale } = dataRef.current
    if (scale >= maxScale) {
      scaleTo(maxScale)
      return
    }
    scaleTo(scale * 1.01)
    requestAnimationFrame(scaleUp)
  }

  function scaleDown() {
    const { scale } = dataRef.current
    if (scale <= 1) {
      scaleTo(1)
      return
    }
    scaleTo(scale * 0.96)
    requestAnimationFrame(scaleDown)
  }

  function scaleTo(value: number) {
    dataRef.current.scale = value
    apply()
  }

  function onMouseMove(e: React.MouseEvent) {
    const { width = 0, height = 0 } = childRef.current?.getBoundingClientRect() || {}
    const { offsetX, offsetY } = e.nativeEvent
    rotate(-(offsetX - width / 2) / 18, (offsetY - height / 2) / 18)
  }

  function onMouseEnter() {
    scaleUp()
  }

  function onMouseLeave() {
    scaleDown()
    resetAfter1Seconds()
  }

  const child = Children.only(children)

  if (!isValidElement(child)) return null

  if (disabled) return child

  return (
    <Box
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={containerRef}
      sx={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(100rem)',
      }}
      {...props}
    >
      {isValidElement(child) && cloneElement(child, { ref: childRef })}
    </Box>
  )
}
