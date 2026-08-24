import { SITE, ROUTES, BUILT } from "../routes.mjs";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const HOME_VIDEOS = [
  {
    content: "/assets/media/clip-bags.mp4",
    thumb: "/assets/img/bc/anglaise-4.webp",
    title: "Sacs de frappe — Boxing Center Minimes, Toulouse",
    description:
      "Travail au sac au Boxing Center Minimes, 12 rue de Fenouillet, 31200 Toulouse (quartier des Minimes / Barrière de Paris).",
    duration: 10,
  },
  {
    content: "/assets/media/clip-mats.mp4",
    thumb: "/assets/img/bc/training-1.webp",
    title: "Plateau combat — Boxing Center Minimes",
    description:
      "Entraînement sur le plateau du Boxing Center Minimes, salle historique de boxe anglaise à Toulouse nord.",
    duration: 8,
  },
  {
    content: "/assets/media/clip-sparring.mp4",
    thumb: "/assets/img/bc/anglaise-3.webp",
    title: "Assaut encadré — Boxing Center Minimes",
    description:
      "Assaut encadré au Boxing Center Minimes. Le sparring n’est jamais imposé : uniquement sur demande, samedi pour les compétiteurs.",
    duration: 10,
  },
];

const EXTRA = [
  { path: "/llms.txt", changefreq: "weekly", priority: "0.4", images: [] },
  { path: "/llms-full.txt", changefreq: "weekly", priority: "0.3", images: [] },
  { path: "/ai.txt", changefreq: "monthly", priority: "0.3", images: [] },
];

function imagesXml(images) {
  return images
    .map(
      ([src, titre, legende]) => `    <image:image>
      <image:loc>${SITE}${src}</image:loc>
      <image:title>${esc(titre)}</image:title>
      <image:caption>${esc(legende)}</image:caption>
    </image:image>`
    )
    .join("\n");
}

function videosXml(videos) {
  return (videos || [])
    .map(
      (v) => `    <video:video>
      <video:thumbnail_loc>${SITE}${v.thumb}</video:thumbnail_loc>
      <video:title>${esc(v.title)}</video:title>
      <video:description>${esc(v.description)}</video:description>
      <video:content_loc>${SITE}${v.content}</video:content_loc>
      <video:duration>${v.duration}</video:duration>
      <video:publication_date>2026-08-01</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`
    )
    .join("\n");
}

export function GET() {
  const all = ROUTES.concat(EXTRA);
  const urls = all
    .map((r) => {
      const videos = r.path === "/" ? videosXml(HOME_VIDEOS) : "";
      const images = r.images?.length ? imagesXml(r.images) : "";
      const extras = [images, videos].filter(Boolean).join("\n");
      return `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${BUILT}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>${extras ? `\n${extras}` : ""}
  </url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Boxing Center Minimes — ${SITE}/sitemap.xml
     Pages, photos (Google Images) et vidéos. Fabriqué au build depuis src/routes.mjs.
     /admin/ et /api/ n'y figurent pas. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
