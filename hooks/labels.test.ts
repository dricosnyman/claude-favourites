import { test, expect } from 'claude-code/testing'

import { loadFavourites, search, setIcon, STARTERS } from './labels'

test('old saved names become favourites with a star; nothing saved starts empty', () => {
  expect(loadFavourites(['chat', { command: 'notes', icon: '📖' }])).toEqual([
    { command: 'chat', icon: '⭐' },
    { command: 'notes', icon: '📖' },
  ])
  expect(loadFavourites(undefined)).toEqual(STARTERS)
})

test('search matches every word, name hits first', () => {
  const all = [
    { name: 'notes', description: 'open your study notes' },
    { name: 'chat', description: 'a normal chat' },
    { name: 'glossary', description: 'words from your notes' },
  ]
  expect(search(all, 'notes').map(c => c.name)).toEqual(['notes', 'glossary'])
  expect(search(all, 'normal chat').map(c => c.name)).toEqual(['chat'])
  expect(search(all, '').length).toBe(3)
})

test('picking an icon adds a favourite or changes its icon', () => {
  expect(setIcon([], 'chat', '💬')).toEqual([{ command: 'chat', icon: '💬' }])
  expect(setIcon([{ command: 'chat', icon: '💬' }], 'chat', '🤖')).toEqual([{ command: 'chat', icon: '🤖' }])
})
