/* =====================================================================
   L’ASSISTANT DU BERCEAU — widget conversationnel + capture de contacts.
   Boxing Center Minimes.

   Philosophie (≠ formulaire) : le bot se présente, demande le prénom,
   puis RÉPOND. Il comprend le langage naturel via /api/chat (ancré sur
   les vraies données de la salle) et capte AU VOL les coordonnées quand
   le visiteur les donne — sans jamais l’interroger de force.

   Progressive enhancement : la pastille `.chatbot` reste un lien tel:
   dans le HTML. Ce fichier la PROMEUT en lanceur de conversation. Si le
   script ne se charge pas, elle appelle la salle comme avant — jamais un
   bouton mort.

   Accessibilité : dialog modal, focus piégé, Échap ferme, aria-live sur
   le fil, respect de prefers-reduced-motion (l’animation d’ouverture est
   coupée en CSS, la frappe simulée est raccourcie ici).
   ===================================================================== */
import { SALLE, NETWORK } from "./data.js?v=b56";

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
/* numéro FR : +33 ou 0, puis 9 chiffres groupés librement */
const PHONE_RE = /(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}/;
/* « je m’appelle X », « moi c’est X », « mon prénom est X »… Déclencheurs
   SPÉCIFIQUES : pas de « c’est » nu, qui capterait « c’est ouvert ». */
