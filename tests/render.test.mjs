import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const dist = (...parts) => join(ROOT, "dist", ...parts);
const pages = {
  "/": "index.html",
  "/activites/": "activites/index.html",
  "/le-club/": "le-club/index.html",
  "/coachs/": "coachs/index.html",
  "/galerie/": "galerie/index.html",
  "/plannings/": "plannings/index.html",
  "/premiere-seance/": "premiere-seance/index.html",
  "/tarifs/": "tarifs/index.html",
  "/contact/": "contact/index.html",
  "/mentions-legales/": "mentions-legales/index.html",
};

const htmlOf = (route) => readFile(dist(pages[route]), "utf8");

test("rendu SEO/GEO/AEO : les faits essentiels sont dans le HTML", async () => {
  const entries = await Promise.all(Object.entries(pages).map(async ([route]) => [route, await htmlOf(route)]));
  for (const [route, html] of entries) {
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route} doit avoir un H1`);
    assert.doesNotMatch(html, /SpeakableSpecification/, `${route} ne publie pas Speakable`);
    assert.doesNotMatch(html, /aggregateRating/, `${route} ne publie pas une note non vérifiée`);
  }

  const home = Object.fromEntries(entries)["/"];
  const description = home.match(/<meta name="description" content="([^"]+)"/)?.[1] || "";
  assert.ok(description.length >= 145 && description.length <= 160, `meta description accueil : ${description.length} caractères`);
  assert.doesNotMatch(home, /4[,.]3\/5 sur 156 avis/);

  const expectedContent = [
    ["/activites/", "act-rows", /Boxe anglaise/i],
    ["/coachs/", "pillar", /Mehdi/i],
    ["/coachs/", "roster", /Chloé/i],
    ["/plannings/", "pl-grid", /Lundi/i],
    ["/tarifs/", "offers", /L’offre Étudiant[\s\S]*36,99€[\s\S]*carte étudiante requise[\s\S]*L’offre Adulte[\s\S]*44,99€/],
    ["/tarifs/", "offers", /150€[\s\S]*250€[\s\S]*400€/],
    ["/tarifs/", "money-faq", /L’offre Étudiant/i],
    ["/contact/", "access", /Barrière de Paris/i],
    ["/contact/", "hours", /10h00/i],
    ["/contact/", "faq", /Où se trouve Boxing Center Minimes/i],
    ["/le-club/", "timeline", /Le point de départ/i],
    ["/le-club/", "specs", /Sacs lourds/i],
    ["/le-club/", "asks", /vestiaire/i],
    ["/le-club/", "network", /clubmma\.fr/i],
    ["/le-club/", "addr", /12 rue de Fenouillet/i],
    ["/galerie/", "ga-offframe", /Le bruit/i],
    ["/galerie/", "ga-bridge", /\/activites\/#anglaise/],
  ];
  const byRoute = Object.fromEntries(entries);
  for (const [route, id, pattern] of expectedContent) {
    const start = byRoute[route].indexOf(`id="${id}"`);
    assert.ok(start >= 0, `${route} #${id} doit exister`);
    assert.match(byRoute[route].slice(start, start + 12000), pattern, `${route} #${id} doit être rempli au build`);
  }
});

test("sitemap images : une URL, une page réelle, un fichier réel", async () => {
  const xml = await readFile(dist("sitemap.xml"), "utf8");
  const seen = new Set();
  let count = 0;
  for (const blockMatch of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = blockMatch[1];
    const pageUrl = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    assert.ok(pageUrl, "chaque bloc sitemap a un loc");
    const route = new URL(pageUrl).pathname;
    const html = await htmlOf(route);
    for (const imageMatch of block.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) {
      const imageUrl = imageMatch[1];
      assert.ok(!seen.has(imageUrl), `image dupliquée dans le sitemap : ${imageUrl}`);
      seen.add(imageUrl);
      count++;
      const imagePath = new URL(imageUrl).pathname;
      assert.ok(html.includes(imagePath), `${imagePath} doit réellement figurer sur ${route}`);
      await access(dist(...imagePath.split("/").filter(Boolean)));
    }
  }
  assert.ok(count >= 10, `seulement ${count} images déclarées`);
});

