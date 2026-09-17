import type { MarkedExtension } from 'marked'
import { getGzhComponents } from '../gzh/context'
import { isLastChapterTitle, splitChapterTitle } from '../gzh/helpers'

/**
 * marked 插件：支持 [TOC] 语法，自动生成嵌套目录
 */
export function markedToc(): MarkedExtension {
  let headings: { text: string, depth: number, index: number }[] = []

  return {
    hooks: {
      preprocess(markdown: string) {
        headings = []
        return markdown
      },
    },
    walkTokens(token) {
      if (token.type === `heading`) {
        const text = token.text || ``
        const depth = token.depth || 1
        const index = headings.length
        headings.push({ text, depth, index })
      }
    },
    extensions: [
      {
        name: `toc`,
        level: `block`,
        start(src) {
          // 只匹配独立一行的 [TOC]，避免误伤
          const match = src.match(/^\s*\[TOC\]\s*$/m)
          return match ? match.index : undefined
        },
        tokenizer(src) {
          const match = /^\[TOC\]/.exec(src)
          if (match) {
            return {
              type: `toc`,
              raw: match[0],
            }
          }
        },
        renderer() {
          const gzh = getGzhComponents()
          if (gzh) {
            const h2s = headings.filter(h => h.depth === 2)
            if (h2s.length < 2)
              return ``
            return gzh.toc(
              h2s.map((h, i) => {
                const { title } = splitChapterTitle(h.text)
                return {
                  title,
                  index: i + 1,
                  isLast: i === h2s.length - 1 || isLastChapterTitle(title),
                }
              }),
            )
          }
          if (!headings.length)
            return ``
          let html = `<nav class="markdown-toc"><ul class="toc-ul toc-level-1 pl-4 border-l ml-2">`
          let lastDepth = 1
          headings.forEach(({ text, depth, index }) => {
            if (depth > lastDepth) {
              for (let i = lastDepth + 1; i <= depth; i++) {
                html += `<ul class="toc-ul toc-level-${i} pl-4 border-l ml-2">`
              }
            }
            else if (depth < lastDepth) {
              for (let i = lastDepth; i > depth; i--) {
                html += `</ul>`
              }
            }
            html += `<li class="toc-li toc-level-${depth} mb-1"><a class="text-gray-700 hover:text-blue-600 underline transition-colors" href="#${index}">${text}</a></li>`
            lastDepth = depth
          })

          for (let i = lastDepth; i > 1; i--) {
            html += `</ul>`
          }

          html += `</ul></nav>`

          return html
        },
      },
    ],
  }
}
