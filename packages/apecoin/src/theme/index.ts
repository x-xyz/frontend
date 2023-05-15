import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import breakpoints from './breakpoints'
import colors from './colors'
import fontSizes from './font-sizes'
import fonts from './fonts'
import sizes from './sizes'
import space from './space'
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
import List from './components/List'
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
import Stat from './components/Stat'
import Switch from './components/Switch'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export default extendTheme({
  config,
  colors,
  fonts,
  breakpoints,
  fontSizes,
  zIndices,
  sizes,
  space,
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
    List,
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
    Stat,
    Switch,
  },
})
