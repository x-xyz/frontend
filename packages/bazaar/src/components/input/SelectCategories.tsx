import { Avatar } from '@chakra-ui/avatar'
import { Flex, Stack, Text } from '@chakra-ui/layout'
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/menu'
import { CloseButton } from '@chakra-ui/close-button'
import { Icon } from '@chakra-ui/icon'
import { Category } from '@x/models'
import { uniq, remove } from 'lodash'
import { DefaultIcon } from '@chakra-ui/select'

export interface SelectCategoriesProps {
  value?: Category[]
  onChange?: (value: Category[]) => void
  disabled?: boolean
  immutable?: boolean
}

interface CategoryOption {
  value: Category
  label: string
  icon?: string
}

const categoryOptions: CategoryOption[] = [
  {
    value: Category.Art,
    label: 'Art',
    icon: '/assets/icons/rainbow.svg',
  },
  {
    value: Category.Collectibles,
    label: 'Collectibles',
    icon: '/assets/icons/bear.svg',
  },
  {
    value: Category.Sports,
    label: 'Sports',
    icon: '/assets/icons/soccerball.svg',
  },
  {
    value: Category.Utility,
    label: 'Utility',
    icon: '/assets/icons/tools.svg',
  },
  {
    value: Category.TradingCards,
    label: 'Trading Cards',
    icon: '/assets/icons/cardboard.svg',
  },
  {
    value: Category.VirtualWorlds,
    label: 'Virtual Worlds',
    icon: '/assets/icons/monster.svg',
  },
  {
    value: Category.DomainNames,
    label: 'Domain Names',
    icon: '/assets/icons/domain.svg',
  },
]

export default function SelectCategories({ value = [], onChange, disabled, immutable }: SelectCategoriesProps) {
  function renderMenuItem({ value: category, label, icon }: CategoryOption) {
    if (value.includes(category)) return null

    return (
      <MenuItem key={category} onClick={() => onChange && onChange(uniq([...value, category]))}>
        <Avatar src={icon} width="20px" height="20px" marginRight={4} />
        {label}
      </MenuItem>
    )
  }

  function renderValue(category: Category) {
    const option = categoryOptions.find(option => option.value === category)

    if (!option) return

    const { label, icon } = option

    return (
      <Stack
        key={category}
        direction="row"
        alignItems="center"
        borderRadius="10px"
        bg="panel"
        px={2}
        py={1}
        m={1}
        spacing={2}
      >
        <Avatar src={icon} width="20px" height="20px" />
        <Text fontSize="xs" whiteSpace="nowrap">
          {label}
        </Text>
        {!immutable && (
          <CloseButton
            size="sm"
            onClick={() => onChange && onChange(remove([...value], v => v !== category))}
            disabled={disabled}
          />
        )}
      </Stack>
    )
  }

  return (
    <Stack>
      {!immutable && (
        <Menu>
          <MenuButton width="100%" position="relative" disabled={disabled}>
            Select Categories
            <Icon
              as={DefaultIcon}
              w={5}
              h={5}
              position="absolute"
              right="0.5rem"
              top="50%"
              transform="translateY(-50%)"
            />
          </MenuButton>
          <MenuList>{categoryOptions.map(renderMenuItem)}</MenuList>
        </Menu>
      )}
      <Flex wrap="wrap">{value.map(renderValue)}</Flex>
    </Stack>
  )
}
