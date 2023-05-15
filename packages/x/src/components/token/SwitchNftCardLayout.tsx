import { ButtonGroup, ButtonGroupProps, IconButton } from '@chakra-ui/button'
import { BsGridFill, BsGrid3X3GapFill } from 'react-icons/bs'

export type NftCardLayout = 'small' | 'large'

export interface SwitchNftCardLayoutProps extends ButtonGroupProps {
  value?: NftCardLayout
  onValueChange?: (value: NftCardLayout) => void
}

export default function SwitchNftCardLayout({ value = 'small', onValueChange, ...props }: SwitchNftCardLayoutProps) {
  return (
    <ButtonGroup size="sm" isAttached variant="outline" {...props}>
      <IconButton
        aria-label="Large display"
        icon={<BsGridFill />}
        p={2}
        variant={value === 'large' ? 'solid' : 'outline'}
        onClick={() => onValueChange?.('large')}
      />
      <IconButton
        aria-label="Small display"
        icon={<BsGrid3X3GapFill />}
        p={2}
        variant={value === 'small' ? 'solid' : 'outline'}
        onClick={() => onValueChange?.('small')}
      />
    </ButtonGroup>
  )
}
