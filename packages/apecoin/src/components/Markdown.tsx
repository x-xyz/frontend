import ReactMarkdown, { Options } from 'react-markdown'
import Link from 'components/Link'

export type MarkdownProps = Options

export default function Markdown({ children, components = {}, ...props }: MarkdownProps) {
  return (
    <ReactMarkdown
      {...props}
      components={{ a: ({ children, ...props }) => <Link {...props}>{children}</Link>, ...components }}
    >
      {children}
    </ReactMarkdown>
  )
}
