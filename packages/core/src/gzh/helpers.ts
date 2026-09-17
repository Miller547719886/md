const LAST_CHAPTER_RE = /结语|写在最后|总结|后记|附录|end$/i

const CHAPTER_EN = [
  `CHAPTER ONE`,
  `CHAPTER TWO`,
  `CHAPTER THREE`,
  `CHAPTER FOUR`,
  `CHAPTER FIVE`,
  `CHAPTER SIX`,
  `CHAPTER SEVEN`,
  `CHAPTER EIGHT`,
  `CHAPTER NINE`,
  `CHAPTER TEN`,
  `CHAPTER ELEVEN`,
  `CHAPTER TWELVE`,
]

export function pad2(n: number): string {
  return String(n).padStart(2, `0`)
}

export function isLastChapterTitle(title: string): boolean {
  return LAST_CHAPTER_RE.test(title.replace(/<[^>]+>/g, ``).trim())
}

export function defaultChapterEnglish(index: number, isLast: boolean): string {
  if (isLast)
    return `POSTSCRIPT`
  return CHAPTER_EN[(index - 1) % CHAPTER_EN.length]
}

export function splitChapterTitle(raw: string): {
  title: string
  english?: string
} {
  const parts = raw.split(/\s*\|\s*/)
  if (parts.length >= 2) {
    return {
      title: parts[0].trim(),
      english: parts.slice(1).join(` | `).trim(),
    }
  }
  return { title: raw.trim() }
}

export function parseH4Kind(raw: string): {
  kind: `step` | `case` | `tool` | `skill` | `plain`
  title: string
} {
  const match = /^(STEP|CASE|TOOL|SKILL)[ \t]+(\S.*)$/i.exec(raw.trim())
  if (!match)
    return { kind: `plain`, title: raw.trim() }
  return {
    kind: match[1].toLowerCase() as `step` | `case` | `tool` | `skill`,
    title: match[2].trim(),
  }
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ``)
}

export function deco(): string {
  return `<span leaf=""><br></span>`
}
