/** What a click does: run the command at once, or put it in the text box to add an instruction. */
export type ClickAction = 'run' | 'fill'

/** A favourite: a command or skill (its name, without the slash), its icon, and what a click does. */
export type Favourite = { command: string; icon: string; action?: ClickAction }

/** What the popup shows: the icons, the search to add one, picking an icon or a click action, or editing. */
export type Mode = 'grid' | 'add' | 'icon' | 'action' | 'edit'

declare module 'claude-code' {
  interface PluginState {
    'quick-bar': {
      favourites: Favourite[]
      mode: Mode
      query: string
      /** The command waiting for its icon, while picking one. */
      pending: string | null
      showBuiltins: boolean
      /** Commands Claude Code described as immediate (they run at once even mid-turn), by name. */
      immediates: string[]
    }
  }
}
