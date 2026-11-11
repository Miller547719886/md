export const GZH_THEME_IDS = [
  `zenWhitespace`,
  `moyuGreen`,
  `redWhite`,
  `graphiteMinimal`,
  `moyuTicket`,
  `oliveJournal`,
] as const

export type GzhThemeId = (typeof GZH_THEME_IDS)[number]

export const CLASSIC_THEME_IDS = [`default`, `grace`, `simple`] as const

export type ClassicThemeId = (typeof CLASSIC_THEME_IDS)[number]

export type ThemeId = GzhThemeId | ClassicThemeId

export interface GzhTokens {
  id: GzhThemeId
  name: string
  desc: string
  primary: string
  primaryDeep: string
  primaryLight: string
  primaryBg: string
  accent: string
  underline: string
  highlightBg: string
  title: string
  body: string
  muted: string
  faint: string
  line: string
  bg: string
  paper: string
  fontSize: string
  lineHeight: string
  letterSpacing: string
  maxWidth: string
  padX: string
  /** @deprecated Generated content now uses titleFont; kept as a compatibility alias. */
  fontFamily: string
  titleFont: string
  underlineCss: string
}

export interface GzhCoverMeta {
  eyebrow?: string
  date?: string
  subtitle?: string
  author?: string
  strike?: string
  highlight?: string
}

export interface GzhTocItem {
  title: string
  index: number
  isLast: boolean
}

export interface GzhChapterOpts {
  index: number
  title: string
  english?: string
  isLast: boolean
  isFirst: boolean
}

export type GzhH4Kind = `step` | `case` | `tool` | `skill` | `plain`

export interface GzhComponents {
  container: (inner: string) => string
  h1: (html: string, meta?: GzhCoverMeta) => string
  intro: (html: string, author?: string) => string
  toc: (items: GzhTocItem[]) => string
  chapter: (opts: GzhChapterOpts) => string
  h3: (html: string) => string
  h4: (html: string, kind: GzhH4Kind, index: number) => string
  paragraph: (html: string) => string
  strong: (html: string) => string
  highlight: (html: string) => string
  underline: (html: string) => string
  strike: (html: string) => string
  codespan: (html: string) => string
  quote: (html: string) => string
  tip: (html: string, variant: string, title: string) => string
  codeBlock: (lines: string[], lang: string) => string
  image: (src: string, caption: string, isGif: boolean) => string
  list: (ordered: boolean, items: string[]) => string
  listitem: (index: number, ordered: boolean, content: string) => string
  table: (header: string[], rows: string[][]) => string
  hr: () => string
  footer: () => string
  link: (href: string, html: string, title?: string) => string
}
