import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import breakpoints from './breakpoints'
import styles from './styles'
import zIndices from './z-index'
import Accordion from './components/Accordion'
import Alert from './components/Alert'
import Avatar from './components/Avatar'
import Badge from './components/Badge'
import Button from './components/Button'
import Checkbox from './components/Checkbox'
import Divider from './components/Divider'
import Drawer from './components/Drawer'
import { Form, FormLabel } from './components/Form'
import Heading from './components/Heading'
import Input from './components/Input'
import Link from './components/Link'
import Modal from './components/Modal'
import Menu from './components/Menu'
import Popover from './components/Popover'
import Radio from './components/Radio'
import Select from './components/Select'
import Table from './components/Table'
import Tabs from './components/Tabs'
import Text from './components/Text'
import Textarea from './components/Textarea'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export const layout = {
  headerHeight: '72px',
  globalPadding: { base: 2, md: 6 },
  offsetPadding: { base: -2, md: -6 },
}

export default extendTheme({
  config,
  colors: {
    background: '#0c0c0c',
    primary: '#7ffffd',
    text: 'white',
    inactive: '#89a1a1',
    danger: '#dc5656',
    divider: '#3d5a5a',
    panel: '#021d1b',
  },
  fonts: {
    body: `'Work Sans', sans-serif`,
    heading: `'Dela Gothic One', cursive`,
  },
  breakpoints,
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.75rem',
    '4xl': '2rem',
    '5xl': '3rem',
  },
  zIndices,
  styles,
  components: {
    Accordion,
    Alert,
    Avatar,
    Badge,
    Button,
    Checkbox,
    Divider,
    Drawer,
    Form,
    FormLabel,
    Heading,
    Input,
    Link,
    Modal,
    Menu,
    Popover,
    Radio,
    Select,
    Tabs,
    Table,
    Text,
    Textarea,
  },
})
