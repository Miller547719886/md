import type { GzhComponents } from '@md/shared/gzh'

let current: GzhComponents | null = null

export function setGzhComponents(components: GzhComponents | null): void {
  current = components
}

export function getGzhComponents(): GzhComponents | null {
  return current
}
