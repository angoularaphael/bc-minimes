/* ============================================================
   LE COIN BLEU — visites guidées et assistants.
   Le moteur assombrit tout l'écran SAUF la cible (quatre panneaux
   autour d'un trou : la cible reste cliquable, le reste est bloqué).
   Deux types d'étapes :
     - info   : un bouton « Compris » fait avancer ;
     - action : PAS de bouton — l'utilisateur fait le geste demandé
                (clic, saisie) et la visite avance toute seule.
   `runFlow(steps)` exécute n'importe quel parcours : la grande visite
   du premier passage comme les assistants de l'accueil.
   ============================================================ */

const TOUR_KEY = "bcm:tour:v1";
let FLOW = null;

/* ---------- moteur ---------- */
function runFlow(steps, opts = {}) {
  endFlow();
  const blockers = [0, 1, 2, 3].map(() => { const d = el("div", { class: "tour-block" }); document.body.append(d); return d; });
  const spot = el("div", { class: "tour-spot" }), card = el("div", { class: "tour-card", role: "dialog", "aria-modal": "true" });
  document.body.append(spot, card);
  FLOW = { steps, i: 0, spot, card, blockers, opts, off: null };
  addEventListener("resize", placeFlow);
  addEventListener("scroll", placeFlow, true);
  document.addEventListener("keydown", flowKey);
  showStep();
}
function endFlow() {
  if (!FLOW) return;
  FLOW.off?.();
  FLOW.spot.remove(); FLOW.card.remove(); FLOW.blockers.forEach((b) => b.remove());
  removeEventListener("resize", placeFlow);
  removeEventListener("scroll", placeFlow, true);
  document.removeEventListener("keydown", flowKey);
  const done = FLOW.opts.onEnd; FLOW = null; done?.();
}
function flowKey(e) { if (e.key === "Escape") endFlow(); }
function nextStep() {
  FLOW.off?.(); FLOW.off = null;
  if (FLOW.i >= FLOW.steps.length - 1) return endFlow();
  FLOW.i++; showStep();
}
const targetOf = (step) => (step.sel ? document.querySelector(step.sel) : null);

function showStep() {
  const step = FLOW.steps[FLOW.i];
  step.do?.(); // prépare l'écran (changer de section, etc.)

  const { card } = FLOW;
  card.innerHTML = "";
  card.append(el("h3", {}, step.t), el("p", {}, step.b));
  const acts = el("div", { class: "acts" });
  if (step.advanceOn) {
    // étape action : on attend le geste, pas un clic « Suivant »
    card.append(el("span", { class: "tour-hint" }, step.hint || "À toi de jouer"));
    acts.append(el("button", { class: "tour-skip", type: "button", onclick: nextStep }, "Passer cette étape"));
    const h = (e) => {
      if (!e.target.closest(step.advanceOn.sel)) return;
      FLOW.off?.(); FLOW.off = null;
      setTimeout(nextStep, step.advanceOn.delay ?? 400); // laisse l'interface réagir
    };
    document.addEventListener(step.advanceOn.ev, h, true);
    FLOW.off = () => document.removeEventListener(step.advanceOn.ev, h, true);
  } else {
    acts.append(el("button", { class: "tour-skip", type: "button", onclick: endFlow }, "Quitter"));
    acts.append(el("button", { class: "btn sm", type: "button", onclick: nextStep },
      FLOW.i >= FLOW.steps.length - 1 ? "Terminer" : (step.ok || "Compris")));
  }
  card.append(el("div", { class: "foot" }, el("span", { class: "dots" }, `${FLOW.i + 1} / ${FLOW.steps.length}`), acts));

  targetOf(step)?.scrollIntoView({ block: "center" });
  placeFlow();
  requestAnimationFrame(placeFlow); // correction après layout (polices, images)
  card.querySelector("button")?.focus();
}

