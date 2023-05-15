import { GetStaticProps } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Layout from 'components/Layout/v2'
import Link from 'components/Link'
import { Box, Center, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import GradientBox from 'components/GradientBox'

interface DocInfo {
  name: string
  title?: string
  thumbnail?: string
}

interface Props {
  docs: DocInfo[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const filenames = await fs.promises.readdir(path.join(process.cwd(), 'docs'), { encoding: 'utf-8' })
  const docs = await Promise.all(
    filenames.map(async filename => {
      const name = path.parse(filename).name
      const file = await fs.promises.readFile(path.join(process.cwd(), 'docs', filename), { encoding: 'utf-8' })
      const {
        data: { title, thumbnail },
      } = matter(file)
      return { name, title, thumbnail } as DocInfo
    }),
  )

  return { props: { docs } }
}

export default function Index({ docs }: Props) {
  function renderThumbnail(thumbnail: string) {
    if (/^https?:\/\//.test(thumbnail)) {
      return <Box w="100%" h="200px" bg={`url(${thumbnail})`} bgSize="cover" />
    }

    const matchGradientText = /^gradient-box\((.+)\)/.exec(thumbnail)

    if (matchGradientText) {
      const [, text] = matchGradientText
      return (
        <GradientBox w="100%" h="200px">
          <Center w="100%" h="100%">
            <Text fontSize="4xl" fontWeight="medium">
              {text}
            </Text>
          </Center>
        </GradientBox>
      )
    }
  }

  return (
    <Layout title="Learn">
      <Heading my={12}>X Marketplace Knowledge Center</Heading>
      <Flex wrap="wrap" justify="center">
        {docs.map(doc => (
          <Link
            key={doc.name}
            variant="container"
            href={`/docs/${doc.name}`}
            textTransform="capitalize"
            m={4}
            overflow="hidden"
            borderRadius="12px"
            h="fit-content"
          >
            <Box w="374px" bg="field">
              {doc.thumbnail && renderThumbnail(doc.thumbnail)}
              <Stack p={6} spacing={6}>
                <Text>{doc.title || doc.name.replace(/-/, ' ')}</Text>
                <Text textDecoration="underline">Read more</Text>
              </Stack>
            </Box>
          </Link>
        ))}
      </Flex>
    </Layout>
  )
}
