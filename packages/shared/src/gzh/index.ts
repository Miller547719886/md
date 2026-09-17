import type { IConfigOption } from '../types'
import type { ClassicThemeId, GzhThemeId, ThemeId } from './types'
import { gzhTokens } from './tokens'
import { GZH_THEME_IDS } from './types'

export * from './tokens'
export * from './types'

export const gzhThemeOptions: IConfigOption<GzhThemeId>[] = GZH_THEME_IDS.map(
  id => ({
    label: gzhTokens[id].name,
    value: id,
    desc: gzhTokens[id].desc,
  }),
)

export function isGzhTheme(id: string | undefined | null): id is GzhThemeId {
  return !!id && (GZH_THEME_IDS as readonly string[]).includes(id)
}

export function isClassicTheme(
  id: string | undefined | null,
): id is ClassicThemeId {
  return id === `default` || id === `grace` || id === `simple`
}

export function getGzhPrimaryColor(id: ThemeId): string | undefined {
  if (!isGzhTheme(id))
    return undefined
  return gzhTokens[id].primary
}
