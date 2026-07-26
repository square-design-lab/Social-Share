/* SDL Social Share v1.0  —  square-design-lab/Social-Share
   Adds a social share bar to individual Squarespace blog post pages.
   Config: window.SDL_SHARE_CONFIG (set in Code Injection FOOTER).
   No build step, no dependencies, editor / AJAX-nav safe. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Defaults — every key here is overridable via window.SDL_SHARE_CONFIG
   * ------------------------------------------------------------------ */
  var DEFAULTS = {
    // which networks, in display order
    networks: ["copy", "facebook", "twitter", "linkedin", "email",
               "whatsapp", "telegram", "pinterest", "reddit", "native"],
    // top | after-content | pagination | inline | floating
    placement: "pagination",
    // presentation
    content: "icon-label",     // icon-label | icon | label
    shape: "pill",             // pill | square | circle
    fill: "solid",             // solid | outline | soft
    colorMode: "brand",        // brand | mono | custom
    monoColor: "#111111",
    customColor: "#111111",
    size: "m",                 // s | m | l
    align: "left",             // left | center | right
    direction: "row",          // row | column
    gap: 10,
    marginTop: 24,
    marginBottom: 8,
    // heading / label
    showLabel: true,
    labelText: "Share article",
    labelStyle: "mark",        // mark | plain | heading
    labelColor: "#FE3D06",
    // behaviour
    newTab: true,
    copyText: "Copy Link",
    copiedText: "Copied!",
    shareText: "Share",        // label used for the native-share button
    // floating rail
    floatingPosition: "left",  // left | right
    floatingOffset: 180,       // px from top (desktop rail vertical center offset base)
    floatingMobileBar: true,   // collapse to bottom bar on mobile
    // targeting — empty = all blog posts; otherwise restrict to these collection IDs
    collections: []
  };

  /* ------------------------------------------------------------------ *
   * Network catalogue: brand colour + icon + share-URL builder.
   * `share(ctx)` returns a URL string, or null for JS-handled actions.
   * ------------------------------------------------------------------ */
  var NETWORKS = {
    copy: {
      label: "Copy Link", brand: "#4b5563", action: "copy",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    },
    facebook: {
      label: "Facebook", brand: "#1877F2",
      share: function (c) { return "https://www.facebook.com/sharer/sharer.php?u=" + c.u; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>'
    },
    twitter: {
      label: "X", brand: "#000000",
      share: function (c) { return "https://twitter.com/intent/tweet?url=" + c.u + "&text=" + c.t; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.29L17.61 20.65z"/></svg>'
    },
    linkedin: {
      label: "LinkedIn", brand: "#0A66C2",
      share: function (c) { return "https://www.linkedin.com/sharing/share-offsite/?url=" + c.u; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>'
    },
    email: {
      label: "Email", brand: "#6b7280",
      share: function (c) { return "mailto:?subject=" + c.t + "&body=" + c.t + "%0A%0A" + c.u; },
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
    },
    whatsapp: {
      label: "WhatsApp", brand: "#25D366",
      share: function (c) { return "https://api.whatsapp.com/send?text=" + c.t + "%20" + c.u; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.42 9.42 0 0 1-4.8-1.31l-.34-.2-3.57.93.96-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43a9.4 9.4 0 0 1 6.68 2.77 9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.43 9.43zM20.52 3.45A11.76 11.76 0 0 0 12.05 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.13 1.59 5.93L.07 24l6.34-1.66a11.87 11.87 0 0 0 5.64 1.44h.01c6.55 0 11.88-5.32 11.88-11.87a11.8 11.8 0 0 0-3.42-8.46z"/></svg>'
    },
    telegram: {
      label: "Telegram", brand: "#26A5E4",
      share: function (c) { return "https://t.me/share/url?url=" + c.u + "&text=" + c.t; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56l.38-5.56 10.12-9.14c.44-.39-.1-.61-.68-.22L6.8 13.16l-5.45-1.7c-1.18-.37-1.2-1.18.26-1.75l21.28-8.2c.99-.37 1.85.22 1.53 1.53z"/></svg>'
    },
    pinterest: {
      label: "Pinterest", brand: "#E60023",
      share: function (c) { return "https://pinterest.com/pin/create/button/?url=" + c.u + "&media=" + c.m + "&description=" + c.t; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.16-.11-.95-.2-2.4.04-3.44.22-.93 1.4-5.94 1.4-5.94s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.51.77 1.51 1.68 0 1.03-.65 2.56-.99 3.98-.28 1.19.6 2.16 1.77 2.16 2.12 0 3.76-2.24 3.76-5.47 0-2.86-2.06-4.86-5-4.86-3.4 0-5.4 2.55-5.4 5.19 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34-.09.38-.29 1.19-.33 1.35-.05.22-.17.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.25 7.92-7.25 4.16 0 7.39 2.96 7.39 6.92 0 4.13-2.6 7.46-6.22 7.46-1.21 0-2.35-.63-2.74-1.38l-.75 2.84c-.27 1.04-1 2.35-1.49 3.15C9.57 23.82 10.76 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>'
    },
    reddit: {
      label: "Reddit", brand: "#FF4500",
      share: function (c) { return "https://www.reddit.com/submit?url=" + c.u + "&title=" + c.t; },
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 11.78c0-1.44-1.17-2.6-2.6-2.6-.7 0-1.34.28-1.8.73-1.77-1.28-4.22-2.1-6.94-2.2l1.18-5.55 3.85.82a1.87 1.87 0 1 0 .18-.9l-4.3-.91a.44.44 0 0 0-.52.34l-1.32 6.2c-2.76.08-5.25.9-7.04 2.2a2.6 2.6 0 0 0-1.8-.73 2.6 2.6 0 0 0-1.06 4.98 5.1 5.1 0 0 0-.06.78c0 3.96 4.6 7.17 10.28 7.17s10.28-3.2 10.28-7.17c0-.26-.02-.52-.06-.77A2.6 2.6 0 0 0 24 11.78zM6.55 13.7a1.87 1.87 0 1 1 3.74 0 1.87 1.87 0 0 1-3.74 0zm10.4 4.92c-1.27 1.27-3.7 1.37-4.41 1.37-.72 0-3.15-.1-4.42-1.37a.48.48 0 0 1 .68-.68c.8.8 2.52.98 3.74.98 1.21 0 2.93-.17 3.74-.98a.48.48 0 0 1 .68 0c.18.19.18.5 0 .68zm-.34-3.05a1.87 1.87 0 1 1 0-3.74 1.87 1.87 0 0 1 0 3.74z"/></svg>'
    },
    native: {
      label: "Share", brand: "#4b5563", action: "native",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>'
    }
  };

  /* ---------- small helpers ---------- */
  function cfg() {
    var c = {}, u = window.SDL_SHARE_CONFIG || {};
    for (var k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) c[k] = DEFAULTS[k];
    for (var j in u) if (Object.prototype.hasOwnProperty.call(u, j)) c[j] = u[j];
    return c;
  }
  function isBlogPost() {
    var b = document.body;
    if (!b) return false;
    var blog = b.classList.contains("collection-type-blog") || !!document.querySelector(".blog-item-content");
    var item = b.classList.contains("view-item") || !!document.querySelector(".blog-item-wrapper, .BlogItem, article.blog-item");
    return blog && item;
  }
  function collectionAllowed(list) {
    if (!list || !list.length) return true;
    var cls = document.body.className;
    for (var i = 0; i < list.length; i++) {
      var id = String(list[i]).trim().replace(/^collection-/, "");
      if (id && cls.indexOf("collection-" + id) !== -1) return true;
    }
    return false;
  }
  function meta(sel, attr) {
    var el = document.querySelector(sel);
    return el ? (el.getAttribute(attr) || "") : "";
  }
  function shareContext() {
    var url = meta('link[rel="canonical"]', "href") ||
              meta('meta[property="og:url"]', "content") ||
              window.location.href;
    var title = meta('meta[property="og:title"]', "content") ||
                (document.querySelector(".blog-item-title") || {}).textContent ||
                document.title || "";
    var img = meta('meta[property="og:image"]', "content") || "";
    return {
      raw: url,
      u: encodeURIComponent(url),
      t: encodeURIComponent(String(title).trim()),
      m: encodeURIComponent(img)
    };
  }

  /* ---------- copy-to-clipboard with legacy fallback ---------- */
  function copyLink(url, btn, c) {
    var labelEl = btn.querySelector(".sdl-sh-label"), original = c.copyText;
    function done(ok) {
      if (labelEl) labelEl.textContent = ok ? c.copiedText : "Failed";
      btn.classList.add("is-copied");
      setTimeout(function () {
        if (labelEl) labelEl.textContent = original;
        btn.classList.remove("is-copied");
      }, 1800);
    }
    function legacy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { done(true); }, legacy);
    } else { legacy(); }
  }

  /* ---------- build one button ---------- */
  function makeButton(id, ctx, c) {
    var net = NETWORKS[id];
    if (!net) return null;
    // Native share only where the API exists.
    if (net.action === "native" && !navigator.share) return null;

    var isAction = !!net.action;
    var el = document.createElement(isAction ? "button" : "a");
    el.className = "sdl-sh-btn";
    el.setAttribute("data-net", id);

    // brand colour drives the CSS via --brand
    var brand = net.brand;
    if (c.colorMode === "mono") brand = c.monoColor;
    else if (c.colorMode === "custom") brand = c.customColor;
    el.style.setProperty("--brand", brand);

    var labelText = id === "copy" ? c.copyText : (id === "native" ? c.shareText : net.label);
    var aria = "Share on " + net.label;
    if (id === "copy") aria = c.copyText;
    if (id === "native") aria = c.shareText;

    if (c.content !== "label") {
      var ic = document.createElement("span");
      ic.className = "sdl-sh-icon";
      ic.innerHTML = net.icon;
      ic.setAttribute("aria-hidden", "true");
      el.appendChild(ic);
    }
    if (c.content !== "icon") {
      var lb = document.createElement("span");
      lb.className = "sdl-sh-label";
      lb.textContent = labelText;
      el.appendChild(lb);
    }
    if (c.content === "icon") el.setAttribute("aria-label", aria);
    el.setAttribute("title", aria);

    if (isAction) {
      el.type = "button";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (net.action === "copy") copyLink(ctx.raw, el, c);
        else if (net.action === "native") {
          if (navigator.share) navigator.share({ url: ctx.raw }).catch(function () {});
        }
      });
    } else {
      el.href = net.share(ctx);
      el.rel = "noopener noreferrer";
      if (id !== "email" && c.newTab) el.target = "_blank";
    }
    return el;
  }

  /* ---------- build the full share block ---------- */
  function buildBlock(c, ctx, variant) {
    var wrap = document.createElement("div");
    wrap.className = "sdl-sh sdl-sh--" + (variant || c.placement);
    wrap.setAttribute("data-shape", c.shape);
    wrap.setAttribute("data-fill", c.fill);
    wrap.setAttribute("data-size", c.size);
    wrap.setAttribute("data-content", c.content);
    wrap.setAttribute("data-align", c.align);
    wrap.setAttribute("data-dir", c.direction);
    wrap.style.setProperty("--sh-gap", (c.gap || 0) + "px");
    wrap.style.setProperty("--sh-mt", (c.marginTop || 0) + "px");
    wrap.style.setProperty("--sh-mb", (c.marginBottom || 0) + "px");

    if (c.showLabel && c.labelText && variant !== "floating") {
      var lab = document.createElement("p");
      lab.className = "sdl-sh-heading sdl-sh-heading--" + c.labelStyle;
      if (c.labelStyle === "mark") {
        var mk = document.createElement("mark");
        mk.textContent = c.labelText;
        mk.style.setProperty("--sh-mark", c.labelColor);
        lab.appendChild(mk);
      } else {
        lab.textContent = c.labelText;
      }
      wrap.appendChild(lab);
    }

    var links = document.createElement("div");
    links.className = "sdl-sh-links";
    var count = 0;
    for (var i = 0; i < c.networks.length; i++) {
      var btn = makeButton(c.networks[i], ctx, c);
      if (btn) { links.appendChild(btn); count++; }
    }
    if (!count) return null;
    wrap.appendChild(links);
    return wrap;
  }

  /* ---------- placement / mounting ---------- */
  function mount(c, ctx) {
    var placed = false;

    function place(node, ref, mode) {
      if (!ref || !node) return false;
      if (mode === "before") ref.parentNode.insertBefore(node, ref);
      else if (mode === "after") ref.parentNode.insertBefore(node, ref.nextSibling);
      else if (mode === "prepend") ref.insertBefore(node, ref.firstChild);
      else ref.appendChild(node);
      return true;
    }

    if (c.placement === "inline") {
      var slots = document.querySelectorAll("[data-sdl-share]");
      for (var s = 0; s < slots.length; s++) {
        if (slots[s].getAttribute("data-sdl-ready")) continue;
        var b = buildBlock(c, ctx, "inline");
        if (b) { slots[s].appendChild(b); slots[s].setAttribute("data-sdl-ready", "1"); placed = true; }
      }
      return placed;
    }

    if (document.querySelector(".sdl-sh--" + c.placement + "[data-mounted]")) return true;

    var block = buildBlock(c, ctx, c.placement);
    if (!block) return false;
    block.setAttribute("data-mounted", "1");

    var content = document.querySelector(".blog-item-content");
    var pag = document.getElementById("itemPagination");

    if (c.placement === "floating") {
      block.classList.toggle("sdl-sh--float-mobilebar", !!c.floatingMobileBar);
      block.setAttribute("data-float-pos", c.floatingPosition);
      block.style.setProperty("--sh-float-top", (c.floatingOffset || 160) + "px");
      document.body.appendChild(block);
      return true;
    }

    if (c.placement === "pagination") {
      if (pag) {
        // Sit the share block on the left; leave native prev/next in place.
        pag.classList.add("sdl-sh-pag-host");
        place(block, pag, "prepend");
        return true;
      }
      // fall through to after-content if there's no pagination on this post
      c.placement = "after-content";
    }

    if (c.placement === "after-content") {
      if (place(block, content, "after")) return true;
    }
    if (c.placement === "top") {
      if (place(block, content, "before")) return true;
      // fallback: prepend into blog item wrapper
      var wrap = document.querySelector(".blog-item-wrapper, .blog-item");
      if (place(block, wrap, "prepend")) return true;
    }

    // Last-resort fallback so the block never silently disappears.
    if (content && place(block, content, "after")) return true;
    return false;
  }

  /* ---------- init ---------- */
  function init() {
    var c = cfg();
    if (!isBlogPost()) return;
    if (!collectionAllowed(c.collections)) return;
    mount(c, shareContext());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
  window.addEventListener("load", init);
  document.addEventListener("sqs:page-loaded", init);
  window.addEventListener("mercury:load", init); // Squarespace AJAX page transitions

  // Exposed for the config generator's live preview.
  window.SDLSocialShare = { init: init, buildBlock: buildBlock, shareContext: shareContext, NETWORKS: NETWORKS, DEFAULTS: DEFAULTS };
})();
