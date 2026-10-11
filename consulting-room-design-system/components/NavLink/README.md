# NavLink

The top-nav text links (Perls lineage, Psychology terms, Quotes, About,
Settings).

## Anatomy

Plain sans-serif text, no button chrome — a link in a reading room, not a
tab in an app.

## States

- **Default** — `ink.muted` text.
- **Hover / focus-visible** — `ink.base` text; no underline (the nav row is
  short enough that hover alone reads clearly).
- **Active** — when the link's associated panel (a modal, in this app) is
  currently open, text switches to `amber.base` — the one nav-level use of
  the accent as "this is the clickable/active idea," per the parent
  README's first amber rule.

## Tokens consumed

`ink.muted`, `ink.base`, `amber.base`, `type.families.sans`.
