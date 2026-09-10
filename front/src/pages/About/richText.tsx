import type { ReactNode } from 'react'

const INLINE_PATTERN = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const match = INLINE_PATTERN.exec(remaining)
    if (!match) {
      nodes.push(remaining)
      break
    }
    if (match.index > 0) nodes.push(remaining.slice(0, match.index))
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>)
    } else {
      nodes.push(<em key={key++}>{match[2] ?? match[3]}</em>)
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
 * `*italic*`/`_italic_` -- rendered straight to React elements (never
 * dangerouslySetInnerHTML) so admin-authored body text can't inject markup.
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
