# Button

Primary (filled amber) and secondary (outline/ghost) actions.

## Variants

- **Primary** — `amber.base` fill, `amber.onFilled` text. Reserved for the
  single most important action on a screen (e.g. "Begin the consultation").
  Don't use more than one primary button per view.
- **Secondary (outline)** — transparent fill, `border.strong` outline,
  `ink.base` text. The default for everything else — most nav-adjacent
  actions (like "Read the disclaimer →") are secondary or plain text links,
  not primary.
- **Ghost** — transparent fill, transparent border until hover, when it
  picks up `surface.200`. Used for low-emphasis inline actions (e.g. the
  "New here?" callout's inline persona/lineage links).

## States

- **Hover** — primary darkens toward `amber.strong`; secondary/ghost pick up
  a `surface.200` background wash.
- **Focus-visible** — 2px `amber.base` outline, 2px offset (matches the
  rest of the app's focus ring).
- **Disabled** — 50% opacity, no hover/pointer affordance.

## Tokens consumed

`amber.base`, `amber.strong`, `amber.onFilled`, `border.strong`,
`surface.200`, `ink.base`, `radius.pill` (buttons round fully, like tags,
to distinguish interactive controls from `radius.md` static surfaces),
`type.families.sans`.
