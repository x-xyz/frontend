import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import ListForSaleModal, { ListForSaleModalProps } from './ListForSaleModal'

export type ListForSaleButtonProps = Omit<ListForSaleModalProps, 'isOpen' | 'onClose'> & ButtonProps

export default function ListForSaleButton({
  mode,
  chainId,
  contract,
  tokenId,
  defaultValues,
  afterSubmitted,
  children,
  ...props
}: ListForSaleButtonProps) {
  const { isOpen, onClose, onOpen } = useDisclosure()
  return (
    <>
      <Button {...props} onClick={onOpen}>
        {children || (mode === 'create' ? 'List' : 'Update')}
      </Button>
      <ListForSaleModal
        isOpen={isOpen}
        onClose={onClose}
        mode={mode}
        chainId={chainId}
        contract={contract}
        tokenId={tokenId}
        defaultValues={defaultValues}
        afterSubmitted={afterSubmitted}
      />
    </>
  )
}
