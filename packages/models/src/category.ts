export enum Category {
  All = -1,
  Art,
  Collectibles,
  Sports,
  Utility,
  TradingCards,
  VirtualWorlds,
  DomainNames,
  Max,
}

export function toCategory(value: string): Category {
  const num = parseInt(value, 10)
  if (num < Category.Max) return num
  return Category.All
}

export function toCategories(values: string[]): Category[] {
  return values.map(parseFloat).filter(value => value < Category.Max)
}

export interface CategoryOption {
  value: Category
  label: string
  icon?: string
}

export const categoryOptions: CategoryOption[] = [
  { value: Category.All, label: 'All' },
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

export function getCategoryName(value: Category): string {
  return categoryOptions.find(co => co.value === value)?.label || 'Unknown'
}
