# Card

The theorist card — the repeating unit of the browse grid.

## Anatomy

1. **Top row** — name (`type.families.serif`, semibold) + lifespan (sans,
   mono-style meta, `ink.faint`), right-aligned.
2. **Tagline** — one-line focus description, sans, `ink.muted`.
3. **Tag** — exactly one school-of-thought `Tag` at the bottom, left-aligned.

## States

- **Default** — `surface.100` background, `border.base` hairline,
  `radius.md` corners. No shadow — a folder in a drawer, not a raised chip.
- **Hover / focus** — border steps up to `border.strong`; a 1px upward
  translate reads as "lifted for reading," not "elevated chrome."

## Tokens consumed

`surface.100`, `border.base`, `border.strong`, `radius.md`, `space.2`
(padding), `ink.base` (name), `ink.muted` (tagline), `ink.faint` (lifespan),
`type.families.serif`, `type.families.sans`.

## Notes

Card never carries its own color per school (see Tag) — the one accent stays
reserved for the pill, not the card surface.
