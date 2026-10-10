/** A favourite: a command or skill (its name, without the slash) and the icon picked for it. */
export type Favourite = { command: string; icon: string }

/** What the popup shows: the icons, the search to add one, picking an icon, or editing. */
export type Mode = 'grid' | 'add' | 'icon' | 'edit'

declare module 'claude-code' {
  interface PluginState {
    'quick-bar': {
      favourites: Favourite[]
      mode: Mode
      query: string
      /** The command waiting for its icon, while picking one. */
      pending: string | null
      showBuiltins: boolean
    }
  }
}
