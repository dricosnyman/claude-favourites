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

import { actionFor, defaultAction, ICONS, kindOf, setKind } from './labels'

test('150 icons, none repeated', () => {
  expect(ICONS.length).toBe(150)
  expect(new Set(ICONS).size).toBe(150)
})

test('immediate commands run; skills wait in the text box; other commands run', () => {
  expect(defaultAction({ name: 'chat', source: 'plugin' }, true)).toBe('run')
  expect(defaultAction({ name: 'find-skills', source: 'user' })).toBe('fill')
  expect(defaultAction({ name: 'superpowers:brainstorming', source: 'plugin' })).toBe('fill')
  expect(defaultAction({ name: 'notes', source: 'plugin' })).toBe('run')
})

test('old click choices become kinds; unset ones get the usual guess', () => {
  expect(kindOf({ command: 'a', icon: '⭐', action: 'fill' })).toBe('skill')
  expect(kindOf({ command: 'b', icon: '⭐', action: 'run' })).toBe('plugin')
  expect(kindOf({ command: 'find-skills', icon: '🔍' }, { name: 'find-skills', source: 'user' })).toBe('skill')
  expect(kindOf({ command: 'chat', icon: '💬' }, { name: 'chat', source: 'plugin' }, true)).toBe('plugin')
})

test('a kind decides the click and replaces the old choice', () => {
  expect(actionFor('skill')).toBe('fill')
  expect(actionFor('plugin')).toBe('run')
  expect(setKind([{ command: 'x', icon: '⭐', action: 'fill' }], 'x', 'plugin')).toEqual([{ command: 'x', icon: '⭐', kind: 'plugin' }])
})
