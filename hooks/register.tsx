import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Favourite, Mode } from '../types'
import { ICONS, loadFavourites, search, setIcon } from './labels'

const POPUP = 'quick-bar-popup'
const SEARCH_SHOWN = 25

// The favourites live in the store across sessions; this is the session's copy the drawings read.
const favourites = atom({ plugin: 'quick-bar', key: 'favourites' } as const, [] as Favourite[])
const mode = atom({ plugin: 'quick-bar', key: 'mode' } as const, 'grid' as Mode)
const query = atom({ plugin: 'quick-bar', key: 'query' } as const, '')
const pending = atom({ plugin: 'quick-bar', key: 'pending' } as const, null as string | null)
const showBuiltins = atom({ plugin: 'quick-bar', key: 'showBuiltins' } as const, false)

async function setFavourites($: EngineInterface, change: (list: Favourite[]) => Favourite[]) {
  const next = await update($, favourites, change)
  await $.store.set('favourites', next)
}

async function goTo($: EngineInterface, to: Mode) {
  await update($, mode, (): Mode => to)
  if (to === 'add') await update($, query, () => '')
}

// Opens the popup as a dialog: it takes the keys, Esc closes it, popups wait behind it.
async function openPopup($: EngineInterface) {
  await goTo($, 'grid')
  await $.ui.open({ id: POPUP, title: 'Favourites', focus: true, closeOnEscape: true, holdToasts: true })
}

