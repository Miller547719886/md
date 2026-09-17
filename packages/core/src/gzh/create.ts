import type {
  GzhComponents,
  GzhCoverMeta,
  GzhThemeId,
  GzhTokens,
} from '@md/shared/gzh'
import { getGzhTokens } from '@md/shared/gzh'
import {
  ctaIcons,
  sharedCodeBlock,
  sharedH4,
  sharedImage,
  sharedList,
  sharedTable,
} from './common'
import { deco, defaultChapterEnglish, pad2 } from './helpers'

function base(t: GzhTokens, layout: GzhThemeId): GzhComponents {
  const container = (inner: string) =>
    `<section style="max-width:${t.maxWidth};margin:0 auto;background:${t.bg};font-family:${t.fontFamily};color:${t.body};line-height:${t.lineHeight};letter-spacing:${t.letterSpacing};overflow-x:hidden;">${inner}</section>`

  const paragraph = (html: string) =>
    `<p style="margin:0 0 26px;font-size:${t.fontSize};line-height:${t.lineHeight};text-align:justify;color:${t.body};padding:0 ${t.padX};">${html}</p>`

  const strong = (html: string) =>
    `<strong style="color:${t.title};">${html}</strong>`

  const highlight = (html: string) =>
    `<span style="background:${t.highlightBg};color:${t.primaryDeep};padding:2px 6px;border-radius:2px;font-weight:600;">${html}</span>`

  const underline = (html: string) =>
    `<span style="${t.underlineCss}">${html}</span>`

  const strike = (html: string) =>
    layout === `zenWhitespace`
      ? `<span style="background:linear-gradient(180deg,transparent 60%,${t.accent} 60%);font-weight:600;color:${t.title};">${html}</span>`
      : `<span style="background:${t.faint};color:${t.muted};padding:2px 6px;border-radius:4px;text-decoration:line-through;font-weight:600;">${html}</span>`

  const codespan = (html: string) =>
    `<span style="background:${t.primaryBg};color:${t.primary};padding:1px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;">${html}</span>`

  const link = (_href: string, html: string, _title?: string) =>
    `<span style="color:${t.primary};border-bottom:1px solid ${t.primaryLight};">${html}</span>`

  const h4: GzhComponents[`h4`] = (html, kind, index) =>
    sharedH4(t, html, kind, index)

  const image: GzhComponents[`image`] = (src, caption, isGif) =>
    sharedImage(t, src, caption, isGif)
  const table: GzhComponents[`table`] = (header, rows) =>
    sharedTable(t, header, rows)
  const list: GzhComponents[`list`] = (ordered, items) =>
    sharedList(t, ordered, items)
  const listitem: GzhComponents[`listitem`] = (_index, _ordered, content) =>
    content
  const codeBlock: GzhComponents[`codeBlock`] = (lines, lang) =>
    sharedCodeBlock(t, lines, lang)

  const tip: GzhComponents[`tip`] = (html, _variant, title) =>
    `<section style="margin:0 ${t.padX} 32px;padding:18px 20px;border-left:2px solid ${t.primary};">
      <p style="font-size:10px;color:${t.primary};font-weight:600;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">${title || `NOTE`}</p>
      <p style="font-size:14px;color:${t.body};margin:0;line-height:1.9;">${html}</p>
    </section>`

  return {
    container,
    paragraph,
    strong,
    highlight,
    underline,
    strike,
    codespan,
    link,
    h4,
    image,
    table,
    list,
    listitem,
    codeBlock,
    tip,
    h1: () => ``,
    intro: () => ``,
    toc: () => ``,
    chapter: () => ``,
    h3: () => ``,
    quote: () => ``,
    hr: () => ``,
    footer: () => ``,
  }
}

