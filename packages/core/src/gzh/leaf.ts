export function wrapLeafText(html: string): string {
  return html.replace(/>([^<]+)</g, (full, text: string) => {
    if (!text.trim())
      return full
    if (/^\s*$/.test(text))
      return full
    return `><span leaf="">${text}</span><`
  })
}
