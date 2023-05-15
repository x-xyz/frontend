import { IconButton, Image, useDisclosure } from '@chakra-ui/react'
import SearchModal from './SearchModal'

export default function SearchModalButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        variant="icon"
        icon={<Image w={10} h={10} src="/assets/v3/ico-mobile-search-80x80.png" />}
        onClick={onOpen}
        aria-label="search"
      />
      <SearchModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