function zen(t: GzhTokens): GzhComponents {
  const b = base(t, `zenWhitespace`)
  return {
    ...b,
    h1(html, meta?: GzhCoverMeta) {
      const sub = meta?.subtitle
        ? `<p style="font-size:13px;color:${t.muted};margin:12px 0 0;letter-spacing:1px;">${meta.subtitle}</p>`
        : ``
      const eye = meta?.eyebrow
        ? `<p style="font-size:10px;color:${t.primary};font-weight:600;letter-spacing:4px;margin:0 0 12px;text-transform:uppercase;">${meta.eyebrow}</p>`
        : ``
      return `<section style="margin:32px ${t.padX} 40px;padding:36px 8px;border-top:1px solid ${t.line};border-bottom:1px solid ${t.line};text-align:center;">
        ${eye}
        <h1 data-heading="true" style="font-family:${t.titleFont};font-size:24px;font-weight:700;color:${t.title};margin:0;letter-spacing:0.5px;line-height:1.4;">${html}</h1>
        ${sub}
      </section>`
    },
    intro(html, author) {
      const sign = author
        ? `<p style="font-size:12px;color:${t.muted};margin:0;letter-spacing:1.5px;">—— ${author}</p>`
        : ``
      return `<section style="margin:32px ${t.padX} 48px;padding:40px 24px;border-top:1px solid ${t.line};border-bottom:1px solid ${t.line};text-align:center;">
        <p style="font-family:${t.titleFont};font-size:19px;font-weight:600;color:${t.title};margin:0 0 28px;line-height:1.85;letter-spacing:0.8px;">${html}</p>
        ${sign}
      </section>`
    },
    toc(items) {
      const cells = items
        .map((item, i) => {
          const last = i === items.length - 1
          const border = last
            ? ``
            : `border-right:1px solid ${t.line};margin-right:16px;`
          return `<section style="flex:1;padding:18px 12px 18px 0;border-bottom:1px solid ${t.line};${border}">
          <p style="font-size:11px;color:${t.primary};font-weight:600;margin:0 0 6px;letter-spacing:1px;">${item.isLast ? `∞` : pad2(item.index)}</p>
          <p style="font-size:13px;color:${t.title};margin:0;font-weight:500;line-height:1.5;">${item.title}</p>
        </section>`
        })
        .join(``)
      return `<section style="padding:0 ${t.padX} 48px;">
        <p style="font-size:11px;color:${t.muted};margin:0 0 20px;letter-spacing:2px;text-transform:uppercase;">本文脉络</p>
        <section style="border-top:1px solid ${t.line};"><section style="display:flex;">${cells}</section></section>
      </section>`
    },
    chapter({ index, title, english, isLast, isFirst }) {
      const label = isLast
        ? `∞ · POSTSCRIPT`
        : `${pad2(index)} · ${english || defaultChapterEnglish(index, false)}`
      const mt = isFirst ? `24px` : `64px`
      return `<section style="margin-top:${mt};margin-bottom:32px;padding:0 ${t.padX};">
        <p style="font-size:10px;color:${t.primary};font-weight:600;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;">${label}</p>
        <h2 data-heading="true" style="font-family:${t.titleFont};font-size:22px;font-weight:700;color:${t.title};margin:0 0 16px;letter-spacing:0.5px;line-height:1.4;">${title}</h2>
        <section style="width:40px;height:2px;background:${t.primary};">${deco()}</section>
      </section>`
    },
    h3(html) {
      return `<p style="font-size:16px;font-weight:800;color:${t.title};margin:28px ${t.padX} 14px;line-height:1.5;border-left:3px solid ${t.primary};padding-left:12px;">${html}</p>`
    },
    quote(html) {
      return `<section style="margin:40px ${t.padX};padding:36px 20px;border-top:1px solid ${t.line};border-bottom:1px solid ${t.line};text-align:center;">
        <p style="font-family:${t.titleFont};font-size:17px;font-weight:600;color:${t.title};margin:0;line-height:1.9;letter-spacing:0.8px;">${html}</p>
      </section>`
    },
    hr() {
      return `<section style="padding:0 ${t.padX};"><section style="height:1px;background:${t.line};margin:64px 0 0;">${deco()}</section></section>`
    },
    footer(author) {
      const name = author || `作者`
      return `<section style="padding:0 ${t.padX};">
        <section style="text-align:center;margin:48px 0 40px;">
          <section style="display:flex;align-items:center;justify-content:center;">
            <span style="height:1px;width:48px;background:${t.line};margin-right:16px;">${deco()}</span>
            <span style="font-size:10px;color:${t.muted};letter-spacing:4px;">END</span>
            <span style="height:1px;width:48px;background:${t.line};margin-left:16px;">${deco()}</span>
          </section>
        </section>
      </section>
      <section style="padding:0 ${t.padX} 40px;">
        <p style="margin-bottom:26px;font-size:15px;line-height:1.9;text-align:justify;color:${t.body};">我是 ${name}。</p>
        <p style="margin-bottom:26px;font-size:15px;line-height:1.9;text-align:justify;color:${t.body};">如果你觉得今天这篇有收获，欢迎<strong style="color:${t.primary};">点赞、在看、转发</strong>三连，我们下篇见。</p>
      </section>`
    },
  }
}

