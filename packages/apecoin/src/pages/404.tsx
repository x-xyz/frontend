import { Heading, Stack } from '@chakra-ui/react'

export default function Error404() {
  return (
    <Stack justifyContent="center" alignItems="center" spacing={14} width="100vw" height="100vh">
      <Heading fontSize="2xl" textAlign="center" lineHeight="base">
        This page does not exist.
      </Heading>
    </Stack>
  )
}
