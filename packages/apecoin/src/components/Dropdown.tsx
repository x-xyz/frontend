import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  IconButton,
  List,
  ListItem,
  ListItemProps,
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  PopoverBody,
  PopoverProps,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'

export interface DropdownListProps extends PopoverProps {
  title?: string
  triggerElem?: React.ReactNode
}

function DropdownList({ children, title, triggerElem, ...props }: DropdownListProps) {
  return (
    <Popover placement="bottom" {...props}>
      {childrenProps => (
        <>
          <PopoverTrigger>
            {triggerElem || (
              <IconButton
                variant="icon"
                color="currentcolor"
                icon={<TriangleDownIcon w={2.5} />}
                aria-label="dropdown list"
              />
            )}
          </PopoverTrigger>
          <PopoverContent>
            {title && (
              <PopoverHeader>
                <Stack direction="row" h="full" align="center">
                  <Text fontSize="lg" variant="emphasis">
                    {title}
                  </Text>
                  <Spacer />
                  <PopoverCloseButton pos="unset" />
                </Stack>
              </PopoverHeader>
            )}
            <PopoverBody p={0}>
              <List variant="reactable" maxH="400px" overflowY="auto">
                {typeof children === 'function' ? children(childrenProps) : children}
              </List>
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

export type DropdownItemProps = ListItemProps

function DropdownItem({ children, ...props }: DropdownItemProps) {
  return (
    <ListItem fontSize="sm" p={0} {...props}>
      {children}
    </ListItem>
  )
}

const Dropdown = { List: DropdownList, Item: DropdownItem }

export default Dropdown