function moyuGreen(t: GzhTokens): GzhComponents {
  const b = base(t, `moyuGreen`)
  return {
    ...b,
    h1(html, meta?: GzhCoverMeta) {
      const eye = meta?.eyebrow || `ESSAY`
      const date = meta?.date || ``
      const strike = meta?.strike
        ? `<p style="font-size:15px;color:${t.muted};margin:0 0 6px;text-decoration:line-through;">${meta.strike}</p>`
        : ``
      const sub = meta?.subtitle
        ? `<p style="font-size:13px;color:${t.muted};margin:0;line-height:1.7;">${meta.subtitle}</p>`
        : ``
      return `<section style="margin:0 0 32px;background:#fff;border:1.5px solid rgba(5,150,105,0.15);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:100%;">
        <section style="padding:32px 28px 28px;">
          <section style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
            <span style="width:6px;height:6px;background:${t.primary};border-radius:50%;">${deco()}</span>
            <span style="font-size:11px;font-weight:700;letter-spacing:3px;color:${t.primary};">${eye}</span>
            <section style="flex:1;height:1px;overflow:hidden;background:linear-gradient(to right,rgba(5,150,105,0.12),transparent);">${deco()}</section>
            <span style="font-size:10px;color:${t.muted};font-weight:600;">${date}</span>
          </section>
          ${strike}
          <h1 data-heading="true" style="font-size:24px;font-weight:900;color:${t.title};margin:0 0 16px;line-height:1.15;">${html}</h1>
          <section style="width:48px;height:3px;background:linear-gradient(to right,${t.primary},#34D399);border-radius:2px;margin-bottom:12px;">${deco()}</section>
          ${sub}
        </section>
        <section style="background:linear-gradient(135deg,#059669,#10B981);padding:12px 28px;">
          <p style="font-size:12px;color:rgba(255,255,255,0.9);margin:0;font-weight:600;">${meta?.author || ``}</p>
        </section>
      </section>`
    },
    intro(html) {
      return `<section style="background:#FFF;border:1px dashed ${t.primaryLight};border-radius:8px;padding:14px 16px;margin:0 ${t.padX} 24px;text-align:center;">
        <p style="margin:0;line-height:1.6;"><span style="font-size:15px;color:${t.primary};font-weight:bold;border-bottom:3px solid ${t.accent};padding-bottom:2px;">${html}</span></p>
      </section>`
    },
    toc(items) {
      const cards = items
        .map((item, i) => {
          const active = i === 0
          const bg = active
            ? `background:linear-gradient(135deg,#059669,#10B981);`
            : `background:#fff;border:1px solid ${t.line};box-shadow:0 2px 6px rgba(0,0,0,0.04);`
          const c1 = active ? `rgba(255,255,255,0.7)` : t.muted
          const c2 = active ? `#fff` : t.title
          return `<section style="display:inline-block;white-space:normal;vertical-align:top;width:110px;${bg}border-radius:12px;padding:12px;margin-right:8px;">
          <p style="font-size:9px;font-weight:700;color:${c1};letter-spacing:1px;margin:0 0 5px;">${item.isLast ? `PART ///` : `PART ${pad2(item.index)}`}</p>
          <p style="font-size:13px;font-weight:800;color:${c2};margin:0;">${item.title}</p>
        </section>`
        })
        .join(``)
      return `<section style="margin:0 ${t.padX} 32px;">
        <p style="font-size:10px;color:${t.muted};margin:0 0 10px;letter-spacing:2px;font-weight:600;">📦 ${items.length} Parts</p>
        <section style="overflow-x:scroll;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:8px;">${cards}</section>
      </section>`
    },
    chapter({ index, title, english, isLast, isFirst }) {
      const num = isLast ? `///` : pad2(index)
      const part = isLast ? `LAST` : `PART`
      const mt = isFirst ? `16px` : `48px`
      return `<section style="margin-top:${mt};margin-bottom:32px;padding:0 ${t.padX};">
        <section style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
          <section style="text-align:center;flex-shrink:0;">
            <p style="margin:0;font-size:28px;font-weight:900;color:${t.primary};line-height:1;letter-spacing:-2px;">${num}</p>
            <p style="margin:0;font-size:8px;font-weight:700;color:${t.muted};letter-spacing:2px;">${part}</p>
          </section>
          <span style="width:1px;height:36px;background:${t.line};flex-shrink:0;">${deco()}</span>
          <section>
            <h2 data-heading="true" style="margin:0 0 1px;font-size:17px;font-weight:900;color:${t.title};">${title}</h2>
            <p style="margin:0;font-size:11px;font-weight:600;color:${t.muted};letter-spacing:1.5px;">${english || defaultChapterEnglish(index, isLast)}</p>
          </section>
        </section>
      </section>`
    },
    h3(html) {
      return `<p style="font-size:15px;font-weight:900;color:${t.title};margin:32px ${t.padX} 16px;">
        <span style="background:linear-gradient(180deg,transparent 65%,${t.accent} 65%);padding:0 4px;">${html}</span>
      </p>`
    },
    quote(html) {
      return `<section style="background:${t.paper};border:1px dashed ${t.line};border-radius:8px;padding:12px 16px;margin:0 ${t.padX} 24px;">
        <p style="font-size:13px;color:${t.body};margin:0;line-height:1.6;">${html}</p>
      </section>`
    },
    hr() {
      return `<section style="padding:0 ${t.padX};"><section style="height:1px;background:linear-gradient(to right,transparent,${t.primaryLight},${t.primary},${t.primaryLight},transparent);margin:32px 0;">${deco()}</section></section>`
    },
    footer() {
      const icons = ctaIcons()
      return `<section style="background:radial-gradient(circle at center,#F9FAFB 0%,#FFFFFF 100%);border:1px solid ${t.line};border-radius:16px;padding:32px 20px;text-align:center;margin:0 0 24px;">
        <p style="font-size:13px;font-weight:bold;color:${t.title};margin-bottom:20px;">既然看到这里了，如果觉得有用，随手点个赞、在看、转发三连吧。</p>
        <section style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
          <section style="text-align:center;color:${t.body};"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#fff;border-radius:12px;border:1px solid ${t.faint};">${icons.like}</section><span style="font-size:10px;font-weight:600;">点赞</span></section>
          <section style="text-align:center;color:${t.body};"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#fff;border-radius:12px;border:1px solid ${t.faint};">${icons.view}</section><span style="font-size:10px;font-weight:600;">在看</span></section>
          <section style="text-align:center;color:${t.primary};"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:${t.primaryBg};border-radius:12px;border:1px solid ${t.primaryLight};">${icons.share}</section><span style="font-size:10px;font-weight:600;">转发</span></section>
        </section>
        <p style="font-size:10px;color:${t.muted};letter-spacing:1px;margin:0;">THANKS FOR READING</p>
      </section>`
    },
  }
}

function redWhite(t: GzhTokens): GzhComponents {
  const b = base(t, `redWhite`)
  return {
    ...b,
    h1(html) {
      return `<section style="margin:10px ${t.padX} 28px;padding-bottom:14px;border-bottom:3px solid ${t.primary};">
        <h1 data-heading="true" style="font-size:22px;font-weight:800;color:${t.title};margin:0;">${html}</h1>
      </section>`
    },
    intro(html, author) {
      const sign = author
        ? `<p style="text-align:right;font-size:12px;color:${t.muted};margin:8px 0 0;">—— ${author}</p>`
        : ``
      return `<section style="margin:10px ${t.padX} 32px;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px -4px rgba(220,38,38,0.15);padding:28px 24px 22px;">
        <p style="font-size:42px;color:${t.primary};font-weight:900;margin:0;line-height:0.6;">"</p>
        <p style="font-size:16px;font-weight:800;color:${t.title};margin:12px 0 8px;line-height:1.75;">${html}</p>
        ${sign}
      </section>`
    },
    toc(items) {
      const cards = items
        .map(
          item =>
            `<section style="flex:1;background:${t.primaryBg};border-radius:10px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid ${t.accent};">
          <p style="display:inline-block;background:${t.primary};color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;">${item.isLast ? `∞` : pad2(item.index)}</p>
          <p style="font-size:13px;font-weight:700;color:${t.title};margin:0;">${item.title}</p>
        </section>`,
        )
        .join(``)
      return `<section style="margin:0 ${t.padX} 32px;"><p style="font-size:13px;margin:0 0 12px;">📌 本文看点</p><section style="display:flex;justify-content:space-between;">${cards}</section></section>`
    },
    chapter({ index, title, english, isLast, isFirst }) {
      const mt = isFirst ? `16px` : `48px`
      const num = isLast ? `∞` : pad2(index)
      return `<section style="margin-top:${mt};margin-bottom:28px;padding:0 ${t.padX};">
        <section style="display:flex;align-items:center;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid ${t.primary};">
          <span style="display:inline-block;background:${t.primary};color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;">${num}</span>
          <section>
            <p style="font-size:10px;color:${t.primary};font-weight:700;letter-spacing:3px;margin:0 0 2px;text-transform:uppercase;">${english || (isLast ? `THE END` : defaultChapterEnglish(index, false))}</p>
            <h2 data-heading="true" style="font-size:18px;font-weight:800;color:${t.title};margin:0;">${title}</h2>
          </section>
        </section>
      </section>`
    },
    h3(html) {
      return `<p style="margin:28px ${t.padX} 14px;font-size:16px;font-weight:800;color:${t.title};border-left:4px solid ${t.primary};padding-left:12px;">${html}</p>`
    },
    quote(html) {
      return `<section style="margin:0 ${t.padX} 24px;background:${t.primaryBg};border-radius:0 10px 10px 0;border-left:4px solid ${t.primary};padding:16px 20px;">
        <p style="font-size:16px;font-weight:800;color:${t.primaryDeep};margin:0;line-height:1.8;">${html}</p>
      </section>`
    },
    hr() {
      return `<section style="padding:0 ${t.padX};"><section style="height:1px;background:linear-gradient(to right,transparent,#FCA5A5,${t.primary},#FCA5A5,transparent);margin:24px 0;">${deco()}</section></section>`
    },
    footer() {
      return `<section style="margin:32px ${t.padX} 24px;text-align:center;padding:24px 0;border-top:1px solid ${t.line};">
        <p style="font-size:12px;color:${t.primary};font-weight:700;letter-spacing:4px;margin:0 0 8px;">END</p>
        <p style="font-size:13px;color:${t.body};">如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。</p>
      </section>`
    },
  }
}

function graphite(t: GzhTokens): GzhComponents {
  const b = base(t, `graphiteMinimal`)
  return {
    ...b,
    h1(html) {
      return `<section style="margin:10px ${t.padX} 32px;padding-bottom:20px;border-bottom:1px solid ${t.line};">
        <h1 data-heading="true" style="font-size:22px;font-weight:800;color:${t.title};margin:0;">${html}</h1>
      </section>`
    },
    intro(html, author) {
      const sign = author
        ? `<p style="text-align:right;font-size:12px;color:${t.muted};margin:16px 0 0;">—— ${author}</p>`
        : ``
      return `<section style="margin:10px ${t.padX} 40px;padding:32px 24px 24px;border-top:1px solid ${t.line};border-bottom:1px solid ${t.line};">
        <p style="font-size:11px;color:${t.muted};letter-spacing:2px;margin:0 0 18px;">QUOTE</p>
        <p style="font-size:18px;font-weight:700;color:${t.title};margin:0;line-height:1.7;">${html}</p>
        ${sign}
      </section>`
    },
    toc(items) {
      const rows = items
        .map(
          item =>
            `<section style="display:flex;align-items:baseline;padding:14px 0;border-bottom:1px solid ${t.line};">
          <p style="font-size:11px;color:${t.muted};margin:0;min-width:36px;">${item.isLast ? `∞` : pad2(item.index)}</p>
          <p style="font-size:14px;color:${t.title};margin:0;">${item.title}</p>
        </section>`,
        )
        .join(``)
      return `<section style="margin:0 ${t.padX} 40px;border-top:1px solid ${t.line};">${rows}</section>`
    },
    chapter({ index, title, english, isLast, isFirst }) {
      const mt = isFirst ? `16px` : `56px`
      const num = isLast ? `∞` : pad2(index)
      return `<section style="margin-top:${mt};margin-bottom:32px;padding:0 ${t.padX};">
        <section style="padding-bottom:20px;border-bottom:1px solid ${t.line};">
          <p style="font-size:48px;font-weight:900;color:${t.line};margin:0;line-height:1;letter-spacing:-2px;">${num}</p>
          <p style="font-size:10px;color:${t.muted};font-weight:500;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase;">${english || (isLast ? `THE END` : defaultChapterEnglish(index, false))}</p>
          <h2 data-heading="true" style="font-size:20px;font-weight:800;color:${t.title};margin:0;line-height:1.4;">${title}</h2>
        </section>
      </section>`
    },
    h3(html) {
      return `<p style="font-size:15px;font-weight:800;color:${t.title};margin:28px ${t.padX} 14px;padding-left:12px;border-left:3px solid ${t.primary};">${html}</p>`
    },
    quote(html) {
      return `<section style="margin:0 ${t.padX} 24px;border-left:3px solid ${t.primary};padding:12px 18px;">
        <p style="font-size:15px;font-weight:700;color:${t.title};margin:0;line-height:1.8;">${html}</p>
      </section>`
    },
    hr() {
      return `<section style="padding:0 ${t.padX};"><section style="height:1px;background:${t.line};margin:40px 0;">${deco()}</section></section>`
    },
    footer() {
      return `<section style="margin:40px ${t.padX};text-align:center;">
        <p style="font-size:11px;color:${t.muted};letter-spacing:6px;margin:0 0 16px;">END</p>
        <p style="font-size:13px;color:${t.body};">如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。</p>
      </section>`
    },
  }
}

function ticket(t: GzhTokens): GzhComponents {
  const b = base(t, `moyuTicket`)
  return {
    ...b,
    h1(html, meta?: GzhCoverMeta) {
      return `<section style="background:${t.paper};border:2px solid ${t.line};box-shadow:4px 4px 0 ${t.line};margin-bottom:32px;">
        <section style="background:${t.primary};padding:12px 20px;display:flex;justify-content:space-between;">
          <section style="color:${t.paper};font-size:11px;letter-spacing:4px;font-weight:600;">${meta?.eyebrow || `TICKET`}</section>
          <section style="color:${t.paper};font-size:11px;">★★★★★</section>
        </section>
        <section style="padding:24px 20px;">
          <h1 data-heading="true" style="font-size:24px;font-weight:900;color:${t.title};margin:0 0 8px;">${html}</h1>
          <p style="font-size:14px;color:#666;margin:0;">${meta?.subtitle || ``}</p>
        </section>
      </section>`
    },
    intro(html) {
      return `<section style="font-size:13px;color:${t.body};line-height:1.8;padding:12px;background:${t.primaryBg};border:1px solid ${t.primaryLight};margin:0 ${t.padX} 24px;">${html}</section>`
    },
    toc(items) {
      const rows = items
        .map(
          item =>
            `<p style="margin:0 0 8px;font-size:13px;color:${t.title};"><strong>${item.isLast ? `///` : pad2(item.index)}</strong> ${item.title}</p>`,
        )
        .join(``)
      return `<section style="margin:0 ${t.padX} 24px;border:2px solid ${t.line};box-shadow:3px 3px 0 ${t.line};padding:16px;background:${t.paper};">${rows}</section>`
    },
    chapter({ index, title, english, isLast, isFirst }) {
      const mt = isFirst ? `0` : `8px`
      return `<section style="margin:${mt} 0 32px;padding:0 ${t.padX};">
        <section style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid ${t.line};">
          <section style="background:${t.primary};color:#fff;font-size:12px;font-weight:800;padding:6px 12px;letter-spacing:2px;">${isLast ? `///` : pad2(index)}</section>
          <h2 data-heading="true" style="font-size:18px;font-weight:800;color:${t.title};margin:0;letter-spacing:1px;">${title}</h2>
          <section style="font-size:12px;color:${t.muted};">${english ? `/ ${english}` : ``}</section>
        </section>
      </section>`
    },
    h3(html) {
      return `<section style="margin:0 ${t.padX} 16px;display:flex;align-items:center;gap:8px;">
        <section style="width:4px;height:16px;background:${t.primary};">${deco()}</section>
        <section style="font-size:15px;font-weight:700;color:${t.title};">${html}</section>
      </section>`
    },
    quote(html) {
      return `<section style="margin:0 ${t.padX} 24px;background:${t.paper};border:2px solid ${t.line};box-shadow:3px 3px 0 ${t.line};padding:16px;">
        <p style="font-size:14px;color:${t.title};margin:0;font-weight:700;">${html}</p>
      </section>`
    },
    hr() {
      return `<section style="margin:24px ${t.padX};border-top:2px dashed ${t.primaryLight};">${deco()}</section>`
    },
    footer() {
      const icons = ctaIcons()
      return `<section style="padding:0 0 32px;">
        <section style="background:${t.paper};border:2px solid ${t.line};box-shadow:4px 4px 0 ${t.line};padding:24px 20px;text-align:center;">
          <p style="font-size:13px;font-weight:700;color:${t.title};margin:0 0 20px;">如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。</p>
          <section style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
            <section style="text-align:center;color:${t.body};"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#fff;border:1px solid ${t.line};">${icons.like}</section><span style="font-size:10px;">点赞</span></section>
            <section style="text-align:center;color:${t.body};"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#fff;border:1px solid ${t.line};">${icons.view}</section><span style="font-size:10px;">在看</span></section>
            <section style="text-align:center;color:${t.primary};"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:${t.primaryBg};border:2px solid ${t.primary};">${icons.star}</section><span style="font-size:10px;">星标</span></section>
          </section>
          <p style="font-size:10px;color:${t.muted};letter-spacing:2px;margin:0;">THANKS FOR READING ✂</p>
        </section>
      </section>`
    },
  }
}

function olive(t: GzhTokens): GzhComponents {
  const b = base(t, `oliveJournal`)
  return {
    ...b,
    h1(html, meta?: GzhCoverMeta) {
      const eye = meta?.eyebrow || `INTERNAL NOTE`
      const date = meta?.date || ``
      const strike = meta?.strike
        ? `<p style="font-size:14px;color:${t.faint};margin:0 0 8px;text-decoration:line-through;">${meta.strike}</p>`
        : ``
      return `<section style="background:${t.paper};border:1px solid ${t.line};border-radius:6px;overflow:hidden;">
        <section style="padding:28px 24px 22px;">
          <section style="display:flex;align-items:center;gap:8px;margin-bottom:22px;">
            <span style="width:8px;height:8px;background:${t.primary};border-radius:50%;">${deco()}</span>
            <span style="font-size:10px;font-weight:700;letter-spacing:3px;color:${t.muted};">${eye}</span>
            <span style="flex:1;height:1px;background:${t.line};">${deco()}</span>
            <span style="font-size:10px;color:${t.faint};">${date}</span>
          </section>
          ${strike}
          <h1 data-heading="true" style="font-size:22px;font-weight:800;color:${t.title};margin:0;">${html}</h1>
          <p style="font-size:13px;color:${t.muted};margin:10px 0 0;">${meta?.subtitle || ``}</p>
        </section>
        <section style="background:${t.primary};padding:10px 24px;">
          <p style="font-size:12px;color:#fdfdf8;margin:0;">${meta?.author || ``}</p>
        </section>
      </section>`
    },
    intro(html) {
      return `<section style="margin-top:24px;background:${t.primaryBg};border:1px solid ${t.line};border-radius:6px;padding:16px 18px;">
        <p style="font-size:10px;font-weight:800;letter-spacing:3px;color:${t.title};margin:0 0 8px;">编者按</p>
        <p style="font-size:14px;color:${t.body};margin:0;line-height:1.9;">${html}</p>
      </section>`
    },
    toc(items) {
      const rows = items
        .map(
          item =>
            `<section style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid ${t.line};">
          <span style="font-size:12px;font-weight:800;color:${t.accent};">${item.isLast ? `///` : pad2(item.index)}</span>
          <span style="font-size:14px;color:${t.title};">${item.title}</span>
        </section>`,
        )
        .join(``)
      return `<section style="margin-top:24px;border-top:1px solid ${t.line};">${rows}</section>`
    },
    chapter({ index, title, english, isLast, isFirst }) {
      const mt = isFirst ? `24px` : `24px`
      return `<section style="margin-top:${mt};">
        <section style="display:flex;align-items:center;gap:14px;">
          <section style="text-align:center;flex-shrink:0;">
            <p style="margin:0;font-size:24px;font-weight:800;color:${t.title};line-height:1;letter-spacing:-2px;">${isLast ? `///` : pad2(index)}</p>
            <p style="margin:0;font-size:8px;font-weight:700;color:${t.faint};letter-spacing:2px;">PART</p>
          </section>
          <span style="width:1px;height:36px;background:${t.line};flex-shrink:0;">${deco()}</span>
          <section>
            <h2 data-heading="true" style="margin:0 0 1px;font-size:17px;font-weight:800;color:${t.title};">${title}</h2>
            <p style="margin:0;font-size:11px;font-weight:600;color:${t.muted};letter-spacing:1.2px;">${english || ``}</p>
          </section>
        </section>
      </section>`
    },
    h3(html) {
      return `<p style="margin:24px 0 12px;font-size:15px;font-weight:800;color:${t.title};">
        <span style="color:${t.accent};margin-right:8px;">/</span>${html}
      </p>`
    },
    quote(html) {
      return `<section style="margin-top:24px;border-left:3px solid ${t.accent};padding:12px 16px;background:${t.primaryBg};">
        <p style="font-size:14px;color:${t.title};margin:0;font-weight:600;line-height:1.8;">${html}</p>
      </section>`
    },
    hr() {
      return `<section style="margin-top:24px;height:1px;background:${t.line};">${deco()}</section>`
    },
    footer() {
      const icons = ctaIcons()
      return `<section style="margin-top:24px;background:${t.paper};border:1px solid ${t.line};border-radius:6px;padding:22px 16px;text-align:center;">
        <p style="font-size:13px;font-weight:700;color:${t.title};margin:0 0 14px;">如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。</p>
        <section style="display:flex;justify-content:center;gap:18px;">
          <section style="text-align:center;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:${t.primaryBg};border-radius:6px;border:1px solid ${t.line};">${icons.like}</section><span style="font-size:11px;">赞</span></section>
          <section style="text-align:center;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:${t.primaryBg};border-radius:6px;border:1px solid ${t.line};">${icons.view}</section><span style="font-size:11px;">在看</span></section>
          <section style="text-align:center;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#d4c9b8;border-radius:6px;border:1px solid #b17816;">${icons.star}</section><span style="font-size:11px;">收藏</span></section>
        </section>
      </section>`
    },
  }
}

const factories: Record<GzhThemeId, (t: GzhTokens) => GzhComponents> = {
  zenWhitespace: zen,
  moyuGreen,
  redWhite,
  graphiteMinimal: graphite,
  moyuTicket: ticket,
  oliveJournal: olive,
}

export function createGzhComponents(id: GzhThemeId): GzhComponents {
  const t = getGzhTokens(id)
  return factories[id](t)
}