/* place le projecteur, les quatre panneaux sombres et la carte */
function placeFlow() {
  if (!FLOW) return;
  const target = targetOf(FLOW.steps[FLOW.i]);
  const { spot, card, blockers: [top, bottom, left, right] } = FLOW;
  const put = (b, x, y, w, h) => Object.assign(b.style, { left: x + "px", top: y + "px", width: Math.max(0, w) + "px", height: Math.max(0, h) + "px" });
  const cw = card.offsetWidth || 360, ch = card.offsetHeight || 200;

  if (target) {
    const r = target.getBoundingClientRect(), p = 8;
    let hl = r.left - p, ht = r.top - p, hw = r.width + 2 * p, hh = r.height + 2 * p;
    /* Filet : une cible plus haute que l'écran (une section entière de
       27 créneaux, par exemple) donnait un « projecteur » de 12 000 px —
       donc plus rien d'assombri, donc plus aucun guidage. On borne au
       viewport : la cible reste centrée par scrollIntoView. */
    const maxH = innerHeight - 24, maxW = innerWidth - 24;
    if (hh > maxH) { ht = 12; hh = maxH; }
    if (hw > maxW) { hl = 12; hw = maxW; }
    Object.assign(spot.style, { opacity: 1, left: hl + "px", top: ht + "px", width: hw + "px", height: hh + "px" });
    put(top, 0, 0, innerWidth, ht);
    put(bottom, 0, ht + hh, innerWidth, innerHeight - (ht + hh));
    put(left, 0, ht, hl, hh);
    put(right, hl + hw, ht, innerWidth - (hl + hw), hh);
    let cy = r.bottom + 16;
    if (cy + ch > innerHeight - 12) cy = Math.max(12, r.top - ch - 16);
    const cx = Math.min(Math.max(12, r.left), Math.max(12, innerWidth - cw - 12));
    Object.assign(card.style, { top: cy + "px", left: cx + "px" });
  } else {
    Object.assign(spot.style, { opacity: 0, width: "0px", height: "0px" });
    put(top, 0, 0, innerWidth, innerHeight); put(bottom, 0, 0, 0, 0); put(left, 0, 0, 0, 0); put(right, 0, 0, 0, 0);
    Object.assign(card.style, { top: Math.max(12, (innerHeight - ch) / 2) + "px", left: Math.max(12, (innerWidth - cw) / 2) + "px" });
  }
}

/* ---------- la grande visite (premier passage) ---------- */
const FLOW_MAIN = [
  { sel: null, t: "Bienvenue dans le coin bleu", ok: "C'est parti",
    b: "Ici tu changes le site de la salle : les horaires, les prix, les coachs, le planning, les questions. Aucune connaissance technique. Et c'est toi qui pilotes cette visite — tu vas faire les gestes toi-même." },
  { sel: '#nav .navbtn[data-k="salle"]', t: "1 · Le menu",
    b: "Chaque bouton du menu ouvre une partie du site. À toi : clique sur « La salle ».",
    hint: "Clique sur « La salle »", advanceOn: { ev: "click", sel: '#nav .navbtn[data-k="salle"]' } },
  { sel: "#pane .field", t: "2 · Modifier, c'est écrire",
    b: "Un texte se change en écrivant dans sa case, comme dans un document. Essaie : ajoute une lettre quelque part. Tu pourras tout annuler juste après.",
    hint: "Écris dans une case", advanceOn: { ev: "input", sel: "#pane input, #pane textarea" } },
  { sel: "#status", t: "3 · Rien n'est en ligne",
    b: "Tu vois « Modifications non publiées » ? Tes essais sont gardés sur cet ordinateur, mais le vrai site n'a pas bougé d'un pixel. « Annuler tout » revient à la version en ligne quand tu veux." },
  { sel: "#preview", t: "4 · Vérifier avant",
    b: "« Aperçu » ouvre le site avec TES modifications, dans un autre onglet — visible par toi seul." },
  { sel: "#publish", t: "5 · Publier",
    b: "Quand tout te plaît : « Publier ». Le site se met à jour tout seul, en une minute environ. (Pas maintenant !)" },
  { sel: '#nav .navbtn[data-k="leads"]', t: "6 · Les contacts",
    b: "Quand quelqu'un laisse son prénom et son numéro dans l'assistant du site, il atterrit ici. C'est ta liste d'appels." },
  { sel: '#nav .navbtn[data-k="dashboard"]', t: "Besoin qu'on te tienne la main ?",
    b: "L'Accueil propose un guide pas à pas pour chaque tâche courante : changer les horaires, modifier un prix, ajouter un créneau. Bon entraînement." },
];
function startTour() {
  runFlow(FLOW_MAIN, { onEnd: () => { try { localStorage.setItem(TOUR_KEY, "1"); } catch (e) {} } });
}