const NAME_RE = /(?:je m['’ ]?appelle|moi c['’ ]?est|mon nom est|mon pr[ée]nom (?:est|c['’ ]?est)|je me nomme|c['’ ]est\s+moi)\s+([a-zà-öø-ÿ][a-zà-öø-ÿ'’-]+)/i;
const STOP_NAMES = /^(bonjour|salut|coucou|hello|merci|oui|non|ok|d['’]accord|bien|super|cool|pas|ouvert|ferm[ée]?|combien|quoi|quel|quelle|quels|quelles|qui|quand|o[uù]|comment|pourquoi|est|c['’]est|je|tu|vous|moi|toi|rien|aucun|anonyme|voir|bof|jsp|ouais|nan|hey|yo|allo|bjr|slt|svp|stp|test|info|infos|tarif|tarifs|prix|horaire|horaires|essai|boxe|cours|planning|adresse|t[ée]l[ée]phone|mail|email)$/i;
/* Forme d’un prénom : des lettres, éventuellement un trait d’union ou
   une apostrophe. Deux à vingt caractères. Rien d’autre. */
const NAME_SHAPE = /^[a-zà-öø-ÿ][a-zà-öø-ÿ'’-]{1,19}$/i;

const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LOGO = "/assets/img/logo.png";
const SALLES = [SALLE.short, ...NETWORK.map((n) => n.name)];

const QUICKS = [
  { label: "L’offre 29€", q: "Quels sont les tarifs ?" },
  { label: "Essai 10€", q: "Comment se passe la séance d’essai ?" },
  { label: "Horaires", q: "Quels sont les horaires ?" },
  { label: "Les cours", q: "Quelles disciplines proposez-vous ?" },
  { label: "Dès 3 ans", q: "Vous avez des cours pour les enfants ?" },
];

const delay = (ms) => new Promise((r) => setTimeout(r, REDUCE ? Math.min(ms, 120) : ms));
const titleCase = (s) => s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function sessionId() {
  try {
    let id = sessionStorage.getItem("bcm-chat");
    if (!id) { id = (crypto.randomUUID?.() || String(Math.random()).slice(2)); sessionStorage.setItem("bcm-chat", id); }
    return id;
  } catch { return String(Math.random()).slice(2); }
}

/* ---------- réseau ---------- */
async function askAi(message, history, context) {
  const r = await fetch("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });
  if (!r.ok) throw new Error("chat " + r.status);
  const j = await r.json();
  if (!j.reply) throw new Error("chat vide");
  return j.reply;
}
function submitLead(payload) {
  return fetch("/api/lead", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, page: location.pathname }),
  });
}
/* Repli si /api/chat est injoignable (dev statique, réseau coupé) : la
   salle répond quand même. Volontairement court — la vraie base de
   connaissance vit côté serveur, dans api/chat.js. */
function offlineAnswer() {
  return `Je n’arrive pas à joindre le club à l’instant. Appelle la salle au ${SALLE.phone}, ou passe au ${SALLE.address.full} — du lundi au samedi, ${SALLE.hours.replace(/^Lun – Sam · /, "")}.`;
}


/* ---------- la mesure : d’où vient la vente ? ----------
   Jusqu’ici, un visiteur envoyé sur la boutique par l’assistant arrivait
   anonyme : impossible de prouver que le bot vend quoi que ce soit. Les
   liens sortants portent désormais leur origine.

   ⚠ Les paramètres se posent AVANT l’ancre. Une URL qui finirait par
   « #promo?utm_source=… » enverrait l’ancre au diable : la boutique
   ouvrirait le haut de la page des abonnements au lieu de la promo, et
   personne ne verrait le défaut avant de compter les ventes perdues. */
const UTM = "utm_source=chatbot&utm_medium=bouton&utm_campaign=bc-minimes";
function marque(url) {
  const i = url.indexOf("#");
  const base = i === -1 ? url : url.slice(0, i);
  const ancre = i === -1 ? "" : url.slice(i);
  return base + (base.includes("?") ? "&" : "?") + UTM + ancre;
}

/* Destinations que le bot propose en BOUTONS — la pensée Portet émulée :
   clés fermées (un lien halluciné est impossible), boutique box-plus +
   pages internes de CE site, « rappel » reste une action du chat. */
const ACTIONS = {
  offre:       { label: "Je profite de l’offre à 29€", href: marque("https://boutique.boxingcenter.fr/offre/29") },
  saison:      { label: "Je réserve ma saison · 259€", href: marque("https://boutique.boxingcenter.fr/offre/259") },
  essai:       { label: "Je viens essayer · 10€", href: marque("https://boutique.boxingcenter.fr/seance-essai") },
  enfants:     { label: "J’inscris mon enfant", href: marque("https://boutique.boxingcenter.fr/abonnements") },
  abonnements: { label: "Voir les abonnements", href: marque("https://boutique.boxingcenter.fr/abonnements") },
  boutique:    { label: "La boutique du club", href: marque("https://boutique.boxingcenter.fr/") },
  premiere:    { label: "Ta première séance, pas à pas", href: "/premiere-seance/" },
  tarifs:      { label: "Les tarifs en détail", href: "/tarifs/" },
  planning:    { label: "Voir le planning", href: "/plannings/" },
  disciplines: { label: "Découvrir les cours", href: "/activites/" },
  club:        { label: "Visiter la salle", href: "/le-club/" },
  coachs:      { label: "Rencontrer les coachs", href: "/coachs/" },
  galerie:     { label: "Voir la galerie", href: "/galerie/" },
  contact:     { label: "Adresse & contact", href: "/contact/" },
  appeler:     { label: "Appeler la salle", href: "tel:+33562244682" },
  rappel:      { label: "Être rappelé par un coach", act: "rappel" },
};
function resolveActions(keys) {
  const out = [];
  for (const k of keys) {
    const [key, ...rest] = String(k).split(":");
    const def = ACTIONS[key.trim()];
    if (!def) continue;
    const label = rest.join(":").trim();
    if (!out.some((a) => (a.href || a.act) === (def.href || def.act))) out.push(label ? { ...def, label } : def);
    if (out.length >= 3) break;
  }
  return out;
}
function parseReply(rawText) {
  let text = String(rawText);
  const keys = [];
  text = text.replace(/\[\s*(?:boutons|buttons)\s*:\s*([^\]]+)\]/gi, (_, list) => {
    keys.push(...list.split(",").map((s) => s.trim()).filter(Boolean));
    return "";
  });
  /* ⚠ LES DEUX HÔTES, ET LE VIEUX RAMENÉ SUR LE NEUF.
     La boutique a déménagé de box-plus.vercel.app vers
     boutique.boxingcenter.fr. Ce filtre — celui qui transforme une URL
     citée par le modèle en BOUTON — ne connaissait que l'ancien hôte : il
     ne voyait plus passer les liens que le site lui donne aujourd'hui, et
     la comparaison avec ACTIONS[].href (migré, lui) ne pouvait plus
     aboutir. Aucun bouton ne se serait plus formé, l'URL serait restée
     affichée en clair dans la bulle.
     On accepte donc les deux, et on NORMALISE l'ancien vers le nouveau
     avant comparaison : un lien hérité continue de trouver son bouton, et
     le visiteur n'est jamais envoyé sur un domaine mort. */
  text = text.replace(/(?:https?:\/\/)?(?:box-plus\.vercel\.app|boutique\.boxingcenter\.fr)[\w\/#-]*/gi, (u) => {
    const href = (u.startsWith("http") ? u : "https://" + u)
      .replace("box-plus.vercel.app", "boutique.boxingcenter.fr")
      .replace(/\/$/, "");
    /* Le modèle écrit l’URL NUE ; nos boutons la portent balisée d’UTM. On
       compare donc sans les paramètres — mais AVEC l’ancre, seule à
       distinguer #promo de #enfants. Sans ce nettoyage, une URL citée en
       clair ne retrouvait plus son bouton et restait affichée telle quelle. */
    const cle = (v) => { const s = String(v || ""); const i = s.indexOf("#"); const b = (i === -1 ? s : s.slice(0, i)).split("?")[0].replace(/\/$/, ""); return b + (i === -1 ? "" : s.slice(i)); };
    const hit = Object.entries(ACTIONS).find(([, d]) => cle(d.href) === cle(href));
    if (hit && !keys.some((k) => k.split(":")[0] === hit[0])) keys.push(hit[0]);
    return hit ? "la boutique en ligne" : u;
  });
  text = text.replace(/\s{2,}/g, " ").replace(/\s+([.,!?])/g, "$1").trim();
  return { text, actions: resolveActions(keys) };
}

export function initChatbot() {
  const launcher = document.querySelector("a.chatbot, button.chatbot");
  if (!launcher || document.getElementById("bcm-chat")) return;

  const sid = sessionId();
  const profile = { prenom: "", nom: "", email: "", phone: "", salle: SALLE.short };
  /* Le profil survit à la navigation (même session) : le bot ne redemande
     jamais, et les formulaires du site se préremplissent avec. */
  const PROFIL_KEY = "bcm-chat-profil";
  try { Object.assign(profile, JSON.parse(sessionStorage.getItem(PROFIL_KEY) || "{}")); } catch { /* profil vierge */ }
  const memoriserProfil = () => { try { sessionStorage.setItem(PROFIL_KEY, JSON.stringify(profile)); } catch { /* stockage indispo */ } };
  const history = [];
  let opened = false, typing = false, exchanges = 0;
  let nudged = false;      // l’invitation douce a-t-elle déjà été faite ?
  let expectName = false;  // le bot vient de demander le prénom
  let leadSig = "";        // signature du dernier lead envoyé (anti-doublon)
  let callbackAsked = false;
  let lastFocus = null;

  /* ---------- l’habillage ----------
     La feuille du panneau ne vit plus dans base.css : elle ne servait
     qu’ici, et base.css bloque le rendu des 8 pages. On la pose dès que
     le module s’exécute — c’est-à-dire à l’INTENTION de parler, avant
     tout affichage. `open()` attend qu’elle soit appliquée : le panneau
     ne peut donc pas apparaître nu une seule image. */
  const feuille = new Promise((resolu) => {
    const dejaLa = document.querySelector('link[data-bcm-chat-css]');
    if (dejaLa) return resolu();
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/assets/css/chatbot.css?v=b56";
    l.setAttribute("data-bcm-chat-css", "");
    /* résolu dans les deux cas : une feuille manquante ne doit jamais
       retenir le panneau prisonnier — mieux vaut brut que rien. */
    l.addEventListener("load", () => resolu(), { once: true });
    l.addEventListener("error", () => resolu(), { once: true });
    document.head.appendChild(l);
  });

  /* ---------- l’échafaudage ---------- */
  const root = document.createElement("div");
  root.className = "bcm-chat";
  root.id = "bcm-chat";
  root.hidden = true;
  root.innerHTML = `
    <section class="bcm-chat__panel" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="bcm-chat-title">
      <header class="bcm-chat__head">
        <img src="${LOGO}" alt="" width="342" height="160" decoding="async" />
        <div class="bcm-chat__head-text">
          <strong id="bcm-chat-title">Boxing Center Minimes</strong>
          <span class="bcm-chat__status">L’assistant du club</span>
        </div>
        <button type="button" class="bcm-chat__close" aria-label="Fermer l’assistant">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </header>
      <div class="bcm-chat__log" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div class="bcm-chat__chips" hidden></div>
      <form class="bcm-chat__form">
        <input type="text" autocomplete="off" aria-label="Ton message" placeholder="Écris ta question…" />
        <button class="bcm-chat__send" type="submit" aria-label="Envoyer">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h14M14 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const panel = root.querySelector(".bcm-chat__panel");
  const logEl = root.querySelector(".bcm-chat__log");
  const chipsEl = root.querySelector(".bcm-chat__chips");
  const form = root.querySelector(".bcm-chat__form");
  const input = form.querySelector("input");
  const sendBtn = form.querySelector(".bcm-chat__send");
  const closeBtn = root.querySelector(".bcm-chat__close");

  /* ---------- rendu ---------- */
  const msgs = [];
  function render() {
    logEl.innerHTML = msgs.map((m) => {
      const actions = m.actions && m.actions.length ? `<div class="bcm-chat__actions">${m.actions.map((a) => {
        if (a.act) return `<button type="button" class="bcm-chat__action bcm-chat__action--ext" data-act="${a.act}">${esc(a.label)}</button>`;
        const ext = /^https?:/i.test(a.href);
        return `<a class="bcm-chat__action${ext ? " bcm-chat__action--ext" : ""}" href="${a.href.replace(/"/g, "&quot;")}"${ext ? ` target="_blank" rel="noopener"` : ""}>${esc(a.label)}${ext ? ` <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 9 9 3M4.5 3H9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}</a>`;
      }).join("")}</div>` : "";
      return `
      <div class="bcm-chat__msg bcm-chat__msg--${m.role}">
        ${m.role === "bot" ? `<img src="${LOGO}" alt="" width="342" height="160" decoding="async" />` : ""}
        <div class="bcm-chat__stack"><div class="bcm-chat__bubble">${esc(m.text)}</div>${actions}</div>
      </div>`;
    }).join("") + (typing ? `
      <div class="bcm-chat__msg bcm-chat__msg--bot">
        <img src="${LOGO}" alt="" width="342" height="160" decoding="async" />
        <div class="bcm-chat__bubble"><span class="bcm-chat__dots" aria-label="L’assistant écrit"><i></i><i></i><i></i></span></div>
      </div>` : "");
    logEl.scrollTop = logEl.scrollHeight;
  }
  async function botSay(text, pause = 550, actions) {
    typing = true; sendBtn.disabled = true; render();
    await delay(pause);
    typing = false; sendBtn.disabled = false;
    msgs.push({ role: "bot", text, actions }); render();
  }
  function userSay(text) { msgs.push({ role: "user", text }); render(); }

  function showChips() {
    chipsEl.innerHTML = QUICKS.map((q) => `<button type="button" data-q="${q.q.replace(/"/g, "&quot;")}">${q.label}</button>`).join("")
      + `<button type="button" data-callback>Être rappelé</button>`;
    chipsEl.hidden = false;
  }
  const hideChips = () => { chipsEl.hidden = true; chipsEl.innerHTML = ""; };
  logEl.addEventListener("click", (e) => {
    const act = e.target.closest("button[data-act]");
    if (act && act.dataset.act === "rappel") startCallback();
  });

  /* ---------- capture au fil de l’eau ---------- */
  function contextString() {
    const b = [];
    if (profile.prenom) b.push(`Prénom : ${profile.prenom}`);
    if (profile.salle) b.push(`Salle : ${profile.salle}`);
    if (profile.email) b.push("Email déjà donné");
    if (profile.phone) b.push("Téléphone déjà donné");
    return b.join(". ");
  }
  function maybeSubmitLead(event) {
    if (!profile.email && !profile.phone) return false; // rien pour recontacter
    const sig = JSON.stringify(profile);
    if (sig === leadSig) return false;                  // déjà parti à l’identique
    leadSig = sig;
    submitLead({
      event, sessionId: sid,
      prenom: profile.prenom, nom: profile.nom,
      name: [profile.prenom, profile.nom].filter(Boolean).join(" ").trim(),
      email: profile.email, phone: profile.phone, salle: profile.salle,
    }).catch(() => { /* silencieux : ne bloque jamais la conversation */ });
    return true;
  }
  /** Le prénom donné en un mot, après la question « tu t’appelles
   *  comment ? ». On retire d’abord l’email, le numéro et les chiffres
   *  — « Marc 06 12 34 56 78 » est une réponse parfaitement normale —
   *  puis on n’accepte QUE s’il ne reste qu’un seul mot, de la forme
   *  d’un prénom, hors liste noire.
   *
   *  La règle est volontairement stricte : le fallback précédent prenait
   *  le premier mot de n’importe quel message, si bien qu’une question
   *  posée à la place d’une réponse (« Quels sont les horaires ? ») se
   *  transformait en prénom « Quels » — écrit tel quel dans le carnet du
   *  club. Un carnet sans prénom se lit ; un carnet avec un faux prénom
   *  ment au coach qui rappelle. Dans le doute : on ne capte rien. */
  function loneName(text) {
    const reste = text.replace(EMAIL_RE, " ").replace(PHONE_RE, " ").replace(/\d+/g, " ");
    if (/[?¿]/.test(reste)) return "";                       // une question n’est pas une réponse
    const mots = reste.trim().replace(/[!.,;:]+$/, "").split(/\s+/).filter(Boolean);
    if (mots.length !== 1) return "";                        // un prénom seul, ou rien
    const w = mots[0].replace(/[!.,;:]+$/, "");
    return NAME_SHAPE.test(w) && !STOP_NAMES.test(w) ? w : "";
  }
  /** Extrait prénom / email / téléphone / salle. true si du neuf est capté.
   *  `saisie` distingue une frappe au clavier d’une puce cliquée : une
   *  puce est une question toute faite, jamais une réponse au bot. */
  function extract(text, saisie) {
    let found = false;
    const email = text.match(EMAIL_RE);
    if (email && !profile.email) { profile.email = email[0]; found = true; }
    const phone = text.match(PHONE_RE);
    if (phone && !profile.phone) { profile.phone = phone[0].replace(/\s+/g, " ").trim(); found = true; }
    const salle = SALLES.find((s) => new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
    if (salle && salle !== profile.salle) { profile.salle = salle; found = true; }
    if (!profile.prenom) {
      const name = text.match(NAME_RE)?.[1]?.trim()           // « moi c’est Marc » : explicite
        || (expectName && saisie ? loneName(text) : "");      // ou un prénom seul, après la question
      if (name && !STOP_NAMES.test(name)) { profile.prenom = titleCase(name.split(/\s+/)[0]); found = true; }
    }
    /* La question du prénom ne se referme que sur une vraie réponse
       tapée : si le visiteur clique une puce à la place, elle reste
       posée — et un « Marc » tapé plus tard sera encore entendu. */
    if (saisie) expectName = false;
    if (found) memoriserProfil();
    return found;
  }

  /* ---------- la conversation ---------- */
  async function answer(text, saisie = true) {
    const gotNew = extract(text, saisie);
    const sent = gotNew ? maybeSubmitLead(callbackAsked ? "callback_request" : "lead_collected") : false;

    hideChips();
    let reply, actions = [];
    try {
      const parsed = parseReply(await askAi(text, history.slice(-6), contextString()));
      reply = parsed.text; actions = parsed.actions;
    } catch { reply = offlineAnswer(); actions = resolveActions(["appeler", "contact"]); }
    history.push({ role: "user", content: text }, { role: "assistant", content: reply });
    await botSay(reply, 550, actions);
    exchanges++;

    if (sent && callbackAsked) {
      callbackAsked = false;
      await botSay(`C’est noté${profile.prenom ? `, ${profile.prenom}` : ""} — je transmets à Mehdi, un coach te rappelle.`, 450);
    } else if (!nudged && exchanges >= 2 && !profile.email && !profile.phone) {
      nudged = true;
      await botSay("Au fait — si tu veux qu’un coach te rappelle ou t’envoie le planning, laisse-moi ton prénom et un numéro ou un email. Quand tu veux, pas d’obligation.", 450);
    }
    showChips();
  }

  async function startCallback() {
    callbackAsked = true;
    hideChips();
    if (profile.email || profile.phone) {
      maybeSubmitLead("callback_request");
      await botSay(`Ça marche${profile.prenom ? `, ${profile.prenom}` : ""} — je transmets, un coach te rappelle. En attendant, une question sur la salle ?`);
      callbackAsked = false;
      showChips();
      return;
    }
    expectName = !profile.prenom;
    await botSay(profile.prenom
      ? `Avec plaisir ${profile.prenom} — laisse-moi un numéro ou un email et un coach te rappelle.`
      : "Avec plaisir — dis-moi ton prénom et un numéro (ou un email), et un coach te rappelle.");
    input.placeholder = "Ton prénom et ton numéro…";
    input.focus();
  }

  /* ---------- ouverture / fermeture, focus piégé ---------- */
  const FOCUSABLE = 'button:not([disabled]), input, a[href], [tabindex]:not([tabindex="-1"])';
  function trap(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  async function open() {
    lastFocus = document.activeElement;
    await feuille;              // jamais de panneau nu, pas une image
    root.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", trap, true);
    input.focus();
    if (!opened) {
      opened = true;
      /* Bonjour d'abord, argumentaire ensuite : le message ouvrait sur les
         metres carres et le prix, ce qui presse au lieu d'accueillir. */
      /* Trois temps, jamais plus : bonjour + je vois ou vous etes, UN
         fait vrai sur cette page, une question ouverte. Le fait est ce
         qui separe un assistant d'un pop-up. Chiffres verifies dans
         data.js, un par un. */
      const ACCUEILS = {
        "/tarifs/": ["Bonjour \u{1F44B} Vous \u00eates sur les tarifs.", "Cinq formules. La rentr\u00e9e \u00e0 29\u20ac par personne est la plus prise. Je vous aide \u00e0 choisir\u00a0?"],
        "/activites/": ["Bonjour \u{1F44B} Vous regardez les disciplines.", "Neuf, de l\u2019\u00e9cole d\u00e8s 3 ans au sparring encadr\u00e9. Dites-moi votre objectif."],
        "/plannings/": ["Bonjour \u{1F44B} Vous cherchez un cr\u00e9neau.", "Ouvert du lundi au samedi, 10h\u201321h30. Donnez-moi vos dispos, je vous dis lequel prendre."],
        "/coachs/": ["Bonjour \u{1F44B} Vous regardez l\u2019\u00e9quipe.", "Quatre encadrants, Mehdi \u00e0 leur t\u00eate. Une question sur l\u2019un d\u2019eux\u00a0?"],
        "/le-club/": ["Bonjour \u{1F44B} Vous d\u00e9couvrez le club.", "C\u2019est la salle historique du r\u00e9seau, 12 rue de Fenouillet. Envie de venir voir\u00a0?"],
        "/galerie/": ["Bonjour \u{1F44B} Vous parcourez la galerie.", "Douze cl\u00e9ich\u00e9s \u2014 mais rien ne vaut la salle en vrai. Une question avant de passer\u00a0?"],
        "/premiere-seance/": ["Bonjour \u{1F44B} Vous pr\u00e9parez votre premi\u00e8re s\u00e9ance.", "Gants pr\u00eat\u00e9s, aucun niveau demand\u00e9, pas de sparring impos\u00e9. Une question\u00a0?"],
        "/contact/": ["Bonjour \u{1F44B} Vous cherchez \u00e0 nous joindre.", "05 62 24 46 82 \u2014 ou laissez-moi votre num\u00e9ro, un coach rappelle dans la journ\u00e9e."],
      };
      const _page = location.pathname.replace(/index\.html$/, "");
      const [_b, _s] = ACCUEILS[_page] || ["Bonjour \u{1F44B} Ici l’assistant du Boxing Center Minimes.", "Horaires, cours, tarifs — posez votre question, je vous réponds."];
      await botSay(_b, 450);
      await botSay(_s, 620, resolveActions(["offre", "essai"]));
      /* Le prenom en TROISIEME bulle, apres deux messages qui ont deja
         rendu service : ce n'est plus une exigence, c'est une conversation
         qui commence. Au vouvoiement, comme les deux bulles au-dessus —
         c'etait le tutoiement qui detonnait, pas la question. */
      expectName = true;
      await botSay("Et vous, comment vous appelez-vous ?", 420);
      showChips();
    }
  }
  function close() {
    root.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", trap, true);
    lastFocus?.focus?.();
  }

  /* ---------- promotion de la pastille ---------- */
  launcher.setAttribute("role", "button");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "bcm-chat");
  launcher.setAttribute("aria-label", "Ouvrir l’assistant du Boxing Center Minimes");
  const label = launcher.querySelector(".chatbot__label");
  if (label) label.textContent = "Parler au club";
  launcher.addEventListener("click", (e) => {
    e.preventDefault();                       // le tel: reste le repli sans JS
    root.hidden ? void open() : close();
  });

  /* ---------- événements ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || typing) return;
    input.value = "";
    input.placeholder = "Écris ta question…";
    userSay(text);
    await answer(text);
  });
  chipsEl.addEventListener("click", async (e) => {
    if (e.target.closest("button[data-callback]")) return void startCallback();
    const b = e.target.closest("button[data-q]");
    if (b) { const t = b.dataset.q; userSay(t); await answer(t, false); }  // puce = question, pas réponse
  });
  closeBtn.addEventListener("click", close);


}

initChatbot();
