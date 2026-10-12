/** What a click does: run the command at once, or put it in the text box to add an instruction. */
export type ClickAction = 'run' | 'fill'

/** Which tab a favourite lives in: a plugin command (a click runs it) or a skill (a click fills the text box). */
export type Kind = 'plugin' | 'skill'

/** A favourite: a command or skill (its name, without the slash), its icon, and its kind.
 * `action` is how version 1.2 to 1.4 stored the click choice; it is read as the kind when `kind` is missing. */
export type Favourite = { command: string; icon: string; kind?: Kind; action?: ClickAction }

/** What the popup shows: the icons, the search to add one, picking an icon or a kind, or editing. */
export type Mode = 'grid' | 'add' | 'icon' | 'kind' | 'edit'

declare module 'claude-code' {
  interface PluginState {
    'quick-bar': {
      favourites: Favourite[]
      mode: Mode
      query: string
      /** The command waiting for its icon, while picking one. */
      pending: string | null
      showBuiltins: boolean
      /** The popup's open tab, remembered across sessions. */
      tab: Kind
      /** Commands Claude Code described as immediate (they run at once even mid-turn), by name. */
      immediates: string[]
    }
  }
}
