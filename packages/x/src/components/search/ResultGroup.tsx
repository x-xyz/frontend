import { List, ListItem, Spacer, Stack, StackProps, Text } from '@chakra-ui/react'
import Image from 'components/Image'
import Link from 'components/Link'
import { Group, Option } from './types'

export interface ResultGroupProps extends StackProps {
  group: Group
}

export default function ResultGroup({ group, ...props }: ResultGroupProps) {
  const { label, options = [] } = group

  function renderOption({ key, label, url, icon, labelRight }: Option) {
    return (
      <ListItem p={3} key={key}>
        <Link variant="container" p={1} href={url} display="flex" flexDirection="row" w="full" alignItems="center">
          <Stack direction="row" w="full" alignItems="center">
            {icon && (
              <Image
                src={icon}
                w={8}
                h={8}
                borderRadius="24px"
                borderColor="divider"
                borderWidth="2px"
                overflow="hidden"
              />
            )}
            {typeof label === 'string' ? (
              <Text fontSize="sm" fontWeight="normal">
                {label}
              </Text>
            ) : (
              label
            )}
            <Spacer />
            {labelRight}
          </Stack>
        </Link>
      </ListItem>
    )
  }

  return (
    <Stack w="full" {...props}>
      <Stack
        direction="row"
        w="full"
        px={4}
        py={3}
        fontSize="xs"
        fontWeight="bold"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="divider"
      >
        <Text color="note">{label}</Text>
        <Spacer />
        {group.titleRight}
      </Stack>
      <List variant="ghost">{options.map(renderOption)}</List>
    </Stack>
  )
}
