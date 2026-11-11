import type { GzhH4Kind, GzhTokens } from '@md/shared/gzh'
import { deco, pad2 } from './helpers'

export function sharedCodeBlock(
  t: GzhTokens,
  lines: string[],
  lang: string,
): string {
  const langLabel = lang
    ? `<span style="margin-left:12px;font-size:12px;color:#64748B;font-family:${t.titleFont};letter-spacing:1px;">${lang}</span>`
    : ``
  const body = lines
    .map(
      line =>
        `<p style="margin:0;font-family:${t.titleFont};font-size:13px;line-height:1.6;color:#E2E8F0;">${line || `&nbsp;`}</p>`,
    )
    .join(``)

  return `<section style="margin:0 ${t.padX} 20px;border-radius:8px;overflow:hidden;background:#1E293B;box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);">
  <section style="display:flex;align-items:center;padding:9px 14px;background:#0F172A;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;">.</span>
    ${langLabel}
  </section>
  <section style="padding:11px 14px;">${body}</section>
</section>`
}

export function sharedImage(
  t: GzhTokens,
  src: string,
  caption: string,
  isGif: boolean,
): string {
  const badge = isGif
    ? `<span style="display:inline-block;background:${t.primaryBg};color:${t.primaryDeep};font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;">GIF 动图</span>`
    : ``
  const cap
    = caption || isGif
      ? `<p style="font-size:12px;color:${t.muted};text-align:center;margin:8px ${t.padX} 32px;letter-spacing:0.5px;">${badge}${caption ? `— ${caption}` : ``}</p>`
      : ``
  return `<section style="margin:0 ${t.padX} 10px;border:1px solid ${t.line};overflow:hidden;">
  <section style="margin:0;overflow:hidden;">
    <img src="${src}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />
  </section>
</section>${cap}`
}

export function sharedTable(
  t: GzhTokens,
  header: string[],
  rows: string[][],
): string {
  const th = header
    .map((cell, index) =>
      `<th style="padding:10px 12px;text-align:left;font-size:13px;color:${t.title};border-bottom:1px solid ${t.line};background:${t.primaryBg};${index === 0 ? `word-break:keep-all;` : ``}">${cell}</th>`,
    )
    .join(``)
  const body = rows
    .map((row, i) => {
      const tds = row
        .map((cell, index) =>
          `<td style="padding:10px 12px;font-size:13px;color:${t.body};border-bottom:1px solid ${t.line};${index === 0 ? `word-break:keep-all;` : ``}">${cell}</td>`,
        )
        .join(``)
      const bg = i % 2 === 1 ? `background:${t.paper};` : ``
      return `<tr style="${bg}">${tds}</tr>`
    })
    .join(``)
  return `<section style="margin:0 ${t.padX} 24px;overflow:auto;">
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>${th}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</section>`
}

export function sharedList(
  t: GzhTokens,
  ordered: boolean,
  items: string[],
): string {
  if (ordered) {
    const rows = items
      .map(
        (item, i) =>
          `<section style="display:flex;align-items:baseline;padding:12px 0;border-bottom:1px solid ${t.line};">
        <p style="font-size:11px;color:${t.primary};font-weight:600;letter-spacing:1px;margin:0;min-width:28px;">${pad2(i + 1)}</p>
        <p style="font-size:14px;color:${t.title};margin:0;line-height:1.7;padding-left:12px;">${item}</p>
      </section>`,
      )
      .join(``)
    return `<section style="margin:0 ${t.padX} 32px;border-top:1px solid ${t.line};">${rows}</section>`
  }
  const rows = items
    .map(
      item =>
        `<section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${t.primary};margin-top:8px;flex-shrink:0;">${deco()}</span>
      <p style="font-size:${t.fontSize};color:${t.body};margin:0;line-height:${t.lineHeight};flex:1;">${item}</p>
    </section>`,
    )
    .join(``)
  return `<section style="margin:0 ${t.padX} 24px;">${rows}</section>`
}

export function sharedH4(
  t: GzhTokens,
  html: string,
  kind: GzhH4Kind,
  index: number,
): string {
  const label
    = kind === `plain` ? pad2(index) : `${kind.toUpperCase()} ${pad2(index)}`
  return `<p style="margin:24px ${t.padX} 12px;font-size:15px;font-weight:800;color:${t.title};line-height:1.6;">
  <span style="display:inline-block;background:${t.primaryBg};color:${t.primaryDeep};border-radius:5px;padding:1px 9px;margin-right:8px;font-weight:900;">${label}</span>
  ${html}
</p>`
}

export function ctaIcons(): {
  like: string
  view: string
  share: string
  star: string
} {
  return {
    like: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    view: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>`,
    share: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18v-4a8 8 0 0 1 8-8h8"></path><polyline points="16 2 20 6 16 10"></polyline></svg>`,
    star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  }
}
