import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import matter from 'gray-matter'
import Layout from 'components/Layout/v2'
import components from 'components/MDXProviderComponents'
import { getFirst } from '@x/utils'
import { Box, Grid, Stack, Text } from '@chakra-ui/react'
import Link from 'components/Link'

interface DocInfo {
  name: string
  title?: string
  thumbnail?: string
}

interface Props {
  source: MDXRemoteSerializeResult
  docs: DocInfo[]
}

export const getStaticPaths: GetStaticPaths = () => {
  const filenames = fs.readdirSync(path.join(process.cwd(), 'docs'), { encoding: 'utf-8' })
  return { paths: filenames.map(filename => ({ params: { slug: path.parse(filename).name } })), fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params = {} }) => {
  const slug = getFirst(params.slug)
  if (!slug) return { notFound: true }

  const filename = `${slug}.mdx`
  const file = await fs.promises.readFile(path.join(process.cwd(), 'docs', filename), { encoding: 'utf-8' })
  const { content } = matter(file)
  const source = await serialize(content)

  const filenames = await fs.promises.readdir(path.join(process.cwd(), 'docs'), { encoding: 'utf-8' })
  const docs = await Promise.all(
    filenames
      .filter(f => f != filename)
      .map(async filename => {
        const name = path.parse(filename).name
        const file = await fs.promises.readFile(path.join(process.cwd(), 'docs', filename), { encoding: 'utf-8' })
        const {
          data: { title, thumbnail },
        } = matter(file)
        return { name, title, thumbnail } as DocInfo
      }),
  )

  return { props: { source, docs } }
}

export default function Doc({ source, docs }: Props) {
  return (
    <Layout title="Learn">
      <Grid templateColumns="1fr auto" columnGap={6} pt={6}>
        <Box>
          <MDXRemote {...source} components={components} />
        </Box>
        <Stack direction="column" spacing={6}>
          <Text>You can also read</Text>
          {docs.map(doc => (
            <Link
              key={doc.name}
              variant="container"
              href={`/docs/${doc.name}`}
              textTransform="capitalize"
              overflow="hidden"
              borderRadius="12px"
              h="fit-content"
            >
              <Box w="224px" bg="field">
                {doc.thumbnail && <Box w="100%" h="120px" bg={`url(${doc.thumbnail})`} bgSize="cover" />}
                <Stack p={6} spacing={6}>
                  <Text>{doc.title || doc.name.replace(/-/, ' ')}</Text>
                  <Text textDecoration="underline">Read more</Text>
                </Stack>
              </Box>
            </Link>
          ))}
        </Stack>
      </Grid>
    </Layout>
  )
}
