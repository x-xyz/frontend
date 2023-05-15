import { Box } from '@chakra-ui/react'
import SimpleTable, { SimpleTableProps } from './SimpleTable'

export default function SimpleTableWithScrollbar<T>(props: SimpleTableProps<T>) {
  return (
    <>
      <Box
        pos="relative"
        overflowX={{ base: 'scroll', lg: 'hidden' }}
        sx={{
          '&::-webkit-scrollbar': {
            w: '10px',
          },
          '&::-webkit-scrollbar-track': {
            w: '10px',
            bg: '#2a2a2a',
            mx: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: 'white',
          },
        }}
        h="full"
      >
        <SimpleTable {...props} />
        <Box
          pos="sticky"
          left={0}
          w="full"
          h="1px"
          bg="divider"
          mt={1}
          mb={2.5}
          display={{ base: 'block', lg: 'none' }}
        />
      </Box>
      <Box h={2.5} display={{ base: 'block', lg: 'none' }} />
    </>
  )
}
