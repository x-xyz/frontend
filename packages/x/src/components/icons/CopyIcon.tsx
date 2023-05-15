import { forwardRef } from 'react'
import { chakra, ChakraProps } from '@chakra-ui/react'

export default forwardRef<SVGSVGElement, ChakraProps>((props, ref) => {
  return (
    <chakra.svg
      ref={ref}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 60 60"
      {...props}
    >
      <g id="ico-share-link-60x60_00000053544304605215854160000004057320576619506324_">
        <g>
          <path
            fill="currentcolor"
            d="M37.94,27.35c1.95,0,3.53,1.58,3.53,3.53v7.06c0,1.95-1.58,3.53-3.53,3.53h-7.06
          c-1.95,0-3.53-1.58-3.53-3.53v-7.06c0-1.95,1.58-3.53,3.53-3.53H37.94 M37.94,23.82h-7.06c-3.9,0-7.06,3.16-7.06,7.06v7.06
          c0,3.9,3.16,7.06,7.06,7.06h7.06c3.9,0,7.06-3.16,7.06-7.06v-7.06C45,26.98,41.84,23.82,37.94,23.82L37.94,23.82z"
          />
          <path
            fill="currentcolor"
            d="M26.26,32.65h-4.2c-1.95,0-3.53-1.58-3.53-3.53v-7.06c0-1.95,1.58-3.53,3.53-3.53h7.06
          c1.95,0,3.53,1.58,3.53,3.53v3.89l3.53-0.25v-3.64c0-3.9-3.16-7.06-7.06-7.06h-7.06c-3.9,0-7.06,3.16-7.06,7.06v7.06
          c0,3.9,3.16,7.06,7.06,7.06h3.92L26.26,32.65z"
          />
        </g>
      </g>
    </chakra.svg>
  )
})
