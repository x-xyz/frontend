import { Box } from '@chakra-ui/react'
import { styled, BorderProps, LayoutProps } from '@chakra-ui/system'
import { forwardRef } from 'react'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FaCaretDown } from 'react-icons/fa'
import CaretDown from './icons/CaretDown'

const StyledDatePicker = styled(ReactDatePicker)

export type DatePickerProps = ReactDatePickerProps & LayoutProps & BorderProps

function DatePicker(props: DatePickerProps, ref: React.ForwardedRef<any>) {
  return (
    <Box
      sx={{
        '.react-datepicker': {
          background: '#1E1E1E',
          borderColor: '#575757',
        },
        '.react-datepicker__header': {
          background: 'none',
          border: 'none',
        },
        '.react-datepicker__current-month': {
          color: 'white',
        },
        '.react-datepicker-time__header': {
          color: 'white',
        },
        '.react-datepicker__time': {
          color: 'white',
          background: 'none',
        },
        '.react-datepicker__time-container': {
          borderColor: '#575757',
        },
        '.react-datepicker__time-list-item': {
          '&:hover': {
            background: 'unset !important',
            color: '#abae38 !important',
          },
        },
        '.react-datepicker__time-list-item--selected': {
          backgroundColor: 'unset !important',
          color: '#abae38 !important',
        },
        '.react-datepicker__day': {
          color: 'white',
          '&.react-datepicker__day--disabled': {
            color: '#898989',
          },
          '&.react-datepicker__day--today': {},
          '&:hover': {
            backgroundColor: 'unset',
            color: 'primary',
          },
        },
        '.react-datepicker__day--selected': {
          backgroundColor: 'unset',
          color: 'primary',
        },
        '.react-datepicker-time__input': {
          background: 'none',
          color: 'white',
        },
        '.react-datepicker-time__caption': {
          color: 'white',
        },
        '.react-datepicker__day-name': {
          color: '#898989',
        },
        '.react-datepicker__input-time-container': {
          borderTopColor: '#575757',
          borderTopWidth: '1px',
          margin: 0,
          padding: '5px 0 10px 15px',
        },
        '.react-datepicker__navigation-icon': {
          top: '6px',
        },
        position: 'relative',
      }}
    >
      <StyledDatePicker
        ref={ref}
        borderColor="divider"
        borderWidth="1px"
        borderRadius="0px"
        background="panel"
        px={4}
        _disabled={{ color: 'gray.600' }}
        autoComplete="off"
        {...props}
      />
      <CaretDown position="absolute" right="8" top="2" pointerEvents="none" />
    </Box>
  )
}

export default forwardRef<any, DatePickerProps>(DatePicker)
