import type { MarkedExtension } from 'marked'
import { getGzhComponents } from '../gzh/context'

export function markedGzhMarks(): MarkedExtension {
  return {
    extensions: [
      {
        name: `gzhHighlight`,
        level: `inline`,
        start(src: string) {
          const i = src.indexOf(`==`)
          return i < 0 ? undefined : i
        },
        tokenizer(src: string) {
          const match = /^==([^=\n]+)==/.exec(src)
          if (!match)
            return undefined
          return {
            type: `gzhHighlight`,
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
          }
        },
        renderer(token: { tokens?: unknown[] }) {
          const inner = this.parser.parseInline(token.tokens as never)
          const gzh = getGzhComponents()
          return gzh ? gzh.highlight(inner) : `<mark>${inner}</mark>`
        },
      },
      {
        name: `gzhUnderline`,
        level: `inline`,
        start(src: string) {
          const i = src.indexOf(`++`)
          return i < 0 ? undefined : i
        },
        tokenizer(src: string) {
          const match = /^\+\+(.+?)\+\+/.exec(src)
          if (!match)
            return undefined
          return {
            type: `gzhUnderline`,
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
          }
        },
        renderer(token: { tokens?: unknown[] }) {
          const inner = this.parser.parseInline(token.tokens as never)
          const gzh = getGzhComponents()
          return gzh ? gzh.underline(inner) : `<u>${inner}</u>`
        },
      },
    ],
  }
}
