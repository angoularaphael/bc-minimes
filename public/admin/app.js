/* ============================================================
   LE COIN BLEU — l'atelier du site Boxing Center Minimes.
   Tout le contenu modifiable vit dans src/content.json ; ce
   fichier génère les formulaires depuis SCHEMA, garde un
   brouillon local, ouvre un aperçu, et publie (commit GitHub +
   reconstruction Vercel). Les visites guidées vivent dans tour.js.

   Sommaire : 1. état & helpers   4. sections spéciales
              2. schéma            5. charger / publier
              3. champs            6. démarrage
   ============================================================ */

/* ---------- 1. état & helpers ---------- */
let TOKEN = sessionStorage.getItem("bcm_admin") || "";
let DATA = {};                 // le modèle : une copie de content.json
let CURRENT = "dashboard";
let READONLY = false;          // dépôt non branché : on lit, on ne publie pas
let READONLY_WHY = "";

/** Crée un élément. `class`/`html` à part ; `on*` deviennent des listeners. */
const el = (t, a = {}, ...kids) => {
  const n = document.createElement(t);
  for (const k in a) {
    if (a[k] == null) continue;
    if (k === "class") n.className = a[k];
    else if (k === "html") n.innerHTML = a[k];
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), a[k]);
    else n.setAttribute(k, a[k]);
  }
  for (const c of kids) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
};
function setStatus(msg, cls = "") {
  const s = document.getElementById("status");
  s.textContent = msg; s.className = "status " + cls;
}
const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS = {
  dashboard: I('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>'),
  salle:     I('<path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>'),
  promos:    I('<path d="M3.5 11.5v-8h8l9 9-8 8-9-9Z"/><circle cx="8.2" cy="8.2" r="1.5"/>'),
  avis:      I('<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/>'),
  coaches:   I('<circle cx="9" cy="8" r="3.1"/><path d="M3.2 19.5c.5-3 2.9-5 5.8-5s5.3 2 5.8 5"/><circle cx="17" cy="9" r="2.3"/><path d="M17.5 14.6c2.1.6 3.3 2.3 3.6 4.4"/>'),
  planning:  I('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>'),
  faq:       I('<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.4"/><path d="M12 17.2h.01"/>'),
  leads:     I('<path d="M3.5 6.5h17v11h-17z"/><path d="m3.9 7.2 8.1 6 8.1-6"/>'),
  community: I('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="8.6" cy="9.8" r="1.6"/><path d="m4 16.5 4.4-4.2 3.3 3.1 3.2-3.4 5.1 4.9"/>'),
};

