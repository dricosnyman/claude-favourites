// Icons and search for the favourites popup. Pure: no `$`.

import type { ClickAction, Favourite, Kind } from '../types'

// The icons to pick from, grouped by the kind of skill they suit: emoji, so they draw in colour everywhere
// with nothing to download. Single-codepoint emoji where possible, so every terminal and the desktop app draw them alike.
export const ICON_GROUPS: { area: string; icons: string[] }[] = [
  { area: 'Coding', icons: ['💻', '⌨️', '🖥️', '🖱️', '💾', '🛠️', '🔧', '⚙️', '🧰', '🐞', '🧱', '🌐', '🔗', '🗄️', '🔌', '📡', '📟', '🐙', '🧩', '📦'] },
  { area: 'Writing & docs', icons: ['📝', '✏️', '✍️', '🖋️', '📄', '📑', '📋', '📜', '📖', '📚', '🗒️', '📰', '🗞️', '💭', '🔤'] },
  { area: 'Data & maths', icons: ['📊', '📈', '📉', '💹', '🔢', '➗', '♾️', '🧮', '📐', '📏', '🗃️', '🧾', '💰'] },
  { area: 'Talk & people', icons: ['💬', '📧', '📨', '💌', '📞', '📣', '🗣️', '👋', '🙋', '👥', '🤝'] },
  { area: 'Design & media', icons: ['🎨', '🖌️', '🖍️', '🖼️', '📷', '🎬', '🎞️', '📺', '🎭', '🎙️', '🎤', '🎧', '🎵', '🎹', '🎸', '🎮'] },
  { area: 'Learning & science', icons: ['🎓', '🏫', '🏛️', '🧠', '💡', '🔬', '🧪', '🧫', '🦠', '🧬', '⚛️', '🧲', '🌡️', '🔭', '⚗️', '🌱'] },
  { area: 'Plans & time', icons: ['📅', '🗓️', '📆', '⏰', '⏳', '⌛', '🎯', '📌', '📍', '🗺️', '🧭', '📁', '🗂️', '💼', '🛒', '🏷️'] },
  { area: 'Safety & upkeep', icons: ['🔒', '🔐', '🔑', '🛡️', '🚨', '⚠️', '🚦', '🩹', '🧹', '🔄', '🗜️', '✅'] },
  { area: 'Fun & AI', icons: ['🤖', '✨', '🪄', '🔮', '👾', '⚡', '🚀', '🔥', '⭐', '🌈', '🎉', '🏆', '🎲', '🔍'] },
  { area: 'Life & world', icons: ['🌍', '🏠', '❤️', '🍳', '☕', '⚽', '🌙'] },
  // Keycap numbers are three characters each (digit, emoji style, keycap); the desktop app draws them as tiles.
  { area: 'Numbers', icons: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'] },
]

export const ICONS = ICON_GROUPS.flatMap(g => g.icons)

// A new user starts with no favourites and adds their own.
export const STARTERS: Favourite[] = []

// Reads saved favourites: plain names (an early version) or { command, icon }.
export function loadFavourites(saved: unknown): Favourite[] {
  if (!Array.isArray(saved)) return STARTERS
  return saved
    .map(x => (typeof x === 'string' ? { command: x, icon: '⭐' } : x))
    .filter((x): x is Favourite => !!x && typeof x.command === 'string' && typeof x.icon === 'string')
}

// Commands whose name or description holds every word of the search, best matches (name hits) first.
export function search<T extends { name: string; description: string }>(all: T[], query: string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return all
  const hits = all.filter(c => words.every(w => `${c.name} ${c.description}`.toLowerCase().includes(w)))
  const inName = (c: T) => words.every(w => c.name.toLowerCase().includes(w))
  return [...hits.filter(inName), ...hits.filter(c => !inName(c))]
}

// What a click should do when nobody chose: immediate commands run at once; skills (from a skills folder,
// or named plugin:skill) wait in the text box for an instruction; other commands run at once.
export function defaultAction(command: { name: string; source: string }, isImmediate = false): ClickAction {
  if (isImmediate) return 'run'
  return command.source === 'user' || command.name.includes(':') ? 'fill' : 'run'
}

// A skill fills the text box; a plugin command runs.
export function actionFor(kind: Kind): ClickAction {
  return kind === 'skill' ? 'fill' : 'run'
}

// A favourite's kind: as chosen, else from an older click choice, else the usual guess for the command.
export function kindOf(f: Favourite, command?: { name: string; source: string }, isImmediate = false): Kind {
  if (f.kind) return f.kind
  if (f.action) return f.action === 'fill' ? 'skill' : 'plugin'
  return command && defaultAction(command, isImmediate) === 'fill' ? 'skill' : 'plugin'
}

// Sets one favourite's kind, dropping any older click choice.
export function setKind(list: Favourite[], command: string, kind: Kind): Favourite[] {
  return list.map(f => {
    if (f.command !== command) return f
    const { action: _, ...rest } = f
    return { ...rest, kind }
  })
}

// Adds a favourite, or changes the icon of one already there.
export function setIcon(list: Favourite[], command: string, icon: string): Favourite[] {
  return list.some(f => f.command === command)
    ? list.map(f => (f.command === command ? { ...f, icon } : f))
    : [...list, { command, icon }]
}
