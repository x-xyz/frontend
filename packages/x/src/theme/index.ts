import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import breakpoints from './breakpoints'
import colors from './colors'
import fontSizes from './font-sizes'
import sizes from './sizes'
import space from './space'
import styles from './styles'
import zIndices from './z-index'
import Accordion from './components/Accordion'
import Alert from './components/Alert'
import Avatar from './components/Avatar'
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
import Tooltip from './components/Tooltip'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export const layout = {
  headerHeight: '96px',
  sidebarWidth: '96px',
  globalPadding: { base: 2, md: 6 },
  offsetPadding: { base: -2, md: -6 },
}

export default extendTheme({
  config,
  colors,
  fonts: {
    // body: `'Montserrat', sans-serif`,
    body: `'Poppins', sans-serif`,
    heading: `'Poppins', sans-serif`,
  },
  breakpoints,
  fontSizes,
  textStyles: {
    compactContent: {
      fontSize: 'sm',
      lineHeight: '4',
    },
  },
  zIndices,
  sizes,
  space,
  styles,
  components: {
    Accordion,
    Alert,
    Avatar,
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
    Tooltip,
  },
})
