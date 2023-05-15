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
  hideHeader?: boolean
  noPadding?: boolean
}

function DropdownList({
  children,
  title = 'Options',
  triggerElem,
  hideHeader,
  noPadding,
  ...props
}: DropdownListProps) {
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
            {!hideHeader && (
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
            <PopoverBody>
              <List variant="reactable" p={noPadding ? 0 : 3}>
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
    <ListItem fontSize="sm" {...props}>
      {children}
    </ListItem>
  )
}

const Dropdown = { List: DropdownList, Item: DropdownItem }

export default Dropdown