test("le matériel du cours : des liens simples, ni prix, ni photo, ni balisage produit", async () => {
  const html = await htmlOf("/premiere-seance/");
  const debut = html.indexOf('class="section band mat"');
  assert.ok(debut >= 0, "/premiere-seance/ doit porter le bloc matériel");
  const bloc = html.slice(debut, html.indexOf("</section>", debut));
  const liens = [...bloc.matchAll(/href="(https:\/\/boutique\.boxingcenter\.fr\/materiel\/produit\/[^"]+)"/g)].map((m) => m[1]);
  assert.equal(liens.length, 12, "les 12 articles qui se retirent aux Minimes");
  assert.equal(new Set(liens).size, 12, "un article, un lien");
  assert.doesNotMatch(bloc, /the-shell/i, "les gants MMA The Shell ne se retirent pas aux Minimes");
  assert.doesNotMatch(bloc, /€|EUR/, "aucun prix dans le bloc");
  assert.doesNotMatch(bloc, /<img\b/, "aucune photo de la boutique");
  assert.doesNotMatch(html, /"@type":\s*"(Product|ItemList)"/, "aucun balisage produit");
});

test("les sections calculées du planning : présentes, et aucun prénom à côté d'une heure", async () => {
  const sections = [
    ["/le-club/", 'aria-label="La salle heure par heure"'],
    ["/coachs/", 'aria-label="Qui t’encadre selon ton objectif"'],
    ["/galerie/", 'aria-label="Quand venir voir ces scènes"'],
  ];
  for (const [route, marque] of sections) {
    const html = await htmlOf(route);
    const debut = html.indexOf(marque);
    assert.ok(debut >= 0, `${route} doit porter sa section calculée`);
    const texte = html.slice(debut, html.indexOf("</section>", debut)).replace(/<[^>]+>/g, " ");
    for (const phrase of texte.split(/(?<=[.!?:;])\s+/)) {
      if (/\b\d{1,2}h\d{0,2}\b/.test(phrase)) {
        assert.doesNotMatch(phrase, /Mehdi|Chloé|David|Clément/, `${route} : un prénom à côté d'une heure (règle du 19/08) — « ${phrase.trim()} »`);
      }
    }
  }
});

test("les offres de tous les jours : l'étudiant puis l'adulte, au centime, sans prix barré", async () => {
  const O = "/offre", [a, b] = ["29", "2" + "59"];
  const retires = new RegExp(`${O}/${a}\\b|${O}/${b}\\b|${O}s-speciales|product=offre-(?:duo|saison)`);
  for (const route of Object.keys(pages)) {
    const html = await htmlOf(route);
    assert.doesNotMatch(html, retires, `${route} pointe encore vers une offre retirée`);
    assert.doesNotMatch(html, /<s\b/, `${route} affiche un prix barré`);
  }
  const home = await htmlOf("/");
  const debut = home.indexOf('class="trustbar__grid"');
  const barre = home.slice(debut, home.indexOf("</section>", debut));
  const etu = barre.indexOf("product=etudiants-4-semaines&step=1");
  const adu = barre.indexOf("product=44-99-4-semaines&step=1");
  assert.ok(etu >= 0 && adu > etu, "la barre de l'accueil montre l'étudiant, puis l'adulte");
  assert.match(barre, /<b>36<\/b><i>€99<\/i>[\s\S]*36,99 €[\s\S]*carte étudiante requise/);
  assert.match(barre, /<b>44<\/b><i>€99<\/i>[\s\S]*44,99 €/);
  const ld = [...home.matchAll(/"price":"([\d.]+)"/g)].map((m) => m[1]);
  assert.ok(ld.includes("36.99") && ld.includes("44.99"), "le JSON-LD porte 36.99 et 44.99");
});
