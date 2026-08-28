/* =====================================================================
   UN PARSEUR robots.txt CONFORME À LA RFC 9309

   Écrit à la main, et pas emprunté, pour une raison précise : les
   bibliothèques toutes faites ne s'accordent pas sur ce fichier, et
   c'est justement là que les erreurs se cachent.

   LES DEUX RÈGLES QUI COMPTENT

   §2.2.1 — Un robot n'obéit qu'à UN groupe : le plus spécifique qui le
   NOMME. S'il est nommé quelque part, il ne lit jamais « User-agent: * ».
   C'est le piège classique : on écrit les interdictions sous l'étoile,
   on croit avoir fermé la porte, et les vingt robots nommés au-dessus
   passent devant sans la voir.

   §2.2.2 — Entre deux règles qui correspondent au chemin, c'est la plus
   SPÉCIFIQUE qui gagne, mesurée en longueur de motif. « /api/mcp » (9)
   bat « /api/ » (5). À longueur égale, Allow l'emporte sur Disallow.

   L'ordre d'écriture ne compte donc pas — mais on écrit quand même les
   règles dans le bon ordre dans nos fichiers, parce qu'il existe des
   parseurs en premier-match, et qu'un fichier juste pour les deux
   familles ne coûte rien.
   ===================================================================== */

/** Un motif robots.txt : `*` vaut n'importe quelle suite, `$` ancre la fin. */
function correspond(motif, chemin) {
  if (motif === "") return false;
  const ancre = motif.endsWith("$");
  const m = ancre ? motif.slice(0, -1) : motif;
  const morceaux = m.split("*");

  let i = 0;
  for (let k = 0; k < morceaux.length; k++) {
    const bout = morceaux[k];
    if (bout === "") continue;
    const j = k === 0 ? (chemin.startsWith(bout) ? 0 : -1) : chemin.indexOf(bout, i);
    if (j < 0) return false;
    i = j + bout.length;
  }
  /* Le dernier morceau doit toucher la fin si le motif est ancré. */
  if (ancre) {
    const dernier = morceaux[morceaux.length - 1];
    return dernier === "" ? true : chemin.endsWith(dernier) && i === chemin.length;
  }
  return true;
}

export class RobotsTxt {
  constructor(texte) {
    /** nom du robot en minuscules -> [{ permis, motif }] */
    this.groupes = new Map();

    let courants = [];
    let dansEntetes = false;

    for (const brute of texte.split(/\r?\n/)) {
      const ligne = brute.replace(/#.*$/, "").trim();
      if (!ligne) continue;
      const sep = ligne.indexOf(":");
      if (sep < 0) continue;
      const champ = ligne.slice(0, sep).trim().toLowerCase();
      const valeur = ligne.slice(sep + 1).trim();

      if (champ === "user-agent") {
        /* Plusieurs « User-agent » d'affilée forment UN seul groupe. */
        if (!dansEntetes) { courants = []; dansEntetes = true; }
        const nom = valeur.toLowerCase();
        courants.push(nom);
        if (!this.groupes.has(nom)) this.groupes.set(nom, []);
        continue;
      }

      if (champ === "allow" || champ === "disallow") {
        dansEntetes = false;
        for (const nom of courants) {
          this.groupes.get(nom).push({ permis: champ === "allow", motif: valeur });
        }
      }
    }
  }

  /** Le groupe qui s'applique à ce robot : le plus spécifique qui le NOMME. */
  groupePour(robot) {
    const r = String(robot).toLowerCase();
    let meilleur = null;
    for (const nom of this.groupes.keys()) {
      if (nom === "*") continue;
      /* Un robot « GPTBot/1.2 » est couvert par le groupe « gptbot ». */
      if (r.startsWith(nom) && (meilleur === null || nom.length > meilleur.length)) {
        meilleur = nom;
      }
    }
    if (meilleur !== null) return this.groupes.get(meilleur);
    return this.groupes.get("*") || [];
  }

  /** RFC 9309 §2.2.2 : le motif le plus long gagne ; à égalité, Allow. */
  autorise(robot, chemin) {
    let gagnante = null;
    for (const r of this.groupePour(robot)) {
      if (!correspond(r.motif, chemin)) continue;
      if (
        gagnante === null ||
        r.motif.length > gagnante.motif.length ||
        (r.motif.length === gagnante.motif.length && r.permis && !gagnante.permis)
      ) {
        gagnante = r;
      }
    }
    return gagnante === null ? true : gagnante.permis;
  }
}