/* ---------- 2. schéma : chaque entrée pilote un formulaire ---------- */
const SCHEMA = {
  dashboard: { label: "Accueil", type: "dashboard" },

  salle: { label: "La salle", type: "object",
    intro: "Le nom, les coordonnées, les horaires et l'accès. Ces informations sont reprises partout : en-tête, pied de page, page Contact, données Google… et l'assistant du site répond avec.",
    fields: [
      { k: "name", label: "Nom du club" },
      { k: "baseline", label: "Accroche courte" },
      { k: "district", label: "Quartier" },
      { k: "phone", label: "Téléphone (affiché)", half: true },
      { k: "phoneHref", label: "Téléphone (lien)", half: true, hint: "Format international, sans espace : +33562244682" },
      { k: "email", label: "Email" },
      { k: "hours", label: "Horaires (phrase affichée)", hint: "Exemple : Lun – Sam · 10h00 – 21h30" },
      { k: "address", label: "Adresse", type: "object", fields: [
        { k: "street", label: "Rue" }, { k: "zip", label: "Code postal", half: true }, { k: "city", label: "Ville", half: true },
      ]},
      { k: "hoursData", label: "Horaires détaillés", type: "list", singular: "ligne", item: [
        { k: "d", label: "Jour(s)" }, { k: "h", label: "Heures" },
      ]},
      { k: "access", label: "Comment venir", type: "strlist", hint: "Une ligne par moyen d'accès (métro, rocade, bus). Écris puis Entrée." },
    ]},

  promos: { label: "Les offres", type: "object",
    intro: "Les offres de la page Tarifs, dans l'ordre où le visiteur les lit. Attention : l'offre Étudiant garde TOUJOURS « carte étudiante requise » dans la case Unité — sans elle, un adulte croit avoir droit au tarif étudiant.",
    fields: [
      { k: "bonus", label: "Le bonus de la saison", ml: true },
      { k: "cards", label: "Les offres", type: "list", singular: "offre", title: "name", item: [
        { k: "name", label: "Nom de l'offre" },
        { k: "price", label: "Prix", half: true }, { k: "unit", label: "Unité", half: true, hint: "Exemple : carte étudiante requise" },
        { k: "was", label: "Prix barré", half: true }, { k: "period", label: "Période", half: true },
        { k: "feature", label: "Phrase de mise en avant", ml: true },
        { k: "items", label: "Ce que ça comprend", type: "strlist" },
        { k: "cta", label: "Texte du bouton", half: true }, { k: "tag", label: "Étiquette", half: true },
        { k: "href", label: "Lien du bouton" },
      ]},
    ]},

  avis: { label: "Les avis", type: "object",
    intro: "La note Google affichée sur la page Tarifs. Un compte d'avis bouge toutes les semaines : ouvre la fiche Google du club, relis le chiffre du jour et recopie-le ici. Si tu n'es pas sûr du nombre, laisse-le vide — la page affichera la note seule plutôt qu'un chiffre faux.",
    fields: [
      { k: "rating", label: "La note", half: true, hint: "Exactement comme sur Google, virgule comprise : 4,3" },
      { k: "scale", label: "Sur combien", half: true, hint: "5" },
      { k: "count", label: "Nombre d'avis", half: true, hint: "Le chiffre seul : 157. Vide = pas de nombre affiché." },
      { k: "source", label: "Source affichée", half: true, hint: "Ce qui est écrit sous la note. Exemple : Avis Google" },
    ]},

  coaches: { label: "Les coachs", type: "object",
    intro: "Le coach principal et le reste de l'équipe. Règle de la maison : un nom = la bonne photo. Tant qu'on n'a pas le vrai portrait de quelqu'un, on garde sa tuile initiales — on ne met jamais le visage d'un autre.",
    fields: [
      { k: "pillar", label: "Le coach principal", type: "object", fields: [
        { k: "name", label: "Nom affiché", half: true }, { k: "planName", label: "Nom dans le planning", half: true, hint: "Doit être écrit EXACTEMENT comme dans la section Planning, sinon le compte de créneaux tombe à zéro." },
        { k: "role", label: "Rôle", half: true }, { k: "tag", label: "Étiquette", half: true },
        { k: "note", label: "Note", ml: true },
      ]},
      { k: "roster", label: "Le reste de l'équipe", type: "list", singular: "coach", title: "name", item: [
        { k: "name", label: "Prénom", half: true }, { k: "initials", label: "Initiale", half: true },
        { k: "planName", label: "Nom dans le planning", hint: "Identique à la colonne Coach du planning." },
        { k: "role", label: "Rôle" },
        { k: "note", label: "Note", ml: true },
      ]},
    ]},

  planning: { label: "Le planning", type: "list", singular: "créneau", title: "name",
    intro: "Un créneau par ligne. Les flèches déplacent une ligne. Ce que tu écris ici alimente la grille de la page Planning, les compteurs de la page Coachs et les réponses de l'assistant — tout d'un coup.",
    item: [
      { k: "d", label: "Jour", half: true, hint: "Lundi, Mardi, Mercredi, Jeudi, Vendredi ou Samedi" },
      { k: "name", label: "Nom du cours", half: true },
      { k: "h", label: "Début", half: true, hint: "Format 18h30" }, { k: "end", label: "Fin", half: true },
      { k: "coach", label: "Coach", half: true }, { k: "age", label: "Public", half: true },
      { k: "disc", label: "Discipline (clé du filtre)", hint: "anglaise · competiteurs · educative · lady · camp · sparring · pieds-poings" },
    ]},

  faq: { label: "Les questions", type: "list", singular: "question", title: "q",
    intro: "Les questions de la page Contact. Elles sont aussi lues par Google (bloc « questions fréquentes »). Réponds comme tu parles : tutoiement, phrases courtes.",
    item: [{ k: "q", label: "La question" }, { k: "a", label: "La réponse", ml: true }]},

  community: { label: "La galerie du club", type: "community" },
  leads: { label: "Les contacts", type: "leads" },
};

