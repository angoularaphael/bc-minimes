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
    ["/tarifs/", "offers", /29€/],
    ["/tarifs/", "money-faq", /L’offre Rentrée/i],
    ["/contact/", "access", /Barrière de Paris/i],
    ["/contact/", "hours", /10h00/i],
    ["/contact/", "faq", /Où se trouve Boxing Center Minimes/i],
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