/* ---------- les assistants de l'accueil ---------- */
const FLOWS = {
  editHoraires: [
    { sel: null, t: "Les horaires", do: () => renderSection("salle"), ok: "J'ai compris",
      b: "Deux endroits, et il faut les deux : la PHRASE affichée en haut (« Horaires »), et le détail jour par jour juste en dessous. Si tu ne changes que l'une, le site se contredit tout seul." },
    { sel: "#pane .field", t: "La phrase affichée",
      b: "Modifie la case « Horaires » — c'est elle qu'on lit dans le pied de page et sur la page Contact.",
      hint: "Écris dans une case", advanceOn: { ev: "input", sel: "#pane input, #pane textarea" } },
    { sel: "#preview", t: "Relis-toi",
      b: "« Aperçu » ouvre le site avec ta nouvelle phrase. Rien n'est publié tant que tu n'as pas cliqué sur « Publier »." },
  ],
  editTarif: [
    { sel: "#pane .card", t: "Une offre = une carte", do: () => renderSection("promos"),
      b: "Chaque carte est une offre de la page Tarifs. Change un prix, un nom, une phrase, directement dans les cases." },
    { sel: "#pane .card", t: "Attention à l'Étudiant",
      b: "Si tu touches à l'offre Étudiant : « carte étudiante requise » reste dans la case Unité. Sans ça, un adulte s'inscrit à 36,99€ et l'accueil doit le rattraper au comptoir.",
      hint: "Modifie une case", advanceOn: { ev: "input", sel: "#pane input, #pane textarea" } },
    { sel: "#publish", t: "Mets-le en ligne",
      b: "« Aperçu » pour vérifier la page Tarifs, puis « Publier ». Le site est à jour en une minute." },
  ],
  editPlanning: [
    { sel: null, t: "Le planning", do: () => renderSection("planning"), ok: "J'ai compris",
      b: "Une ligne par créneau. Ce que tu écris ici alimente la grille de la page Planning, les compteurs de la page Coachs et les réponses de l'assistant." },
    { sel: "#pane .addbar .btn", t: "Ajoute un créneau",
      b: "À toi : clique sur « + Ajouter un créneau ». Il apparaît en bas de la liste.",
      hint: "Clique sur « + Ajouter un créneau »", advanceOn: { ev: "click", sel: "#pane .addbar .btn", delay: 500 } },
    { sel: "#pane .card:last-of-type", t: "Remplis-le",
      b: "Le jour s'écrit en toutes lettres (Lundi, Mardi…), l'heure au format 18h30, et le coach EXACTEMENT comme dans les autres lignes — sinon le compte de créneaux de ce coach tombe à zéro sans rien casser à l'écran." },
    { sel: "#pane .card:last-of-type .iconbtn", t: "Les flèches et la corbeille",
      b: "Les flèches ↑ ↓ déplacent une ligne, « Supprimer » l'enlève. Puis « Publier » quand le planning te plaît." },
  ],
  seeLeads: [
    { sel: '#nav .navbtn[data-k="leads"]', t: "Les contacts",
      b: "À toi : clique sur « Les contacts » dans le menu.",
      hint: "Clique sur « Les contacts »", advanceOn: { ev: "click", sel: '#nav .navbtn[data-k="leads"]', delay: 600 } },
    { sel: "#pane .leadwrap, #pane .notice, #pane .empty", t: "Ta liste d'appels",
      b: "Chaque ligne est quelqu'un qui a discuté avec l'assistant du site et qui a laissé de quoi le rappeler. Le téléphone et l'email sont cliquables : un clic et tu appelles. Le plus récent est en haut." },
  ],
};
function startWizard(key) { const f = FLOWS[key]; if (f) runFlow(f); }