/* ---------- brouillon, état « modifié », aperçu ---------- */
const DRAFT_KEY = "bcm:draft";
/* Jeton de cache du site : un brouillon ecrit sous un autre jeton est
   perime, data.js l'ignore et le purge. A bumper avec le v=bNN. */
const BC_JETON = "b30";
let DIRTY = false, BUSY = false, draftT;
function saveDraft() { clearTimeout(draftT); draftT = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...DATA, __jeton: BC_JETON })); } catch (e) {} }, 400); }
function markDirty() { DIRTY = true; saveDraft(); updateDirtyUI(); }
function clearDirty() { DIRTY = false; try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} updateDirtyUI(); }
function updateDirtyUI() {
  if (DIRTY) setStatus("Modifications non publiées");
  updatePublishUI();
  if (CURRENT === "dashboard") renderSection("dashboard");
}

/* ---------- PUBLIER : disponible, ou expliqué ----------
   Le bouton était grisé sans un mot dès qu'un champ était touché : la
   ligne d'état, seule porteuse de l'explication, était écrasée par
   « Modifications non publiées » — l'explication disparaissait très
   exactement au moment où elle servait. Une seule fonction décide donc
   maintenant de l'état du bouton ET de la phrase qui l'accompagne, et
   cette phrase a son propre bandeau que rien ne vient recouvrir. */
function whyNoPublish() {
  if (BUSY) return "Publication en cours — laisse-la finir avant d'en relancer une.";
  if (READONLY) return READONLY_WHY || "Le dépôt n'est pas branché : publication indisponible.";
  return "";
}
/** La phrase complète, la même partout : bandeau, infobulle, réponse au
 *  clic. Elle commence toujours par le fait — « Publication
 *  indisponible » — avant la cause technique. */
const publishBlockedLine = (why) => "Publication indisponible — " + why;
function updatePublishUI() {
  const btn = document.getElementById("publish");
  const bar = document.getElementById("pubwhy");
  const why = whyNoPublish();
  if (why) {
    /* pas de `disabled` : un bouton désactivé sort de l'arbre
       d'accessibilité et emporte sa raison avec lui. */
    btn.removeAttribute("disabled");
    btn.setAttribute("aria-disabled", "true");
    btn.setAttribute("title", publishBlockedLine(why));
    btn.setAttribute("aria-describedby", "pubwhy");
    bar.textContent = publishBlockedLine(why);
    bar.classList.remove("hidden");
  } else {
    btn.removeAttribute("aria-disabled");
    btn.removeAttribute("title");
    btn.removeAttribute("aria-describedby");
    bar.textContent = "";
    bar.classList.add("hidden");
  }
  btn.classList.toggle("attn", DIRTY && !why);
}
addEventListener("beforeunload", (e) => { if (DIRTY) { e.preventDefault(); e.returnValue = ""; } });
function openPreview() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...DATA, __jeton: BC_JETON })); } catch (e) {}
  window.open("/?apercu=1", "bcm-apercu");
}

