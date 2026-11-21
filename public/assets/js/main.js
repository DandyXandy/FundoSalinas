/* Fundo Salinas | Diseño y desarrollo: Dandy Digital (portfoliodandy.com) */
(() => {
  "use strict";

  const WHATSAPP = "51996404372";
  const IMG = "assets/img/";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header con fondo al hacer scroll ---------- */
  const header = $("#header");
  const sentinel = $("#top-sentinel");
  const mobileBar = $("#mobileBar");
  if (sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      header.classList.toggle("is-scrolled", !e.isIntersecting);
      if (mobileBar) mobileBar.classList.toggle("is-visible", !e.isIntersecting && !document.body.classList.contains("page-contacto"));
    }).observe(sentinel);
  }

  /* ---------- Menú desplegable de espacios ---------- */
  const drop = $("#navDrop");
  if (drop) {
    const btn = $(".nav-drop-btn", drop);
    let t;
    const set = (open) => { drop.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => set(!drop.classList.contains("is-open")));
    drop.addEventListener("mouseenter", () => { clearTimeout(t); set(true); });
    drop.addEventListener("mouseleave", () => { t = setTimeout(() => set(false), 180); });
    drop.addEventListener("focusout", (e) => { if (!drop.contains(e.relatedTarget)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  /* ---------- Menú móvil ---------- */
  const toggle = $("#menuToggle");
  const menu = $("#mobileMenu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("no-scroll", open);
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      header.classList.add("is-scrolled");
      requestAnimationFrame(() => menu.classList.add("is-open"));
    } else {
      menu.classList.remove("is-open");
      if (window.scrollY < 40) header.classList.remove("is-scrolled");
      setTimeout(() => { if (toggle.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 350);
    }
  };
  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false); });
    window.matchMedia("(min-width: 1181px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });
  }

  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Titulares que entran palabra por palabra ---------- */
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.textContent = part;
            w.style.setProperty("--wi", i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    el.classList.add("split");
  };
  const splitTargets = reduceMotion ? [] : $$("[data-split], h2.h-lg, h2.h-md, .page-hero-copy h1, .rumba h2, .cta-band h2, .footer-cta h2, .quote-block");
  splitTargets.forEach(splitWords);

  /* ---------- Imágenes que se revelan con recorte ---------- */
  const clipTargets = reduceMotion ? [] : $$(".phm-main, .phm-side, .includes-sticky .media-frame, .mosaic a, .g-card .media-frame");
  clipTargets.forEach((el) => el.classList.add("clip"));

  /* ---------- Reveal ---------- */
  const revealEls = Array.from(new Set([...$$("[data-reveal], .rumba"), ...splitTargets.filter((el) => !el.hasAttribute("data-split")), ...clipTargets]));
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }
  // El titular del hero entra al cargar
  $$("[data-split]").forEach((el) => requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in"))));

  /* ---------- Botones magnéticos (solo mouse) ---------- */
  if (finePointer && !reduceMotion) {
    $$(".btn-lg, [data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.translate = `${(x * 10).toFixed(1)}px ${(y * 8).toFixed(1)}px`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.translate = ""; });
    });
  }

  /* ---------- Hero: video cinematográfico ---------- */
  const hero = $(".hero");
  const heroVideo = $("#heroVideo");
  if (hero && heroVideo) {
    const portrait = window.matchMedia("(max-aspect-ratio: 4/5)");
    const toggleBtn = $("#heroToggle");
    const chapterEl = $("#heroChapter");
    let chapters = [];
    let chapterIdx = -1;
    let userPaused = false;
    const icon = toggleBtn ? $("i", toggleBtn) : null;
    const setIcon = (playing) => {
      if (!toggleBtn) return;
      icon.className = "ph " + (playing ? "ph-pause" : "ph-play");
      toggleBtn.setAttribute("aria-label", playing ? "Pausar video" : "Reproducir video");
      toggleBtn.setAttribute("aria-pressed", String(!playing));
    };
    const pick = () => {
      const k = portrait.matches ? "port" : "land";
      chapters = (heroVideo.dataset["chapters" + (k === "port" ? "Port" : "Land")] || "").split("|").map((c) => {
        const i = c.indexOf(":");
        return [Number(c.slice(0, i)), c.slice(i + 1)];
      });
      chapterIdx = -1;
      heroVideo.poster = heroVideo.dataset[k + "Poster"];
      const src = heroVideo.dataset[k];
      if (heroVideo.getAttribute("src") !== src) {
        heroVideo.src = src;
        if (!reduceMotion && !saveData && !userPaused) heroVideo.play().catch(() => setIcon(false));
      }
    };
    const ready = () => hero.classList.add("is-ready");
    if (reduceMotion || saveData) {
      userPaused = true;
      heroVideo.preload = "metadata";
      setIcon(false);
      ready();
    }
    pick();
    portrait.addEventListener("change", pick);
    heroVideo.addEventListener("playing", ready, { once: true });
    heroVideo.addEventListener("loadeddata", ready, { once: true });
    setTimeout(ready, 1800); // si el video tarda, muestra el póster igual

    heroVideo.addEventListener("timeupdate", () => {
      const t = heroVideo.currentTime;
      if (heroVideo.duration) hero.style.setProperty("--p", (t / heroVideo.duration).toFixed(3));
      if (toggleBtn) toggleBtn.style.setProperty("--p", (t / (heroVideo.duration || 1)).toFixed(3));
      let idx = 0;
      chapters.forEach(([start], i) => { if (t >= start) idx = i; });
      if (idx !== chapterIdx && chapterEl && chapters[idx]) {
        const first = chapterIdx === -1;
        chapterIdx = idx;
        if (first || reduceMotion) { chapterEl.textContent = chapters[idx][1]; return; }
        chapterEl.classList.add("is-swap");
        setTimeout(() => { chapterEl.textContent = chapters[idx][1]; chapterEl.classList.remove("is-swap"); }, 300);
      }
    });
    heroVideo.addEventListener("play", () => setIcon(true));
    heroVideo.addEventListener("pause", () => setIcon(false));
    if (toggleBtn) toggleBtn.addEventListener("click", () => {
      if (heroVideo.paused) { userPaused = false; heroVideo.play().catch(() => {}); }
      else { userPaused = true; heroVideo.pause(); }
    });
    const auto = (on) => {
      if (userPaused) return;
      if (on) heroVideo.play().catch(() => {}); else heroVideo.pause();
    };
    document.addEventListener("visibilitychange", () => auto(!document.hidden));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => auto(e.isIntersecting), { threshold: 0.05 }).observe(hero);
    }
  }

  /* ---------- Videos que cargan y se reproducen al verse ---------- */
  const lazyVideos = $$("video[data-src]");
  if (lazyVideos.length) {
    const load = (v) => { if (!v.getAttribute("src")) { v.src = v.dataset.src; v.preload = "auto"; } };
    if ("IntersectionObserver" in window) {
      const near = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { load(en.target); near.unobserve(en.target); } });
      }, { rootMargin: "300px 300px" });
      const vis = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          const v = en.target;
          if (en.isIntersecting && !reduceMotion && !saveData) { load(v); v.play().catch(() => {}); }
          else v.pause();
        });
      }, { threshold: 0.25 });
      lazyVideos.forEach((v) => {
        if (!saveData) near.observe(v);
        vis.observe(v);
      });
    } else {
      lazyVideos.forEach(load);
    }
  }

  /* ---------- Contador de capacidad ---------- */
  const counter = $("[data-count]");
  if (counter) {
    const target = Number(counter.dataset.count);
    const run = () => {
      if (reduceMotion) { counter.textContent = target; return; }
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 1600);
        const eased = 1 - Math.pow(1 - p, 4);
        counter.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(counter);
    } else run();
  }

  /* ---------- Acordeón de ambientes ---------- */
  const acc = $$(".acc-item");
  if (acc.length) {
    const canHover = window.matchMedia("(hover: hover) and (min-width: 901px)").matches;
    const open = (el) => acc.forEach((a) => a.classList.toggle("is-open", a === el));
    acc.forEach((a) => {
      if (canHover) a.addEventListener("mouseenter", () => open(a));
      a.addEventListener("focusin", () => open(a));
    });
  }

  /* ---------- Carril de eventos ---------- */
  $$("[data-rail]").forEach((wrap) => {
    const rail = $(".rail", wrap);
    const prev = $(".rail-prev", wrap);
    const next = $(".rail-next", wrap);
    if (!rail || !prev || !next) return;
    const stepW = () => (rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width + 16 : 300);
    const update = () => {
      prev.disabled = rail.scrollLeft < 8;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
    };
    prev.addEventListener("click", () => rail.scrollBy({ left: -stepW(), behavior: reduceMotion ? "auto" : "smooth" }));
    next.addEventListener("click", () => rail.scrollBy({ left: stepW(), behavior: reduceMotion ? "auto" : "smooth" }));
    rail.addEventListener("scroll", update, { passive: true });
    update();
  });

  /* ---------- Fotos ---------- */
  const PHOTOS = [
    ["salon-luces", "salon", 900, 1600, "Salón de eventos con luces cálidas"],
    ["piscina-ninos", "piscinas", 1195, 1487, "Familias disfrutando la piscina"],
    ["cancha", "cancha", 1600, 900, "Cancha de grass sintético"],
    ["palapas-mesas", "exteriores", 1600, 900, "Palapas con mesas de madera"],
    ["salon-drapeado", "salon", 900, 1600, "Montaje de banquete con telas y mesas redondas"],
    ["hero-piscina", "piscinas", 896, 1116, "Piscina principal y palapas"],
    ["vista-nocturna", "cancha", 610, 1084, "Vista nocturna del fundo durante un evento"],
    ["camping-atardecer", "exteriores", 896, 1101, "Camping al atardecer"],
    ["piscina-palapas", "piscinas", 900, 1600, "Piscina con palapas"],
    ["salon-bienvenidos", "salon", 900, 1600, "Salón con letrero de bienvenida"],
    ["camping-cancha", "cancha", 1600, 900, "Carpas sobre la cancha"],
    ["piscina-familia", "piscinas", 900, 1600, "Familia en la piscina"],
    ["futbol-campeonato", "cancha", 899, 1600, "Partido de fulbito en la cancha sintética"],
    ["edificio", "exteriores", 900, 1600, "Edificio principal del fundo"],
    ["salon-mesas", "salon", 900, 1600, "Mesas redondas con sillas tiffany"],
    ["piscina-infantil", "piscinas", 720, 1280, "Piscina para niños con flotador"],
    ["palapas-explanada", "exteriores", 1600, 900, "Explanada con palapas"],
    ["futbol-partido", "cancha", 960, 1280, "Jugadores en la cancha"],
    ["piscina-amigos", "piscinas", 720, 1280, "Amigos en la piscina"],
    ["futbolin", "exteriores", 999, 1488, "Futbolín en el área techada"],
    ["cancha-panoramica", "cancha", 1600, 900, "Vista panorámica de la cancha"],
    ["palapa-piscina", "piscinas", 720, 1280, "Vista de la piscina desde una palapa"],
    ["sombra-arboles", "exteriores", 899, 1600, "Toldos de sombra y árboles"],
    ["piscina-flotador", "piscinas", 900, 1600, "Visitantes en flotador dentro de la piscina"],
    ["piscina-vista", "piscinas", 720, 1280, "Piscina con toldo azul"],
  ];
  const byKey = Object.fromEntries(PHOTOS.map((p) => [p[0], p]));

  /* ---------- Lightbox (galería y tiras de cada ambiente) ---------- */
  const VIDEOS = {
    "escenario": ["Orquesta en vivo en el escenario", true],
    "reel-bienvenida": ["Aniversario frente al escenario de bienvenida", false],
    "reel-fiesta": ["Cientos de invitados en una noche de fiesta", false],
    "reel-campeonato": ["Campeonato nocturno en la cancha iluminada", false],
    "reel-camping": ["Camping con carpas sobre la cancha", false],
    "reel-atardecer": ["Vista aérea del fundo al atardecer", false],
  };
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbVid = $("#lbVid");
  const lbCap = $("#lbCap");
  let lbList = [];
  let lbPos = 0;
  let lastFocus = null;
  const showLb = (pos) => {
    lbPos = (pos + lbList.length) % lbList.length;
    const key = lbList[lbPos];
    if (key.startsWith("v:")) {
      const k = key.slice(2);
      const [cap, land] = VIDEOS[k] || ["", false];
      lbImg.hidden = true;
      lbImg.removeAttribute("src");
      lbVid.hidden = false;
      lbVid.classList.toggle("is-land", land);
      lbVid.poster = `assets/video/poster/${k}.webp`;
      lbVid.src = `assets/video/${k}.mp4`;
      lbVid.muted = false;
      lbVid.play().catch(() => { lbVid.muted = true; lbVid.play().catch(() => {}); });
      lbCap.textContent = cap;
      lb.setAttribute("aria-label", "Video ampliado");
      return;
    }
    if (lbVid) { lbVid.pause(); lbVid.hidden = true; lbVid.removeAttribute("src"); lbVid.load(); }
    lbImg.hidden = false;
    lb.setAttribute("aria-label", "Foto ampliada");
    const p = byKey[key];
    lbImg.src = `${IMG}${p[0]}.webp`;
    lbImg.alt = p[4];
    lbCap.textContent = p[4];
  };
  const openLb = (list, key) => {
    lbList = list;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    showLb(Math.max(0, list.indexOf(key)));
    requestAnimationFrame(() => lb.classList.add("is-open"));
    $(".lb-close", lb).focus();
  };
  const closeLb = () => {
    lb.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lbVid) lbVid.pause();
    setTimeout(() => { lb.hidden = true; lbImg.removeAttribute("src"); if (lbVid) { lbVid.removeAttribute("src"); lbVid.load(); } }, 300);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  if (lb) {
    $(".lb-close", lb).addEventListener("click", closeLb);
    $(".lb-prev", lb).addEventListener("click", () => showLb(lbPos - 1));
    $(".lb-next", lb).addEventListener("click", () => showLb(lbPos + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(lbPos - 1);
      if (e.key === "ArrowRight") showLb(lbPos + 1);
      if (e.key === "Tab") {
        const f = $$(".lb-btn", lb).filter((x) => !x.hidden);
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let sx = null;
    lb.addEventListener("touchstart", (e) => { sx = e.target === lbVid ? null : e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) showLb(lbPos + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  // Tiras de fotos en páginas de ambientes: <div class="strip" data-photos="a,b,c">
  $$(".strip[data-photos]").forEach((strip) => {
    const keys = strip.dataset.photos.split(",").map((k) => k.trim()).filter((k) => byKey[k]);
    keys.forEach((k) => {
      const [, , w, h, alt] = byKey[k];
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Ampliar foto: ${alt}`);
      b.innerHTML = `<img src="${IMG}sm/${k}.webp" alt="${alt}" loading="lazy" decoding="async">`;
      b.addEventListener("click", () => openLb(keys, k));
      strip.appendChild(b);
    });
  });

  // Mosaico de inicio: enlaces con data-photo abren el lightbox
  $$("[data-photo]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (!lb) return;
      e.preventDefault();
      const keys = $$("[data-photo]").map((x) => x.dataset.photo);
      openLb(keys, a.dataset.photo);
    });
  });

  // Reels: cada botón con data-video abre el video en grande con sonido
  $$("[data-video]").forEach((btn) => {
    btn.setAttribute("aria-label", `Ver video: ${(VIDEOS[btn.dataset.video] || [""])[0]}`);
    btn.addEventListener("click", () => {
      if (!lb) return;
      const group = btn.closest(".reels");
      const keys = (group ? $$("[data-video]", group) : [btn]).map((x) => "v:" + x.dataset.video);
      openLb(keys, "v:" + btn.dataset.video);
    });
  });

  /* ---------- Galería completa ---------- */
  const masonry = $("#masonry");
  if (masonry) {
    let filter = "all";
    const items = PHOTOS.map(([key, cat, w, h, alt]) => {
      const b = document.createElement("button");
      b.className = "m-item " + (w > h ? "is-land" : "is-port");
      b.type = "button";
      b.dataset.cat = cat;
      b.dataset.key = key;
      b.setAttribute("aria-label", `Ampliar foto: ${alt}`);
      b.innerHTML = `<img src="${IMG}sm/${key}.webp" alt="${alt}" loading="lazy" decoding="async">`;
      return b;
    });
    let visible = [];
    items.forEach((b) => b.addEventListener("click", () => openLb(visible, b.dataset.key)));
    const colCount = () => (window.innerWidth <= 640 ? 2 : window.innerWidth <= 900 ? 3 : 4);
    const render = (animate) => {
      const cols = colCount();
      const chosen = items.filter((el) => filter === "all" || el.dataset.cat === filter);
      chosen.forEach((el) => el.classList.remove("is-compact", "pop"));
      let units = chosen.reduce((n, el) => n + (el.classList.contains("is-land") ? 2 : 1), 0);
      const lands = chosen.filter((el) => el.classList.contains("is-land")).reverse();
      while (units % cols !== 0 && lands.length) { lands.shift().classList.add("is-compact"); units--; }
      visible = chosen.map((el) => el.dataset.key);
      if (animate) chosen.forEach((el, i) => { el.style.setProperty("--k", i); el.classList.add("pop"); });
      masonry.replaceChildren(...chosen);
    };
    $$(".chip[data-filter]").forEach((chip) => chip.addEventListener("click", () => {
      $$(".chip[data-filter]").forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      filter = chip.dataset.filter;
      render(true);
    }));
    render(false);
    let last = colCount();
    window.addEventListener("resize", () => { const c = colCount(); if (c !== last) { last = c; render(false); } }, { passive: true });
  }

  /* ---------- Contacto: pestañas cotizar / visita ---------- */
  const tabs = $$(".tab[data-tab]");
  const panes = $$("[data-pane]");
  const showTab = (name, focus) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    panes.forEach((p) => { p.hidden = p.dataset.pane !== name; });
    if (focus) { const f = $(`[data-pane="${name}"] input`); if (f) f.focus({ preventScroll: true }); }
  };
  if (tabs.length) {
    tabs.forEach((t) => t.addEventListener("click", () => {
      showTab(t.dataset.tab, false);
      history.replaceState(null, "", "#" + t.dataset.tab);
    }));
    const fromHash = () => showTab(location.hash === "#visita" ? "visita" : "cotizar", false);
    fromHash();
    window.addEventListener("hashchange", fromHash);
    // ?tipo=matrimonio preselecciona el tipo de evento
    const tipo = new URLSearchParams(location.search).get("tipo");
    const sel = $("#q-type");
    if (tipo && sel) {
      const opt = $$("option", sel).find((o) => o.dataset.key === tipo);
      if (opt) sel.value = opt.value;
    }
  }

  /* ---------- Formularios → WhatsApp ---------- */
  const fmtDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };
  const today = (() => { const t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); return t.toISOString().slice(0, 10); })();
  $$('input[type="date"]').forEach((d) => { d.min = today; });

  $$("form[data-wa]").forEach((form) => {
    const note = $(".form-note", form);
    const link = $(".wa-link", form);
    const required = $$("[required]", form);
    const check = (input) => {
      const v = input.value.trim();
      const ok = input.type === "number" ? Number(v) > 0 : v.length >= (input.tagName === "SELECT" ? 1 : 2);
      input.closest(".field").classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    };
    required.forEach((input) => input.addEventListener(input.tagName === "SELECT" ? "change" : "input", () => {
      if (input.closest(".field").classList.contains("has-error")) check(input);
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = required.map(check);
      if (results.includes(false)) {
        const bad = $(".field.has-error input, .field.has-error select", form);
        if (bad) bad.focus();
        note.textContent = "Revisa los campos marcados.";
        note.classList.remove("ok");
        return;
      }
      const data = new FormData(form);
      const get = (k) => (data.get(k) || "").toString().trim();
      let lines;
      if (form.dataset.wa === "visita") {
        lines = [
          "Hola, quisiera *agendar una visita* a Fundo Salinas.",
          "",
          `*Nombre:* ${get("nombre")}`,
          `*Día preferido:* ${fmtDate(get("fecha")) || "A coordinar"}`,
          `*Horario:* ${get("horario") || "A coordinar"}`,
          `*Evento que planeo:* ${get("tipo") || "Por definir"}`,
        ];
      } else {
        lines = [
          "Hola, quisiera *cotizar un evento* en Fundo Salinas.",
          "",
          `*Nombre:* ${get("nombre")}`,
          `*Tipo de evento:* ${get("tipo")}`,
          `*N° de invitados:* ${get("invitados")}`,
          `*Fecha tentativa:* ${fmtDate(get("fecha")) || "Por definir"}`,
        ];
        const servicios = data.getAll("servicios");
        if (servicios.length) lines.push(`*Me interesa:* ${servicios.join(", ")}`);
      }
      const msg = get("mensaje");
      if (msg) lines.push("", msg);
      const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
      link.href = url;
      link.hidden = false;
      let win = null;
      try { win = window.open(url, "_blank"); } catch (_) { win = null; }
      if (win) { win.opener = null; note.textContent = "¡Listo! Se abrió WhatsApp con tu mensaje. Solo presiona enviar."; }
      else { note.textContent = "Tu mensaje está listo. Toca el botón de abajo para abrirlo en WhatsApp."; }
      note.classList.add("ok");
    });
  });
})();
