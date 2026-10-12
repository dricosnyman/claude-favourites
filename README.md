# ⚡ Favourites for Claude Code

Stop typing `/commands`. Click a small **⚡** at the bottom-right of the text box and a popup shows your favourite commands and skills as icons. One click runs it.

- **Icons only.** Hover over one to see its name. Click to use it.
- **Two tabs: 🧩 Plugins and 🎓 Skills.** A click on a plugin command (like `/chat`) runs it. A click on a skill puts it in your text box (`/find-skills ▌`), so you can add what you want and press Enter.
- **＋ Add** searches every command and skill you have, live as you type. Pick one, then pick its icon from 150 emoji grouped by area (coding, writing, data, design, learning, plans, everyday life, numbers and more), then say whether it's a plugin or a skill (the best guess is highlighted).
- **✎ Edit** changes an icon, moves a favourite between Plugins and Skills, or removes it.
- **Works while Claude is busy**, and your favourites are kept across sessions and projects.
- Prefer typing? `/fav` opens the popup too. **Esc** closes it.

A favourite only shows in projects where its command exists, so one list works everywhere.

## Install

You need **Claude Code 2.1.287 or newer** (that's when mods arrived).

**From GitHub**, at the prompt of a terminal session:

```
/plugin install quick-bar --marketplace dricosnyman/claude-favourites
```

Answer `y` to add the marketplace, then pick the **user** scope so it loads in every project.

**From a folder** (a copy on a USB stick or OneDrive), in a normal terminal:

```
claude plugin marketplace add "C:\path\to\quick-bar"
claude plugin install quick-bar@quick-bar --scope user
```

Start a new session (or run `/reload-plugins`) and the ⚡ appears.

## What it can and can't touch

A mod runs with your permissions, so here's exactly what this one does:

- It **draws** the ⚡ and the popup, **lists** your commands so you can search them, and **runs** the one you click.
- It **saves** your favourites in Claude Code's own plugin storage.
- It makes **no network calls**, **reads and writes no files**, and **starts no programs**.

Check for yourself with `claude plugin validate <this folder>`, which lists every event it hooks and every call it makes.

## Turn it off

Disable **quick-bar** in your plugin settings, or remove it:

```
claude plugin uninstall quick-bar@quick-bar
```

## Works with

The Claude Code **desktop app** (Code tab) and the **terminal**, on Windows, Mac and Linux. In the VS Code extension a mod can't draw, so the ⚡ won't show there.

## Licence

MIT. See [LICENSE](LICENSE).

Made by Drico, built together with Claude Code.
