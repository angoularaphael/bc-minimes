/* =====================================================================
   MINIMES · scripts/maillage.mjs — la navigation et le pied de page,
   écrits en dur dans chaque page livrée

   LE DÉFAUT, MESURÉ LE 26/09/2026. site.js monte la barre de navigation
   et le pied de page à l'exécution (mountNav, mountFooter). Le HTML LIVRÉ
   partait donc en `<div id="nav"></div>` et `<div id="footer"></div>`,
   vides : en dehors de quelques liens posés dans le contenu, une page ne
   menait nulle part pour un robot qui n'exécute pas le JavaScript —
   Bingbot (et donc ChatGPT, Copilot), le robot de Brave (Claude),
   PerplexityBot. Google finit par exécuter, avec retard ; les autres non.
   Le maillage de marque — le groupe, la boutique, les salles sœurs —
   n'existait que pour les visiteurs.

   LA CORRECTION, LA MÊME QU'À RAMONVILLE (scripts/maillage.mjs). Après le
   build, on écrit dans les deux creux le même contenu que site.js peindra
   ensuite, tiré des MÊMES données (data.js). site.js remplace le bloc
   entier au montage : le rendu final ne bouge pas. Avant le JavaScript,
   le robot et le visiteur sans JS trouvent de vraies balises <a href>.

   PAS DE `nofollow` : c'est le maillage du même propriétaire. `noopener`
   seulement, comme dans site.js.

   Usage : `npm run postbuild` l'appelle avant cuire-galerie.mjs.
   ===================================================================== */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const { NAV, LINKS, NETWORK, SALLE, CTA, CTA_HREF } = await import(
  pathToFileURL(join(ROOT, "public/assets/js/data.js")).href
);

async function* fichiers(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* fichiers(p);
    else yield p;
  }
}

const attr = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Le même tracé que site.js : le visiteur sans JS voit aussi qu'il quitte le site. */
const EXT = `<svg class="ext" width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const extLink = (href, label, cls = "") =>
  `<a${cls ? ` class="${cls}"` : ""} href="${attr(href)}" target="_blank" rel="noopener">${attr(label)} ${EXT}</a>`;

/* ---- La barre : mêmes liens, même ordre, mêmes libellés que mountNav() ---- */
const NAVIGATION =
  `<nav class="nav" id="site-nav">` +
  `<a class="nav__brand" href="/" aria-label="Boxing Center Minimes — accueil">` +
  `<img class="nav__logo" src="/assets/img/logo.png" alt="" width="342" height="160" />` +
  `<span class="nav__salle">Minimes</span></a>` +
  `<div class="nav__links">` +
  (NAV || []).filter((n) => n.top !== false).map((n) => `<a href="${attr(n.href)}">${attr(n.label)}</a>`).join("") +
  `</div>` +
  `<div class="nav__right"><div class="nav__ext">` +
  extLink(LINKS.groupe, "Le groupe") + extLink(LINKS.boutique, "Boutique") +
  `</div>` +
  `<a class="btn btn--primary nav__cta" href="${attr(CTA_HREF.primary)}"><span>${attr(CTA.chrome)}</span></a>` +
  `</div></nav>`;

/* ---- Le pied de page : la copie fidèle de mountFooter() ---- */
const cols = [
  { h: "Le club", links: (NAV || []).slice(1, 5) },
  { h: "Pratique", links: [{ href: "/premiere-seance/", label: "Ta première séance" }, { href: "/plannings/", label: "Planning" }, { href: "/tarifs/", label: "Tarifs" }, { href: "/contact/", label: "Contact" }, { href: LINKS.boutique, label: "Boutique", ext: true }] },
  { h: "Le réseau", links: [{ href: LINKS.groupe, label: "Boxing Center", ext: true }, { href: LINKS.boutique, label: "La boutique", ext: true }, { href: LINKS.instagram, label: "Instagram", ext: true }, { href: LINKS.facebook, label: "Facebook", ext: true }] },
];
const salles = (NETWORK || []).map((s) =>
  `<a class="netcard" href="${attr(s.url)}" target="_blank" rel="noopener">` +
  `<span class="netcard__tag">${attr(s.tag)}</span><span class="netcard__name">${attr(s.name)}</span>` +
  `<span class="netcard__feat">${attr(s.feat)}</span><span class="netcard__go">${attr(s.go)} ${EXT}</span></a>`
).join("");

const PIED =
  `<footer class="footer"><div class="wrap">` +
  `<div class="footer__big" aria-hidden="true">Le berceau des champions</div>` +
  `<div class="footer__grid">` +
  `<div class="footer__col"><h4>Boxing Center Minimes</h4>` +
  `<p>${attr(SALLE.address?.full ?? "")}</p>` +
  `<p><a href="tel:${attr(SALLE.phoneHref)}">${attr(SALLE.phone)}</a></p>` +
  `<p>${attr(SALLE.hours)}</p>` +
  `<a class="btn btn--primary" href="${attr(CTA_HREF.primary)}" style="margin-top:1rem"><span>${attr(CTA.primary)}</span></a>` +
  `</div>` +
  cols.map((c) => `<div class="footer__col"><h4>${attr(c.h)}</h4>${c.links.map((l) => l.ext ? extLink(l.href, l.label) : `<a href="${attr(l.href)}">${attr(l.label)}</a>`).join("")}</div>`).join("") +
  `</div>` +
  `<div class="netband"><h4 class="netband__h">Les autres salles du réseau</h4><div class="netband__grid">${salles}</div></div>` +
  `<div class="footer__bottom"><span>© ${new Date().getFullYear()} SAS Boxing Center · Boxing Center Minimes · <a href="/mentions-legales/">Mentions légales</a></span><span>Toulouse · Les Minimes · 31200</span></div>` +
  `</div></footer>`;

const CIBLE_NAV = '<div id="nav"></div>';
const CIBLE_PIED = '<div id="footer"></div>';
let n = 0;
for await (const f of fichiers(DIST)) {
  if (extname(f) !== ".html") continue;
  const html = await readFile(f, "utf8");
  if (!html.includes(CIBLE_NAV) && !html.includes(CIBLE_PIED)) continue;
  const out = html
    .replace(CIBLE_NAV, `<div id="nav">${NAVIGATION}</div>`)
    .replace(CIBLE_PIED, `<div id="footer">${PIED}</div>`);
  await writeFile(f, out);
  n++;
}
const nbNav = (NAV || []).filter((x) => x.top !== false).length + 2;
console.log(`[maillage] ${n} pages · ${nbNav} liens de navigation + pied de page (${(NETWORK || []).length} salles sœurs) écrits en dur · remplacés par site.js au montage`);
