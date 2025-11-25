import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import * as prettierPluginMarkdown from 'prettier/plugins/markdown'
import * as prettierPluginCss from 'prettier/plugins/postcss'
import { format } from 'prettier/standalone'
import { addSpacingToMarkdown } from './autoSpace'

/**
 * 为自然段之间自动补充空行，使 Markdown 渲染为独立段落
 * - 跳过代码块、列表、标题等结构，避免破坏语义
 */
function addBlankLineBetweenParagraphs(content: string): string {
  const lines = content.split(/\r?\n/)
  const result: string[] = []

  let inFence = false

  const isParagraphLine = (line: string) => {
    if (!line)
      return false

    const trimmed = line.trimStart()

    // 跳过标题、列表、引用、表格、HR、HTML、缩进代码
    if (/^#{1,6}\s/.test(trimmed))
      return false
    if (/^[\-*+]\s+/.test(trimmed))
      return false
    if (/^\d+\.\s+/.test(trimmed))
      return false
    if (/^>\s?/.test(trimmed))
      return false
    if (/^\|/.test(trimmed))
      return false
    if (/^(?:---|\*\*\*|___)$/.test(trimmed))
      return false
    if (/^<\/?[a-z]/i.test(trimmed))
      return false
    if (/^\s{4,}/.test(line))
      return false

    return true
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    const isFence = /^```|^~~~/.test(trimmed)

    result.push(line)

    if (isFence)
      inFence = !inFence

    if (inFence)
      return

    if (trimmed === ``)
      return

    const nextLine = lines[index + 1]
    if (nextLine === undefined)
      return

    const nextTrimmed = nextLine.trim()
    if (nextTrimmed === ``)
      return

    if (isParagraphLine(trimmed) && isParagraphLine(nextTrimmed))
      result.push(``)
  })

  return result.join(`\n`)
}

/**
 * 通用文件下载函数
 * @param content - 文件内容
 * @param filename - 文件名
 * @param mimeType - MIME 类型，默认为 text/plain
 */
export function downloadFile(content: string, filename: string, mimeType: string = `text/plain`) {
  if (typeof document === `undefined`) {
    throw new TypeError(`downloadFile can only be used in browser environment`)
  }

  const downLink = document.createElement(`a`)
  downLink.download = filename
  downLink.style.display = `none`

  // 检查是否是 base64 data URL
  if (content.startsWith(`data:`)) {
    downLink.href = content
  }
  else if (mimeType === `text/html`) {
    downLink.href = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`
  }
  else {
    const blob = new Blob([content], { type: mimeType })
    downLink.href = URL.createObjectURL(blob)
  }

  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)

  // 如果是 blob URL，释放内存
  if (!content.startsWith(`data:`) && mimeType !== `text/html`) {
    URL.revokeObjectURL(downLink.href)
  }
}

/**
 * 将文件转换为 Base64 格式
 * @param file - 要转换的文件
 * @returns Base64 字符串的 Promise
 */
export function toBase64(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(`,`).pop()!)
    reader.onerror = error => reject(error)
  })
}

/**
 * 根据数据生成 Markdown 表格
 * @param options - 表格选项
 * @param options.data - 表格数据对象
 * @param options.rows - 表格行数
 * @param options.cols - 表格列数
 * @returns 生成的 Markdown 表格字符串
 */
export function createTable({ data, rows, cols }: {
  data: { [k: string]: string }
  rows: number
  cols: number
}): string {
  let table = ``
  for (let i = 0; i < rows + 2; ++i) {
    table += `| `
    const currRow = []
    for (let j = 0; j < cols; ++j) {
      const rowIdx = i > 1 ? i - 1 : i
      currRow.push(i === 1 ? `---` : data[`k_${rowIdx}_${j}`] || `     `)
    }
    table += currRow.join(` | `)
    table += ` |\n`
  }

  return table
}

/**
 * 格式化文档内容
 * @param content - 要格式化的内容
 * @param type - 内容类型，决定使用的解析器，默认为 'markdown'
 * @returns 格式化后的内容
 */
export async function formatDoc(content: string, type: `markdown` | `css` = `markdown`): Promise<string> {
  const plugins = {
    markdown: [prettierPluginMarkdown, prettierPluginBabel, prettierPluginEstree],
    css: [prettierPluginCss],
  }

  // 先为自然段插入空行，保证格式化后段落分隔清晰
  const contentWithParagraphBreak = addBlankLineBetweenParagraphs(content)
  const addSpaceContent = await addSpacingToMarkdown(contentWithParagraphBreak)

  const parser = type in plugins ? type : `markdown`
  return await format(addSpaceContent, {
    parser,
    plugins: plugins[parser] as any,
  })
}
