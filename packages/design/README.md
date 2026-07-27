# `@whereskarl/design`

Platform-agnostic design tokens (not components).

## Public API

- `designTokens` — brand RGB channel objects (navy, gold, …)
- `rgbToken` — pure RGB → `rgb()` string helper (`css-space` or `css-comma`)
- `cssColorTokens` — space-separated CSS color strings for brand tokens
- `CLEAR_SKIES_SCORE_COLORS` — Clear Skies Score display hex palette
- `AIR_QUALITY_COLOR_BY_TOKEN` — AQI `colorToken` → hex map
- `UV_INDEX_COLOR_BY_TOKEN` — UV `colorToken` → hex map
- `POLLEN_COLOR_BY_TOKEN` — pollen `colorToken` → hex map

No React, React Native, DOM, or environment dependencies.
