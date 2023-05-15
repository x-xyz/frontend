import { memo } from 'react'
import { Stack, StackProps, Text } from '@chakra-ui/layout'
import { useRouter } from 'next/router'
import EyeIcon from 'components/icons/EyeIcon'

export interface WatchButtonProps extends StackProps {
  count?: number
}

function WatchButton({ count = 0, ...props }: WatchButtonProps) {
  const { locale } = useRouter()

  return (
    <Stack direction="row" align="center" color="value" px={5} py={2} spacing={3} {...props}>
      <EyeIcon w={5} h={5} />
      <Text fontWeight="bold" color="placeholder">
        {count.toLocaleString(locale)}
      </Text>
    </Stack>
  )
}

export default memo(WatchButton)
