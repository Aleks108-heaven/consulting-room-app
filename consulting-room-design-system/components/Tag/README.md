# Tag

The amber school-of-thought pill (PSYCHOANALYTIC, JUNGIAN, ADLERIAN, …),
also usable as a small status label elsewhere.

## Anatomy

A single line of `label-caps` text (uppercase, +0.08em tracking, 2–3 words
max — it's a stamp, not a sentence) inside a fully-rounded pill.

## States

- **Default only.** Tag is not interactive — it never has hover/active/
  disabled states. If a school needs to become clickable (e.g. filtering by
  tap), wrap it in a `Button`/link rather than adding interaction to Tag
  itself.

## Tokens consumed

`amber.subtle` (background), `amber.strong` (text — see note below),
`amber.subtleBorder` (1px border), `radius.pill` (full rounding, the one
exception to `radius.md`), `type.labelCaps`.

## Note on color pairing

The parent README pairs "amber-subtle + amber-ink" for tags. Read against a
solid-amber button, "ink" means the near-black/near-white text that sits on
*filled* amber (`amber.onFilled`) — but that combination is illegible on the
soft `amber.subtle` wash a tag actually uses. This spec instead pairs
`amber.subtle` (background) with `amber.strong` (text) — the amber tone
itself, at full saturation, used as "ink" against its own soft wash. This
keeps every tag legible while still reading as amber-on-amber, not
amber-on-neutral. `amber.onFilled` stays reserved for solid-fill surfaces
(the primary Button).
