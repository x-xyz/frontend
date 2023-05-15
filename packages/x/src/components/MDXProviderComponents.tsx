import { MDXProviderComponents } from '@mdx-js/react'
import { Heading, HeadingProps, Image, List, ListItem, Text } from '@chakra-ui/react'
import Link from 'components/Link'

function makeHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return (props: HeadingProps) => <Heading as={`h${level}`} mb={8} {...props} />
}

const components: MDXProviderComponents = {
  h1: makeHeading(1),
  h2: makeHeading(2),
  h3: makeHeading(3),
  h4: makeHeading(4),
  h5: makeHeading(5),
  h6: makeHeading(6),
  p: props => <Text my={4} {...props} />,
  img: props => <Image borderRadius="12px" {...props} />,
  ol: props => <List listStyleType="decimal" pl={6} {...props} />,
  ul: props => <List listStyleType="initial" pl={6} {...props} />,
  li: props => <ListItem my={2} {...props} />,
  a: props => <Link textDecoration="underline" {...props} />,
}

export default components