/* ---------- 3. champs ---------- */
function textField(f, obj) {
  const inp = f.ml ? el("textarea") : el("input", { type: "text" });
  inp.value = obj[f.k] == null ? "" : obj[f.k];
  inp.addEventListener("input", () => { obj[f.k] = inp.value; });
  return el("div", { class: "field" }, el("label", {}, f.label), inp, f.hint ? el("p", { class: "hint" }, f.hint) : null);
}
function strListField(f, obj) {
  const arr = Array.isArray(obj[f.k]) ? obj[f.k] : (obj[f.k] = []);
  const row = el("div", { class: "chiprow" });
  const draw = () => {
    row.innerHTML = "";
    if (!arr.length) row.append(el("span", { class: "hint" }, "Rien pour l'instant."));
    arr.forEach((v, i) => row.append(el("span", { class: "chip" }, v,
      el("button", { type: "button", "aria-label": `Supprimer « ${v} »`, onclick: () => { arr.splice(i, 1); markDirty(); draw(); } }, "×"))));
  };
  const add = el("input", { type: "text", class: "no-dirty", placeholder: "Ajouter puis Entrée…" });
  add.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = add.value.trim();
    if (v) { arr.push(v); add.value = ""; markDirty(); draw(); }
  });
  draw();
  return el("div", { class: "field" }, el("label", {}, f.label), row, add, f.hint ? el("p", { class: "hint" }, f.hint) : null);
}
function renderFields(parent, fields, obj) {
  let buf = null;
  const flush = () => { if (buf) { parent.append(buf); buf = null; } };
  for (const f of fields) {
    let node;
    if (f.type === "object") { obj[f.k] = obj[f.k] || {}; flush(); node = objectCard(f, obj[f.k]); }
    else if (f.type === "list") { flush(); node = listCard(f, obj); }
    else if (f.type === "strlist") { flush(); node = strListField(f, obj); }
    else node = textField(f, obj);

    if (f.half && !f.type) { buf = buf || el("div", { class: "row2" }); buf.append(node); if (buf.children.length === 2) flush(); }
    else { flush(); parent.append(node); }
  }
  flush();
}
function objectCard(f, obj) {
  const card = el("div", { class: "card" }, el("div", { class: "card__head" }, el("h3", {}, f.label)));
  renderFields(card, f.fields, obj);
  return card;
}
/** Liste d'objets : ajouter, supprimer, monter, descendre. Zéro dépendance. */
function listCard(f, host) {
  const arr = Array.isArray(host[f.k]) ? host[f.k] : (host[f.k] = []);
  const wrap = el("div", { class: "field" }, el("label", {}, f.label));
  const box = el("div");
  const draw = () => {
    box.innerHTML = "";
    if (!arr.length) box.append(el("p", { class: "hint" }, `Aucun ${f.singular} pour l'instant.`));
    arr.forEach((it, i) => {
      const head = el("div", { class: "card__head" },
        el("span", { class: "idx" }, String(i + 1).padStart(2, "0")),
        el("h3", {}, String(it[f.title] || f.singular).slice(0, 46)),
        el("span", { class: "grow" }),
        el("button", { class: "iconbtn", type: "button", "aria-label": `Monter ${f.singular} ${i + 1}`, disabled: i === 0 ? "" : null,
          onclick: () => { if (i === 0) return; arr.splice(i - 1, 0, arr.splice(i, 1)[0]); markDirty(); draw(); } }, "↑"),
        el("button", { class: "iconbtn", type: "button", "aria-label": `Descendre ${f.singular} ${i + 1}`, disabled: i === arr.length - 1 ? "" : null,
          onclick: () => { if (i === arr.length - 1) return; arr.splice(i + 1, 0, arr.splice(i, 1)[0]); markDirty(); draw(); } }, "↓"),
        el("button", { class: "iconbtn", type: "button", "aria-label": `Supprimer ${f.singular} ${i + 1}`,
          onclick: () => { if (confirm(`Supprimer ce ${f.singular} ? Il disparaîtra du site à la prochaine publication.`)) { arr.splice(i, 1); markDirty(); draw(); } } }, "Supprimer"));
      const card = el("div", { class: "card" }, head);
      renderFields(card, f.item, it);
      box.append(card);
    });
  };
  draw();
  const add = el("button", { class: "btn ghost sm", type: "button", onclick: () => {
    const blank = {}; f.item.forEach((x) => (blank[x.k] = x.type === "strlist" ? [] : ""));
    arr.push(blank); markDirty(); draw();
    box.lastElementChild?.scrollIntoView({ block: "center", behavior: "smooth" });
  } }, `+ Ajouter un ${f.singular}`);
  wrap.append(box, el("div", { class: "addbar" }, add));
  return wrap;
}

