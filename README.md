# Backrooms Roguelike Escape

Backrooms Roguelike Escape is a browser-based roguelike escape game inspired by Backrooms.  
Players choose jobs, roll dice, explore levels, manage items, fight entities, and aim to escape.

## Quick Start

No build step is required.  
Open `Backrooms.html` in your browser.

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
├── README.md
├── AGENTS.md
├── Backrooms.html
├── game-data.js
├── css/style.css
├── js/
├── docs/
├── img/
│   ├── Jobs/
│   ├── Items/
│   ├── Entities/
│   └── Levels/
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

See the full board in [docs/IssueBoard.md](docs/IssueBoard.md).

| Status | Scope |
|---|---|
| To do | New feature backlog (levels, entities, items, endings, fishing) |
| Pending | QA and workflow checks |
| In progress | Image integration and issue template setup |
| Done | Core systems and fixes from v0.1.0 to v0.1.4 |

## Notes

- Issue and SubIssue titles use simple English.
- Detailed design and system notes are in `docs/`.
