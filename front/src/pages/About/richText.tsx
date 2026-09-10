import type { ReactNode } from 'react'

const INLINE_PATTERN =
  /\*\*(?<bold>.+?)\*\*|\*(?<italic1>.+?)\*|_(?<italic2>.+?)_|<s>(?<strike>.+?)<\/s>|<a\s+href=(["'])(?<href>.*?)\5\s*>(?<linkText>.+?)<\/a>/

function isSafeHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const match = INLINE_PATTERN.exec(remaining)
    if (!match || !match.groups) {
      nodes.push(remaining)
      break
    }
    if (match.index > 0) nodes.push(remaining.slice(0, match.index))
    const { bold, italic1, italic2, strike, href, linkText } = match.groups
    if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>)
    } else if (strike !== undefined) {
      nodes.push(<s key={key++}>{strike}</s>)
    } else if (href !== undefined && linkText !== undefined && isSafeHref(href)) {
      nodes.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer">
          {linkText}
        </a>,
      )
    } else if (href !== undefined && linkText !== undefined) {
      nodes.push(linkText)
    } else {
      nodes.push(<em key={key++}>{italic1 ?? italic2}</em>)
    }
    remaining = remaining.slice(match.index + match[0].length)
  }

  return nodes
}

function renderParagraph(block: string, key: number): ReactNode {
  const lines = block.split('\n')
  return (
    <p key={key}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {parseInline(line)}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
}

/**
 * A hand-rolled subset of markdown -- `#`/`##`/`###`/`####` headings, `**bold**`,
 * `*italic*`/`_italic_`, `<s>strikethrough</s>`, `<a href='https://...'>links</a>` --
 * rendered straight to React elements (never dangerouslySetInnerHTML) so admin-authored
 * body text can't inject markup. Links are only rendered when their href is http(s);
 * anything else falls back to plain text.
 */
export function renderRichText(source: string): ReactNode {
  const normalized = source.replace(/\r\n/g, '\n')
  const blocks = normalized.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

  return (
    <>
      {blocks.map((block, index) => {
        if (block.startsWith('#### ')) return <h5 key={index}>{parseInline(block.slice(5))}</h5>
        if (block.startsWith('### ')) return <h3 key={index}>{parseInline(block.slice(4))}</h3>
        if (block.startsWith('## ')) return <h2 key={index}>{parseInline(block.slice(3))}</h2>
        if (block.startsWith('# ')) return <h1 key={index}>{parseInline(block.slice(2))}</h1>
        return renderParagraph(block, index)
      })}
    </>
  )
}
