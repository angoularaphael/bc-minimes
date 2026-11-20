/* =====================================================================
   POST /api/lead — le carnet de contacts de la salle.
   Le widget appelle cette fonction dès qu’il a de quoi recontacter le
   visiteur (prénom + email OU téléphone).

   Trois voies, cumulables, toutes configurées par variables d’environnement :
     1. KV (Vercel KV / Upstash Redis REST) → le lead est STOCKÉ et
        relisible dans le backoffice (« Les contacts »).
     2. BREVO_API_KEY → un email part vers LEAD_EMAIL_TO
        (boxingcenter31@gmail.com par defaut).
     3. LEAD_WEBHOOK_URL → un POST JSON (Zapier, Make, Google Sheets…).

   SANS AUCUNE configuration : la fonction répond 200 et journalise le
   lead dans les logs Vercel. Le parcours du visiteur n’est jamais cassé
   par un secret manquant — c’est la règle.
   ===================================================================== */
import { allowCors, body, ipOf, kv, kvReady, KV_KEY } from "./_lib/util.js";

const MAX_LEADS = 500; // le carnet garde les 500 derniers contacts

/* On retire ce qui casse du HTML ou une ligne d’email (< > | =) et les
   caractères de contrôle. SURTOUT PAS les chiffres, l’arobase, le point
   ni le plus : c’est précisément l’email et le numéro qu’on vient
   chercher. (Une classe [ESPACE-<] les aurait tous mangés.) */
const clean = (v, n = 120) =>
  String(v == null ? "" : v)
    .replace(/[<>|=]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, n);

function normalise(b, req) {
  const prenom = clean(b.prenom, 60);
  const nom = clean(b.nom, 60);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    event: clean(b.event, 40) || "lead_collected",
    prenom, nom,
    name: clean(b.name, 120) || [prenom, nom].filter(Boolean).join(" "),
    email: clean(b.email, 160),
    phone: clean(b.phone, 40),
    salle: clean(b.salle, 60) || "Minimes",
    message: clean(b.message, 500),
    sessionId: clean(b.sessionId, 60),
    page: clean(b.page, 200),
    source: "minimes",
    ip: ipOf(req),
  };
}

/* Copie vers la base COMMUNE du réseau (gestion-manager) — la règle du boss :
   tout formulaire, tout chatbot, UNE seule base de contacts. Côté serveur :
   pas de CORS, et jamais bloquant pour le visiteur. */
async function forwardToNetwork(lead) {
  try {
    await fetch("https://gestion-manager.vercel.app/api/chatbot/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, source: "bc-minimes" }),
    });
    return true;
  } catch { return false; }
}

async function notifyEmail(lead) {
  const key = String(process.env.BREVO_API_KEY || "").trim();
  if (!key.startsWith("xkeysib-")) return false;
  const to = process.env.LEAD_EMAIL_TO || "boxingcenter31@gmail.com";
  const name = process.env.BREVO_SENDER_NAME || "Boxing Center";
  const email = process.env.BREVO_SENDER_EMAIL || "contact@boxingcenter.fr";
  const lines = [
    ["Prenom", lead.prenom], ["Nom", lead.nom], ["Telephone", lead.phone],
    ["Email", lead.email], ["Salle", lead.salle], ["Demande", lead.event],
    ["Page", lead.page], ["Recu le", lead.at],
  ].filter(([, v]) => v);
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name, email },
      to: [{ email: to }],
      replyTo: { email: "boxingcenter31@gmail.com", name },
      subject: `Nouveau contact — ${lead.prenom || "visiteur"}${lead.phone ? " · " + lead.phone : ""}`,
      textContent: lines.map(([k, v]) => `${k} : ${v}`).join("\n") + (lead.message ? `\n\nMessage :\n${lead.message}` : ""),
    }),
  });
  return r.ok;
}

async function notifyWebhook(lead) {
  if (!process.env.LEAD_WEBHOOK_URL) return false;
  const r = await fetch(process.env.LEAD_WEBHOOK_URL, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead),
  });
  return r.ok;
}

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const lead = normalise(body(req), req);
  if (!lead.email && !lead.phone)
    return res.status(400).json({ error: "Aucun moyen de recontact." });

  const done = { stored: false, mailed: false, hooked: false };

  if (kvReady()) {
    try {
      await kv(["LPUSH", KV_KEY, JSON.stringify(lead)]);
      await kv(["LTRIM", KV_KEY, "0", String(MAX_LEADS - 1)]);
      done.stored = true;
    } catch (e) { console.error("[lead] KV :", e.message); }
  }
  try { done.network = await forwardToNetwork(lead); } catch (e) { console.error("[lead] réseau :", e.message); }
  try { done.mailed = await notifyEmail(lead); } catch (e) { console.error("[lead] email :", e.message); }
  try { done.hooked = await notifyWebhook(lead); } catch (e) { console.error("[lead] webhook :", e.message); }

  // Rien de configuré (ou tout en panne) : on journalise proprement. Le
  // lead reste retrouvable dans les logs Vercel, et le visiteur ne voit
  // jamais d’erreur.
  if (!done.stored && !done.mailed && !done.hooked)
    console.log("[lead] non persisté (aucun stockage configuré) :", JSON.stringify(lead));

  return res.status(200).json({ ok: true, ...done });
}
