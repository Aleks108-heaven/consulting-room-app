# Consulting Room

A dark, editorial design system for an offline simulator that lets someone study the history of psychotherapy by "speaking with" 135 scripted theorist personas. The system reads like a private archive room, not a chat product: near-black surfaces, a warm off-white for reading, and a single amber accent used sparingly, the way a librarian underlines a call number.

## Principles

**Archive, not app chrome.** Borders and hairlines do the work that shadows and gradients do elsewhere. A card is a folder in a drawer: a thin rule, generous padding, nothing that lifts off the page.

**One accent, spent carefully.** Amber (`amber`) marks exactly three things: an active or clickable idea (links, nav), a classification (the school-of-thought pill), and a single moment of emphasis per screen (the callout box). If everything is amber, nothing is.

**Serif thinks, sans explains.** Headings and theorist names are set in the serif (`type.families.serif`) — the voice of the historical record. Everything functional — search, buttons, nav, tags, meta text — is set in the sans (`type.families.sans`), the voice of the interface around it.

**Read first, decide second.** Every screen leads with a sentence of orientation (the hero copy, the card's one-line focus) before it asks for input. Don't let controls outrank the reading.

## Colour

Built on four surface steps (`surface-000` → `surface-300`) that step up in lightness only slightly — this system stays low-contrast at the structural level so the one high-contrast move, amber-on-dark, keeps its power. Text runs `ink` → `ink-muted` → `ink-faint` for primary, secondary and meta copy; never drop straight from `ink` to `ink-faint` for anything a person needs to read, only for placeholders and counters.

`amber-subtle` + `amber-ink` is the only combination used for filled pill tags (school-of-thought labels like PSYCHOANALYTIC or JUNGIAN) — it keeps the tag legible without competing with `amber` itself, which stays reserved for text links and active states.

## Type

- **Serif** (`type.families.serif`) — page titles, the hero headline, theorist names on cards and in the detail header.
- **Sans** (`type.families.sans`) — nav links, search placeholder, body/description copy, buttons, the school-of-thought dropdown.
- **Label caps** (`label-caps`, sans, uppercase, +0.08em tracking) — pill tags and section eyebrows only. Never run more than 2–3 words in this style; it's a stamp, not a sentence.

## Spacing & shape

An 8px-rooted scale (`space-1` … `space-12`). Cards and controls round to `radius-md` (8px); the one exception is the pill tag, which rounds fully (`radius-pill`) to read as a stamped label rather than a button. Panels and modals may go up to `radius-lg` for a slightly softer, larger surface.

## Components in this release

- **Card** — the theorist card: name, lifespan, one-line focus, school pill. The repeating unit of the whole app.
- **Tag** — the amber school-of-thought pill (PSYCHOANALYTIC, JUNGIAN, ADLERIAN, …), also usable as a small status label.
- **Button** — primary (filled amber) and secondary (outline) actions.
- **NavLink** — the top-nav text links (Perls lineage, Traditions of the Mind, About, Settings), including their active/hover state.

## What's not built yet

This first release covers the browse grid shown in the reference screen. The theorist detail/chat view, the Perls lineage timeline, Traditions of the Mind taxonomy page, and the Settings panel described alongside it will need their own components (a chat bubble/turn, a timeline node, a taxonomy tree row, a settings field) — flag them and I'll add them as their own cards using these same tokens.
