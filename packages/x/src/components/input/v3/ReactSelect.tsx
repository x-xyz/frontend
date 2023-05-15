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
          color: 'white',
        }),
        control: styles => ({
          ...styles,
          background: getColor(theme, 'panel'),
          border: 'none',
          borderRadius: '0px',
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
        }),
        option: (styles, { isDisabled }) => ({
          ...styles,
          background: getColor(theme, 'panel'),
          color: getColor(theme, 'note'),
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          ':hover': {
            ...styles[':hover'],
            color: isDisabled ? getColor(theme, 'inactive') : getColor(theme, 'text'),
            background: isDisabled ? 'inherit' : getColor(theme, 'primary'),
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
        indicatorSeparator: style => ({ display: 'none', ...style }),
        menuPortal: style => ({ ...style, zIndex: zIndices.popover }),
      }}
      menuPortalTarget={process.browser ? window.document.body : void 0}
      {...props}
    />
  )
}

export default ReactSelect as typeof Select