/* ---------- 4. sections spéciales ---------- */
const WIZ = [
  { k: "editHoraires", t: "Changer les horaires", d: "La phrase affichée et le détail jour par jour." },
  { k: "editTarif", t: "Modifier un prix", d: "Une offre de la page Tarifs, de bout en bout." },
  { k: "editPlanning", t: "Ajouter un créneau", d: "Un cours de plus dans la semaine." },
  { k: "seeLeads", t: "Voir qui a écrit", d: "Les contacts laissés dans l'assistant du site." },
];
function renderDashboard(pane) {
  pane.append(el("div", { class: "hero-admin" },
    el("h3", {}, "Le coin bleu"),
    el("p", {}, "D'ici tu changes le site de la salle : les horaires, les prix, les coachs, le planning, les questions — et tu lis les contacts laissés dans l'assistant. Rien n'est en ligne tant que tu n'as pas cliqué sur « Publier »."),
    el("div", { class: "lamp" + (DIRTY ? " dirty" : "") }, el("i", {}),
      DIRTY ? "Tu as des modifications non publiées" : "Le site est à jour")));

  pane.append(el("h3", { style: "margin:22px 0 10px;font-size:.9rem;letter-spacing:.1em;color:#aebccf" }, "Je veux…"));
  const grid = el("div", { class: "cards3" });
  WIZ.forEach((w) => grid.append(el("button", { class: "wiz", type: "button", onclick: () => startWizard(w.k) },
    el("em", {}, "Guide pas à pas"), el("b", {}, w.t), el("span", {}, w.d))));
  pane.append(grid);

  if (READONLY) pane.append(el("div", { class: "notice", style: "margin-top:20px" },
    el("b", {}, "Lecture seule. "), READONLY_WHY));
}

async function renderLeads(pane) {
  pane.append(el("p", { class: "sec-intro" },
    "Les personnes qui ont laissé un prénom et un moyen de te joindre dans l'assistant du site. Le plus récent d'abord."));
  const box = el("div", {}, el("p", { class: "empty" }, "Chargement du carnet…"));
  pane.append(box);
  let j;
  try {
    const r = await fetch("/api/admin/leads", { headers: { "x-admin-token": TOKEN } });
    if (r.status === 401) return logout();
    j = await r.json();
    if (!r.ok) throw new Error(j.error || r.status);
  } catch (e) {
    box.innerHTML = "";
    box.append(el("div", { class: "notice" }, el("b", {}, "Carnet illisible. "), String(e.message || e)));
    return;
  }
  box.innerHTML = "";
  if (!j.storage) box.append(el("div", { class: "notice" }, el("b", {}, "Aucun stockage branché. "), j.why || ""));
  const leads = j.leads || [];
  if (!leads.length) { box.append(el("p", { class: "empty" }, "Personne n'a encore laissé ses coordonnées.")); return; }

  const table = el("table", { class: "leads" },
    el("thead", {}, el("tr", {},
      ...["Quand", "Qui", "Téléphone", "Email", "Demande", "Page"].map((h) => el("th", {}, h)))));
  const tb = el("tbody");
  leads.forEach((L) => {
    const when = (() => { try { return new Date(L.at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }); } catch { return L.at || ""; } })();
    tb.append(el("tr", {},
      el("td", { class: "when" }, when),
      el("td", { class: "who" }, L.name || L.prenom || "—"),
      el("td", {}, L.phone ? el("a", { href: "tel:" + L.phone.replace(/\s/g, "") }, L.phone) : "—"),
      el("td", {}, L.email ? el("a", { href: "mailto:" + L.email }, L.email) : "—"),
      el("td", {}, L.event === "callback_request" ? "Demande de rappel" : "Coordonnées laissées"),
      el("td", { class: "when" }, L.page || "—")));
  });
  table.append(tb);
  box.append(el("div", { class: "leadwrap" }, table));
  box.append(el("p", { class: "hint", style: "margin-top:10px" }, `${leads.length} contact${leads.length > 1 ? "s" : ""} au carnet.`));
}

/* ---------- LA GALERIE DU CLUB : la file de modération ----------
   Ce que les visiteurs déposent sur /galerie/ atterrit ici, et NULLE
   PART ailleurs, tant que personne ne l'a approuvé. Approuver = ça monte
   sur le site tout de suite (pas besoin de publier : le mur est lu en
   direct depuis Cloudinary). Refuser = le fichier est détruit. */
