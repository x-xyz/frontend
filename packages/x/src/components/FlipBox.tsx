import { motion } from 'framer-motion'
import { Center, CenterProps } from '@chakra-ui/layout'

export interface FlipBoxProps extends CenterProps {
  version?: number | string
}

export default function FlipBox({ children, version = 0, ...props }: FlipBoxProps) {
  return (
    <Center pos="relative" {...props}>
      <motion.div
        key={`${version}-0`}
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.8 }}
        style={{ position: 'absolute', width: '100%', height: 'calc(50% - 1px)', top: 0, background: '#ffffff66' }}
      />
      <motion.div
        key={`${version}-1`}
        animate={{ rotateX: '-180deg', translateY: '2px' }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          width: '100%',
          height: 'calc(50% - 1px)',
          top: 0,
          background: '#ffffff66',
          transformOrigin: 'bottom',
        }}
      />
      <motion.div
        key={`${version}-2`}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8 }}
        style={{ position: 'absolute', width: '100%', height: 'calc(50% - 1px)', bottom: 0, background: '#ffffff66' }}
      />

      {children}
    </Center>
  )
}