// Closes the popup, then runs a favourite as if it were typed; a text answer shows as a popup message.
async function runFavourite($: EngineInterface, command: string) {
  await $.ui.close({ id: POPUP })
  try {
    const result = await $.command.run({ command })
    const text = result.text?.trim()
    if (text) $.ui.toast(text.length > 160 ? `${text.slice(0, 157)}...` : text)
  } catch {
    $.ui.toast(`Could not run /${command} from favourites. Try typing it instead.`)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const saved = loadFavourites(await $.store.get('favourites'))
    await update($, favourites, () => saved)
    await $.command.register({ name: 'fav', description: 'Open your favourites: one-click commands and skills', immediate: true })
    return next(e)
  })

  on('command.run', { command: 'fav' }, async $ => {
    await openPopup($)
    return { text: 'Favourites opened.' }
  })

  // In the mode-label slot at the prompt footer's right: a small ⚡ beside any labels Claude shows there.
  on('ui.render', { component: 'SessionMode' }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    return (
      <Box flexDirection="row" gap={1} alignItems="center">
        {e.props.modes.length > 0 ? <Text dimColor>{e.props.modes.join(' & ')}</Text> : null}
        <Button key="fav-open" plain label="⚡" onPress={() => openPopup($)} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: POPUP }, async ($, e) => {
    const t = $.ui.resolve(e)
    const { Box, Text, Button } = t
    const Input = 'Input' in t ? t.Input : null
    const all = await $.command.list()
    const byName = new Map(all.map(c => [c.name, c]))
    const favs = await read($, favourites)
    const view = await read($, mode)

    // ---- The icons: hover for the name, click to run ----
    if (view === 'grid') {
      const here = favs.filter(f => byName.has(f.command))
      return (
        <Box flexDirection="column" gap={1} paddingX={1}>
          <Box flexDirection="row" gap={2} alignItems="center">
            <Text bold color="claude">
              ⚡ Favourites
            </Text>
            <Button key="go-add" plain dimColor label="＋ Add" onPress={() => goTo($, 'add')} />
            {favs.length > 0 ? <Button key="go-edit" plain dimColor label="✎ Edit" onPress={() => goTo($, 'edit')} /> : null}
          </Box>
          {here.length === 0 ? <Text dimColor>No favourites here yet. Press ＋ Add.</Text> : null}
          <Box flexDirection="row" flexWrap="wrap" gap={2}>
            {here.map(f => (
              <Box key={`fav-${f.command}`} flexDirection="column">
                <Button key={`run-${f.command}`} plain label={f.icon} onPress={() => runFavourite($, f.command)} />
                <Box
                  position="absolute"
                  top={1}
                  left={0}
                  display="none"
                  hover={{ display: 'flex' }}
                  borderStyle="bold"
                  borderColor="claude"
                  paddingX={1}
                >
                  <Text bold inverse color="claude" wrap="truncate-end">
                    {` /${f.command} `}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
          {/* Empty room under the icons, so the hover label has space to appear and covers nothing. */}
          <Box height={3} />
        </Box>
      )
    }

    // ---- Add: search every command and skill, click one to pick its icon ----
    if (view === 'add') {
      const q = await read($, query)
      const builtins = await read($, showBuiltins)
      const pool = all.filter(c => c.name !== 'fav' && (builtins || c.source !== 'builtin'))
      const found = search(pool, q)
      return (
        <Box flexDirection="column" gap={1} paddingX={1}>
          <Box flexDirection="row" gap={2} alignItems="center">
            <Text bold color="claude">
              ＋ Add a favourite
            </Text>
            <Button key="back" plain dimColor label="← Back" onPress={() => goTo($, 'grid')} />
          </Box>
          {Input ? (
            <Input
              key="fav-search"
              placeholder="Search commands and skills"
              autoFocus
              onInput={(value: string) => update($, query, () => value)}
              onSubmit={async () => {
                const first = found[0]
                if (!first) return
                await update($, pending, () => first.name)
                await goTo($, 'icon')
              }}
            />
          ) : null}
          <Box flexDirection="row">
            <Button
              key="toggle-builtins"
              plain
              dimColor
              label={builtins ? '☑ Include Claude Code commands' : '☐ Include Claude Code commands'}
              onPress={() => update($, showBuiltins, v => !v)}
            />
          </Box>
          {found.length === 0 ? <Text dimColor>Nothing matches "{q}".</Text> : null}
          <Box flexDirection="column">
            {found.slice(0, SEARCH_SHOWN).map(c => {
              const already = favs.find(f => f.command === c.name)
              return (
                <Box key={`found-${c.name}`} flexDirection="column">
                  <Button
                    key={`pick-${c.name}`}
                    plain
                    label={`${already ? `${already.icon} ` : ''}/${c.name}`}
                    onPress={async () => {
                      await update($, pending, () => c.name)
                      await goTo($, 'icon')
                    }}
                  />
                  <Text dimColor wrap="truncate-end">
                    {'   '}
                    {c.description}
                  </Text>
                </Box>
              )
            })}
          </Box>
          {found.length > SEARCH_SHOWN ? <Text dimColor>{found.length - SEARCH_SHOWN} more. Keep typing to narrow it down.</Text> : null}
        </Box>
      )
    }

    // ---- Icon: pick the emoji for the chosen command ----
    if (view === 'icon') {
      const command = await read($, pending)
      const current = favs.find(f => f.command === command)?.icon
      return (
        <Box flexDirection="column" gap={1} paddingX={1}>
          <Box flexDirection="row" gap={2} alignItems="center">
            <Text bold color="claude">
              Pick an icon for /{command}
            </Text>
            <Button key="back" plain dimColor label="← Back" onPress={() => goTo($, current ? 'edit' : 'add')} />
          </Box>
          <Box flexDirection="row" flexWrap="wrap" gap={2}>
            {ICONS.map(icon => (
              <Button
                key={`icon-${icon}`}
                plain
                label={icon === current ? `[${icon}]` : icon}
                onPress={async () => {
                  if (!command) return
                  await setFavourites($, list => setIcon(list, command, icon))
                  await goTo($, 'grid')
                }}
              />
            ))}
          </Box>
        </Box>
      )
    }

    // ---- Edit: change an icon or remove a favourite ----
    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Box flexDirection="row" gap={2} alignItems="center">
          <Text bold color="claude">
            ✎ Edit favourites
          </Text>
          <Button key="back" plain dimColor label="← Done" onPress={() => goTo($, 'grid')} />
        </Box>
        <Box flexDirection="column">
          {favs.map(f => (
            <Box key={`edit-${f.command}`} flexDirection="row" gap={2} alignItems="center">
              <Text>{f.icon}</Text>
              <Text dimColor={!byName.has(f.command)}>
                /{f.command}
                {byName.has(f.command) ? '' : ' (not in this project)'}
              </Text>
              <Button
                key={`change-${f.command}`}
                plain
                dimColor
                label="Change icon"
                onPress={async () => {
                  await update($, pending, () => f.command)
                  await goTo($, 'icon')
                }}
              />
              <Button
                key={`remove-${f.command}`}
                plain
                dimColor
                label="✕ Remove"
                onPress={() => setFavourites($, list => list.filter(x => x.command !== f.command))}
              />
            </Box>
          ))}
        </Box>
      </Box>
    )
  })
}
