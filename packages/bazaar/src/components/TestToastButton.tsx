import { Button } from '@chakra-ui/button'
import { useToast } from '@x/hooks'

export default function TestToastButton() {
  const toast = useToast()

  return <Button onClick={() => toast({ description: 'he' })}>Show Toast</Button>
}