async function renderCommunity(pane) {
  pane.append(el("p", { class: "sec-intro" },
    "Les photos et les vidéos déposées par les gens de la salle. Rien n'est visible sur le site tant que tu n'as pas cliqué sur « Approuver ». Regarde, et tranche : on ne publie pas à l'aveugle."));
  const box = el("div", {}, el("p", { class: "empty" }, "Chargement de la file…"));
  pane.append(box);

  let j;
  try {
    const r = await fetch("/api/community/pending", { headers: { "x-admin-token": TOKEN } });
    if (r.status === 401) return logout();
    j = await r.json();
    if (!r.ok) throw new Error(j.error || r.status);
  } catch (e) {
    box.innerHTML = "";
    box.append(el("div", { class: "notice" }, el("b", {}, "File illisible. "), String(e.message || e)));
    return;
  }

  box.innerHTML = "";
  if (j.ready === false) {
    box.append(el("div", { class: "notice" }, el("b", {}, "Le mur n'est pas encore ouvert. "), j.why || ""));
    return;
  }
  const items = j.items || [];
  if (!items.length) {
    box.append(el("p", { class: "empty" }, "Rien en attente. Tout ce qui a été déposé est déjà traité."));
    return;
  }

  const grid = el("div", { class: "modgrid" });
  items.forEach((it) => {
    const media = it.kind === "video"
      ? el("video", { src: it.src, poster: it.poster, controls: "", preload: "none", playsinline: "" })
      : el("img", { src: it.poster, alt: it.title || "Dépôt en attente", loading: "lazy", decoding: "async" });

    const act = el("div", { class: "modcard__act" },
      el("button", { class: "btn sm", type: "button", onclick: (e) => decide(e.currentTarget, it, "approve") }, "Approuver"),
      el("button", { class: "btn ghost sm", type: "button", onclick: (e) => decide(e.currentTarget, it, "reject") }, "Refuser"));

    const card = el("div", { class: "modcard" },
      el("div", { class: "modcard__m" }, media,
        el("span", { class: "modcard__k" }, it.kind === "video" ? "Vidéo" : "Photo")),
      el("div", { class: "modcard__b" },
        el("b", {}, it.title || "Sans titre"),
        el("span", {}, "Déposé par " + (it.author || "—")),
        /* Le contact du déposant : c'est avec ça que tu le préviens quand
           ça monte sur le mur. Il est AUSSI dans « Les contacts »
           (event « upload_contributor ») — un seul carnet, deux entrées. */
        el("span", { class: "modcard__c" }, it.contact || "Contact non renseigné"),
        /* Dit honnêtement ce que la machine a fait, ou n'a pas fait. */
        el("span", { class: "modcard__v" },
          it.vision === "gemini" ? "Photo passée par l'œil machine" : "Non filtré — à toi de regarder"),
        /* La durée réelle d'une vidéo, mesurée par Cloudinary. Trop longue,
           l'approbation la refusera côté serveur : on le dit ici pour que
           le clic « Approuver » ne parte pas dans le vide. */
        it.kind === "video"
          ? el("span", { class: "modcard__v" },
              it.tooLong
                ? `Vidéo de ${it.duration}s — trop longue pour le mur, à refuser`
                : `Vidéo de ${it.duration}s`)
          : null,
        el("span", { class: "modcard__d" }, (() => {
          try { return new Date(it.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }); }
          catch { return it.createdAt || ""; }
        })())),
      act);
    grid.append(card);
  });
  box.append(grid);
  box.append(el("p", { class: "hint", style: "margin-top:12px" },
    `${items.length} dépôt${items.length > 1 ? "s" : ""} en attente.`));

  async function decide(btn, it, action) {
    if (action === "reject" && !confirm("Refuser ce dépôt ? Le fichier est supprimé définitivement.")) return;
    const card = btn.closest(".modcard");
    card.querySelectorAll("button").forEach((b) => (b.disabled = true));
    setStatus(action === "approve" ? "Approbation…" : "Suppression…");
    try {
      const r = await fetch("/api/community/moderate", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify({ id: it.id, kind: it.kind, action }),
      });
      const jj = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(jj.error || r.status);
      card.remove();
      setStatus(action === "approve" ? "Approuvé — c'est en ligne sur la galerie." : "Refusé — le fichier est supprimé.", "ok");
      /* le compteur du menu doit suivre la décision qu'on vient de
         prendre — sinon il annonce une file qui n'existe plus */
      refreshCommunityBadge();
      if (!grid.children.length) renderSection("community");
    } catch (e) {
      card.querySelectorAll("button").forEach((b) => (b.disabled = false));
      setStatus("Échec : " + (e.message || e), "bad");
    }
  }
}

