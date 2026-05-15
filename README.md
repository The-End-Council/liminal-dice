# Backrooms Roguelike Escape

Backrooms Roguelike Escape is a browser-based roguelike escape game inspired by Backrooms.  
Players choose jobs, roll dice, explore levels, manage items, fight entities, and aim to escape.

## Quick Start

No build step is required.  
Open `liminal-dice.html` in your browser.

## Current Scope

| Item | Status |
|---|---|
| Levels | Level 0, Level 1 |
| Jobs | Wanderer, Investigator, Hunter, Fisherman, Medic |
| Entities | Howler, Duller |
| Core Systems | Dice, Turn Flow, Combat, Inventory, Equip, Save/Load |
| Audio | BGM / SE, Volume, Mute |
| Log | In-game Archive with auto-scroll |

## Image Asset Integration

| Category | Path | In-game Usage |
|---|---|---|
| Jobs | `img/Jobs/*.png` | Setup job cards, job pick buttons, status bar job icon |
| Items | `img/Items/**.png` | Bag mini slots, bag modal cards, item detail panel |
| Entities | `img/Entities/*.png` | Combat encounter panel |

## Directory Overview

```text
/
├── AGENTS.md
├── README.md
├── liminal-dice.html
├── game-data.js
├── src/
│   ├── style.css
│   ├── audio.js
│   ├── state.js
│   ├── screen.js
│   ├── setup.js
│   ├── ui.js
│   ├── turn.js
│   ├── combat.js
│   ├── inventory.js
│   ├── save-load.js
│   ├── trophies.js
│   └── main.js
├── docs/
├── img/
│   ├── Jobs/
│   ├── Items/
│   ├── Entities/
│   └── Levels/
├── audio/
└── .github/
    └── ISSUE_TEMPLATE/
```

## Issue Templates

| File | Purpose |
|---|---|
| `.github/ISSUE_TEMPLATE/config.yml` | Issue template config and contact links |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Bug report form |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Feature request form |
| `.github/ISSUE_TEMPLATE/balance_feedback.yml` | Game balance feedback form |

## Issue and SubIssue Board

Issue and SubIssue tracking is managed in GitHub Project: **Liminal-dice**.

| Status | Scope |
|---|---|
| To do | Parent issues and sub-issues for levels, entities, items, achievements, fishing, and endings |

## License

This project is distributed under **Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0)**.

Backrooms-related concepts and derivative content are based on:
- [The Backrooms Wiki](http://backrooms-wiki.wikidot.com/)

Canonical license page:
- [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- [CC BY-SA 3.0 Legal Code](https://creativecommons.org/licenses/by-sa/3.0/legalcode.en)

Attribution statement:
- Content relating to the Backrooms is licensed under Creative Commons ShareAlike 3.0 and all concepts originate from http://backrooms-wiki.wikidot.com/ and its authors. This project, being derived from this content, is hereby also released under Creative Commons ShareAlike 3.0.

## Notes

- Issue and SubIssue titles use simple English.
- Local design notes can be maintained in `docs/` as an untracked local workspace.
