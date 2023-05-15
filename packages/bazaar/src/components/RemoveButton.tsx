import { Button, ButtonProps } from '@chakra-ui/button'
import { CloseIcon } from '@chakra-ui/icons'

type RemoveButtonProps = ButtonProps

export default function RemoveButton({ children, ...props }: RemoveButtonProps) {
  return (
    <Button
      variant="outline"
      bgColor="#1C1C1F"
      borderColor="transparent"
      iconSpacing={2.5}
      rightIcon={<CloseIcon w={2} h={2} />}
      {...props}
    >
      {children}
    </Button>
  )
}