/* ---------- 5. charger / publier / naviguer ---------- */
function renderSection(key) {
  CURRENT = key;
  document.querySelectorAll(".navbtn[data-k]").forEach((b) => b.classList.toggle("active", b.dataset.k === key));
  const pane = document.getElementById("pane"); pane.innerHTML = "";
  const sc = SCHEMA[key];
  document.getElementById("paneTitle").textContent = sc.label;
  if (sc.type === "dashboard") return renderDashboard(pane);
  if (sc.type === "community") return void renderCommunity(pane);
  if (sc.type === "leads") return void renderLeads(pane);
  if (sc.intro) pane.append(el("p", { class: "sec-intro" }, sc.intro));
  if (sc.type === "object") { DATA[key] = DATA[key] || {}; renderFields(pane, sc.fields, DATA[key]); }
  else if (sc.type === "list") { DATA[key] = Array.isArray(DATA[key]) ? DATA[key] : []; pane.append(listCard({ ...sc, k: key }, DATA)); }
}

function removeDraftBar() { document.getElementById("draftbar")?.remove(); }
function showDraftBar(draft) {
  removeDraftBar();
  const bar = el("div", { class: "notice", id: "draftbar" },
    el("b", {}, "Un brouillon non publié a été retrouvé sur cet ordinateur. "),
    el("span", {}, "Tu peux le reprendre où tu l'avais laissé, ou repartir de la version en ligne. "),
    el("span", { style: "display:flex;gap:8px;margin-top:10px" },
      el("button", { class: "btn sm", type: "button", onclick: () => { DATA = draft; DIRTY = true; updateDirtyUI(); removeDraftBar(); renderSection(CURRENT); } }, "Reprendre"),
      el("button", { class: "btn ghost sm", type: "button", onclick: () => { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} removeDraftBar(); } }, "L'ignorer")));
  const content = document.getElementById("pane");
  content.parentElement.insertBefore(bar, content);
}

async function load() {
  setStatus("Chargement…");
  try {
    const r = await fetch("/api/admin/content", { headers: { "x-admin-token": TOKEN } });
    if (r.status === 401) return logout();
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setStatus("Erreur de chargement : " + (j.error || r.status), "bad"); return; }
    DATA = j.content || {};
    READONLY = !!j.readOnly; READONLY_WHY = j.why || "";
    updatePublishUI();

    let draft = null; try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) {}
    if (draft && typeof draft === "object" && JSON.stringify(draft) !== JSON.stringify(DATA)) showDraftBar(draft);
    setStatus(READONLY ? "Lecture seule — publication indisponible" : "Chargé", READONLY ? "warn" : "ok");
    renderSection(CURRENT);
  } catch (e) { setStatus("Erreur réseau : le serveur ne répond pas.", "bad"); }
}

