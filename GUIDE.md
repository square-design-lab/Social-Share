# SDL Social Share

A lightweight social‑share bar for **individual Squarespace blog post pages**. No dependencies, no build step, editor‑ and AJAX‑navigation safe.

- 10 share targets: Copy Link, Facebook, X (Twitter), LinkedIn, Email, WhatsApp, Telegram, Pinterest, Reddit, and the device‑native share sheet.
- 5 placements: pagination row, after content, top of post, floating rail (with mobile bottom bar), or inline via a Code Block.
- Fully styleable: pill / square / circle buttons, solid / outline / soft fills, brand / monochrome / custom colours, sizes, alignment, heading label.

Build your configuration visually with **`config-generator.html`** — it produces the exact code to paste.

---

## Installation

### 1. Footer Code Injection (required)

Go to **Settings → Advanced → Code Injection → Footer** and paste:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/square-design-lab/Social-Share@latest/socialShare.min.css">
<script>
  window.SDL_SHARE_CONFIG = {
    "placement": "pagination",
    "networks": ["copy", "facebook", "twitter", "linkedin", "email"]
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/square-design-lab/Social-Share@latest/socialShare.min.js"></script>
```

The bar renders automatically on every blog post. To limit it to specific blogs, add a `collections` array (see below).

### 2. Code Block (only for the `inline` placement)

If `placement` is set to `"inline"`, nothing auto‑inserts. Add a **Code Block** to the post where you want the bar and paste:

```html
<div data-sdl-share></div>
```

---

## Placement options

| Value | Where it appears |
|---|---|
| `pagination` | Left of the native Previous / Next links at the bottom of the post *(default)* |
| `after-content` | Directly below the article body, before comments |
| `top` | Near the top, just under the author / date meta |
| `floating` | Fixed rail that follows scroll; collapses to a bottom bar on mobile |
| `inline` | Wherever you drop a `<div data-sdl-share></div>` Code Block |

If `pagination` is chosen but a post has no Prev/Next row, the bar falls back to `after-content` automatically.

---

## Configuration reference

All keys are optional; defaults are shown.

```js
window.SDL_SHARE_CONFIG = {
  networks: ["copy","facebook","twitter","linkedin","email",
             "whatsapp","telegram","pinterest","reddit","native"],
  placement: "pagination",       // pagination | after-content | top | floating | inline

  // presentation
  content: "icon-label",         // icon-label | icon | label
  shape: "pill",                 // pill | square | circle
  fill: "solid",                 // solid | outline | soft
  colorMode: "brand",            // brand | mono | custom
  monoColor: "#111111",          // used when colorMode = mono
  customColor: "#111111",        // used when colorMode = custom
  size: "m",                     // s | m | l
  align: "left",                 // left | center | right
  direction: "row",              // row | column
  gap: 10,
  marginTop: 24,
  marginBottom: 8,

  // heading label
  showLabel: true,
  labelText: "Share article",
  labelStyle: "mark",            // mark | plain | heading
  labelColor: "#FE3D06",         // highlight colour when labelStyle = mark

  // behaviour
  newTab: true,                  // open share links in a new tab
  copyText: "Copy Link",
  copiedText: "Copied!",
  shareText: "Share",            // label for the native-share button

  // floating rail (placement = floating)
  floatingPosition: "left",      // left | right
  floatingOffset: 180,           // px from top
  floatingMobileBar: true,       // collapse to bottom bar on mobile

  // targeting — empty = all blog posts
  collections: []                // e.g. ["6a4f4b0ac43c45253e2b58e7"]
};
```

### Notes

- **Native share** only renders on devices/browsers that support the Web Share API (mostly mobile). It is silently skipped elsewhere, so it's safe to always include.
- **Share data** (URL, title, image for Pinterest) is read from the page's canonical link and Open Graph meta tags, so previews are accurate.
- **Collection targeting:** find a blog's collection ID in the page source (`collection-XXXXXXXX` body class) and add it to `collections`.

---

## Files

| File | Purpose |
|---|---|
| `socialShare.js` / `.min.js` | Plugin script |
| `socialShare.css` / `.min.css` | Plugin styles |
| `config-generator.html` | Visual configurator with live preview + code output |

---

© Square Design Lab
