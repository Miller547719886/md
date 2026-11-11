import type CodeMirror from 'codemirror'
import { altKey, ctrlKey, shiftKey } from '@/configs/shortcut-key'
import { formatDoc } from '@/utils'

interface ToggleFormatOptions {
  prefix: string
  suffix: string
  check?: (selected: string) => boolean
  afterInsertCursorOffset?: number
}

export function toggleFormat(
  editor: CodeMirror.Editor,
  {
    prefix,
    suffix,
    check,
    afterInsertCursorOffset = 0,
  }: ToggleFormatOptions,
): void {
  const selected = editor.getSelection()
  const anchor = editor.getCursor(`anchor`)
  const head = editor.getCursor(`head`)
  const anchorIndex = editor.indexFromPos(anchor)
  const headIndex = editor.indexFromPos(head)
  const selectionStart = Math.min(anchorIndex, headIndex)
  const hasSelection = anchorIndex !== headIndex
  const isFormatted = check?.(selected) ?? false

  if (isFormatted) {
    // Remove formatting (e.g. **abc** -> abc)
    const newText = selected.slice(prefix.length, selected.length - suffix.length)
    editor.replaceSelection(newText)

    // Keep the selection on the unformatted text. Using document indexes here
    // also keeps the end position correct when the selection spans lines.
    const newStart = editor.posFromIndex(selectionStart)
    const newEnd = editor.posFromIndex(selectionStart + newText.length)
    const selection = anchorIndex <= headIndex
      ? [newStart, newEnd]
      : [newEnd, newStart]
    editor.setSelection(selection[0], selection[1])
  }
  else {
    // Apply formatting
    const newText = `${prefix}${selected}${suffix}`
    editor.replaceSelection(newText)

    // Keep a non-empty selection around the newly formatted text. For a
    // collapsed selection, put the caret between the markers instead of
    // selecting the markers themselves (e.g. `****|` becomes `**|**`).
    const formattedEnd = selectionStart + newText.length
    if (afterInsertCursorOffset !== 0) {
      // Links place the caret inside the URL (`[text](|)`).
      editor.setCursor(editor.posFromIndex(formattedEnd + afterInsertCursorOffset))
    }
    else if (hasSelection) {
      const newStart = editor.posFromIndex(selectionStart)
      const newEnd = editor.posFromIndex(formattedEnd)
      const selection = anchorIndex <= headIndex
        ? [newStart, newEnd]
        : [newEnd, newStart]
      editor.setSelection(selection[0], selection[1])
    }
    else {
      editor.setCursor(editor.posFromIndex(selectionStart + prefix.length))
    }
  }

  // Formatting can also be invoked from the menubar. Restore focus so the
  // next keystroke continues at the selection/caret we just computed.
  editor.focus()
}

function applyHeading(editor: CodeMirror.Editor, level: number) {
  editor.operation(() => {
    const ranges = editor.listSelections()

    ranges.forEach((range) => {
      const from = range.from()
      const to = range.to()

      for (let line = from.line; line <= to.line; line++) {
        const text = editor.getLine(line)
        // 去掉已有的 # 前缀（1~6 个）+ 空格
        const cleaned = text.replace(/^#{1,6}\s+/, ``).trimStart()
        const heading = `${`#`.repeat(level)} ${cleaned}`
        editor.replaceRange(
          heading,
          { line, ch: 0 },
          { line, ch: text.length },
        )
      }
    })
  })
  editor.focus()
}

export function createExtraKeys(openSearchWithSelection: (cm: CodeMirror.Editor) => void): CodeMirror.KeyMap {
  return {
    [`${shiftKey}-${altKey}-F`]: function autoFormat(editor) {
      const value = editor.getValue()
      formatDoc(value).then((doc: string) => {
        editor.setValue(doc)
      })
    },

    [`${ctrlKey}-Z`]: function undo(editor) {
      editor.undo()
    },

    [`${ctrlKey}-Y`]: function redo(editor) {
      editor.redo()
    },

    [`${ctrlKey}-B`]: function bold(editor) {
      toggleFormat(editor, {
        prefix: `**`,
        suffix: `**`,
        check: s => s.startsWith(`**`) && s.endsWith(`**`),
      })
    },

    [`${ctrlKey}-I`]: function italic(editor) {
      toggleFormat(editor, {
        prefix: `*`,
        suffix: `*`,
        check: s => s.startsWith(`*`) && s.endsWith(`*`),
      })
    },

    // [`${ctrlKey}-D`]: function del(editor) {
    //   toggleFormat(editor, {
    //     prefix: `~~`,
    //     suffix: `~~`,
    //     check: s => s.startsWith(`~~`) && s.endsWith(`~~`),
    //   })
    // },

    [`${ctrlKey}-K`]: function link(editor) {
      toggleFormat(editor, {
        prefix: `[`,
        suffix: `]()`,
        check: s => s.startsWith(`[`) && s.endsWith(`]()`),
        afterInsertCursorOffset: -1,
      })
    },

    [`${ctrlKey}-E`]: function code(editor) {
      toggleFormat(editor, {
        prefix: `\``,
        suffix: `\``,
        check: s => s.startsWith(`\``) && s.endsWith(`\``),
      })
    },

    [`${ctrlKey}-1`]: (ed: CodeMirror.Editor) => applyHeading(ed, 1),
    [`${ctrlKey}-2`]: (ed: CodeMirror.Editor) => applyHeading(ed, 2),
    [`${ctrlKey}-3`]: (ed: CodeMirror.Editor) => applyHeading(ed, 3),
    [`${ctrlKey}-4`]: (ed: CodeMirror.Editor) => applyHeading(ed, 4),
    [`${ctrlKey}-5`]: (ed: CodeMirror.Editor) => applyHeading(ed, 5),
    [`${ctrlKey}-6`]: (ed: CodeMirror.Editor) => applyHeading(ed, 6),

    [`${ctrlKey}-U`]: function unorderedList(editor) {
      const selected = editor.getSelection()
      const lines = selected.split(`\n`)
      const isList = lines.every(line => line.trim().startsWith(`- `))
      const updated = isList
        ? lines.map(line => line.replace(/^- +/, ``)).join(`\n`)
        : lines.map(line => `- ${line}`).join(`\n`)
      editor.replaceSelection(updated)
      editor.focus()
    },

    [`${ctrlKey}-O`]: function orderedList(editor) {
      const selected = editor.getSelection()
      const lines = selected.split(`\n`)
      const isList = lines.every(line => /^\d+\.\s/.test(line.trim()))
      const updated = isList
        ? lines.map(line => line.replace(/^\d+\.\s+/, ``)).join(`\n`)
        : lines.map((line, i) => `${i + 1}. ${line}`).join(`\n`)
      editor.replaceSelection(updated)
      editor.focus()
    },
    [`${ctrlKey}-F`]: (cm: CodeMirror.Editor) => {
      openSearchWithSelection(cm)
    },
    [`${ctrlKey}-G`]: function search() {
      // use this to avoid CodeMirror's built-in search functionality
    },
  }
}