async function publish() {
  const why = whyNoPublish();
  if (why) return setStatus(publishBlockedLine(why), "warn");   // le clic répond, il ne tombe pas dans le vide
  if (!confirm("Publier les modifications ? Le site se met à jour tout seul, en une minute environ.")) return;
  setStatus("Publication…");
  BUSY = true; updatePublishUI();
  try {
    const r = await fetch("/api/admin/content", {
      method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
      body: JSON.stringify({ content: DATA }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { clearDirty(); removeDraftBar(); setStatus(j.rebuild ? "Publié — le site se met à jour (~1 min)" : "Publié — pense à relancer un déploiement", "ok"); }
    else setStatus("Échec : " + (j.error || r.status), "bad");
  } catch (e) { setStatus("Erreur réseau : rien n'a été publié.", "bad"); }
  finally { BUSY = false; updatePublishUI(); }
}

function buildNav() {
  const nav = document.getElementById("nav"); nav.innerHTML = "";
  Object.keys(SCHEMA).forEach((k) => {
    if (k === "community") nav.append(el("div", { style: "height:1px;background:var(--line);margin:10px 8px" }));
    nav.append(el("button", { class: "navbtn", type: "button", "data-k": k, onclick: () => renderSection(k),
      html: `<span class="nico">${ICONS[k] || ""}</span><span>${SCHEMA[k].label}</span>` }));
  });
  refreshCommunityBadge();
}

/* Le compteur de la file : le staff doit voir qu'il y a du monde qui
   attend SANS avoir à ouvrir la section. Silencieux s'il n'y a rien —
   et silencieux aussi si Cloudinary n'est pas branché ou ne répond pas :
   un badge d'erreur dans un menu, ça n'aide personne. */
async function refreshCommunityBadge() {
  const btn = document.querySelector('.navbtn[data-k="community"]');
  if (!btn) return;
  btn.querySelector(".nbadge")?.remove();
  try {
    const r = await fetch("/api/community/pending", { headers: { "x-admin-token": TOKEN } });
    if (!r.ok) return;
    const j = await r.json();
    const n = (j.items || []).length;
    if (!n) return;
    const b = el("span", { class: "nbadge" }, String(n));
    b.setAttribute("aria-label", `${n} dépôt${n > 1 ? "s" : ""} en attente`);
    btn.append(b);
  } catch { /* muet : le menu ne doit jamais crier une panne réseau */ }
}
function showApp() {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  buildNav();
  load().then(() => { try { if (!localStorage.getItem(TOUR_KEY)) setTimeout(startTour, 600); } catch (e) {} });
}
function logout() { sessionStorage.removeItem("bcm_admin"); TOKEN = ""; DIRTY = false; location.reload(); }

/* ---------- 6. démarrage ---------- */
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const t = document.getElementById("token").value.trim(); if (!t) return;
  const errEl = document.getElementById("loginErr");
  const btn = document.getElementById("loginBtn");
  errEl.textContent = ""; btn.disabled = true; btn.textContent = "Vérification…";

  const r = await fetch("/api/admin/content", { headers: { "x-admin-token": t } }).catch(() => null);
  btn.disabled = false; btn.textContent = "Entrer";
  if (r && r.ok) { TOKEN = t; sessionStorage.setItem("bcm_admin", t); showApp(); return; }

  /* diagnostic PRÉCIS : le staff doit savoir exactement quoi corriger. */
  let msg;
  if (!r) msg = "Serveur injoignable. Vérifie ta connexion internet.";
  else {
    const b = await r.json().catch(() => ({}));
    const detail = String(b.error || "");
    if (/ADMIN_TOKEN non configur/i.test(detail))
      msg = "Le mot de passe n'a pas encore été créé côté serveur : ajoute la variable ADMIN_TOKEN dans Vercel (Settings → Environment Variables), puis redéploie.";
    else if (r.status === 401) msg = "Mot de passe incorrect.";
    else if (/GITHUB/i.test(detail)) msg = "Mot de passe correct — mais la liaison GitHub manque : vérifie GITHUB_TOKEN et GITHUB_REPO sur Vercel.";
    else msg = detail ? "Erreur serveur : " + detail : "Connexion impossible (erreur " + r.status + ").";
  }
  errEl.textContent = msg;
  const f = document.getElementById("loginForm");
  f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
});
document.getElementById("publish").addEventListener("click", publish);
document.getElementById("preview").addEventListener("click", openPreview);
document.getElementById("reload").addEventListener("click", () => {
  if (DIRTY && !confirm("Annuler toutes les modifications non publiées et revenir à la version en ligne ?")) return;
  clearDirty(); removeDraftBar(); load();
});
document.getElementById("logout").addEventListener("click", logout);
document.getElementById("tourBtn").addEventListener("click", () => startTour());

/* toute saisie = modifications non publiées */
const paneEl = document.getElementById("pane");
paneEl.addEventListener("input", (e) => { if (!e.target.closest(".no-dirty")) markDirty(); });
paneEl.addEventListener("change", (e) => { if (!e.target.closest(".no-dirty")) markDirty(); });

if (TOKEN) showApp();
