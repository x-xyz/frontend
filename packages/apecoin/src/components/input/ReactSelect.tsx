import { useTheme } from '@chakra-ui/system'
import { getColor } from '@chakra-ui/theme-tools'
import Select, { Props, GroupBase } from 'react-select'
import zIndices from 'theme/z-index'

export type { Options, Props } from 'react-select'

function ReactSelect<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ styles, ...props }: Props<Option, IsMulti, Group>) {
  const theme = useTheme()

  return (
    <Select
      menuPlacement="auto"
      styles={{
        ...styles,
        input: styles => ({
          ...styles,
        }),
        control: styles => ({
          ...styles,
          background: getColor(theme, 'reaction'),
          borderColor: getColor(theme, 'primary'),
          borderWidth: 1,
          borderRadius: 0,
          minHeight: 40,
        }),
        multiValue: styles => ({
          ...styles,
          background: getColor(theme, 'panel'),
          borderColor: getColor(theme, 'divider'),
          borderWidth: '1px',
          borderRadius: '6px',
          padding: '4px 8px',
        }),
        multiValueLabel: styles => ({ ...styles, color: getColor(theme, 'text') }),
        singleValue: styles => ({ ...styles, color: getColor(theme, 'text') }),
        menuList: styles => ({
          ...styles,
          background: getColor(theme, 'panel'),
          boxShadow: '0px 15px 25px rgba(87, 81, 101, 0.5)',
        }),
        option: (styles, { isDisabled }) => ({
          ...styles,
          background: getColor(theme, 'panel'),
          color: isDisabled ? getColor(theme, 'inactive') : void 0,
          ':hover': {
            ...styles[':hover'],
            background: getColor(theme, 'whiteAlpha.600'),
          },
          ':focus': {
            ...styles[':focus'],
            background: getColor(theme, 'whiteAlpha.600'),
          },
          ':active': {
            ...styles[':active'],
            background: getColor(theme, 'whiteAlpha.600'),
          },
        }),
        dropdownIndicator: style => ({ ...style, transform: 'scale(0.9)' }),
        indicatorSeparator: style => ({ ...style, backgroundColor: getColor(theme, 'divider') }),
        menuPortal: style => ({ ...style, zIndex: zIndices.popover }),
      }}
      menuPortalTarget={process.browser ? window.document.body : void 0}
      {...props}
    />
  )
}

export default ReactSelect as typeof Select
