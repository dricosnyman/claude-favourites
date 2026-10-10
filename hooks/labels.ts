// Icons and search for the favourites popup. Pure: no `$`.

import type { Favourite } from '../types'

// The icons to pick from: emoji, so they draw in colour everywhere with nothing to download.
export const ICONS = [
  '💬', '📊', '🎓', '📖', '🔤', '🎯', '⚡', '🚀',
  '🛠️', '🔍', '📝', '📌', '📁', '🧠', '💡', '🎨',
  '🎬', '🧪', '🐞', '✅', '⭐', '🔥', '🌍', '📅',
  '⏰', '🔒', '🧭', '📦', '🧩', '🎵', '📷', '🤖',
  '🧮', '✏️', '📐', '🗜️', '💰', '🔄', '🏠', '❤️',
]

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

// Adds a favourite, or changes the icon of one already there.
export function setIcon(list: Favourite[], command: string, icon: string): Favourite[] {
  return list.some(f => f.command === command)
    ? list.map(f => (f.command === command ? { ...f, icon } : f))
    : [...list, { command, icon }]
}
