import test from "node:test";
import assert from "node:assert/strict";
import handler, { localAnswer } from "../api/chat.js";

const PROVIDER_ENV = [
  "GEMINI_API_KEY",
  "GEMINI_API_KEY_2",
  "GROQ_API_KEY",
  "MISTRAL_API_KEY",
  "CHAT_PROVIDER_TIMEOUT_MS",
];

function cleanProviders() {
  for (const key of Object.keys(process.env)) {
    if (/^GEMINI_API_KEY(?:_\d+)?$/.test(key) || PROVIDER_ENV.includes(key)) delete process.env[key];
  }
}

async function request(message, extra = {}) {
  let status = 0;
  let payload;
  const headers = new Map();
  const req = { method: "POST", body: { message, ...extra }, headers: {}, socket: {} };
  const res = {
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    status(code) { status = code; return this; },
    json(value) { payload = value; return value; },
    end() { return undefined; },
  };
  await handler(req, res);
  return { status, payload, headers };
}

test("assistant Minimes : cascade robuste et repli local", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalEnv = Object.fromEntries(PROVIDER_ENV.map((k) => [k, process.env[k]]));
  t.after(() => {
    globalThis.fetch = originalFetch;
    cleanProviders();
    for (const [key, value] of Object.entries(originalEnv)) if (value !== undefined) process.env[key] = value;
  });

  await t.test("répond sans aucune clé ni appel externe", async () => {
    cleanProviders();
    globalThis.fetch = async () => { throw new Error("fetch ne devait pas être appelé"); };
    const r = await request("Quels sont les horaires ?");
    assert.equal(r.status, 200);
    assert.equal(r.payload.via, "local");
    assert.match(r.payload.reply, /10h00.*21h30/i);
    assert.equal(r.headers.get("cache-control"), "no-store");
  });

  await t.test("une clé Gemini expirée tombe proprement sur la base locale", async () => {
    cleanProviders();
    process.env.GEMINI_API_KEY = "expired-test-key";
    let calls = 0;
    globalThis.fetch = async () => { calls++; return { ok: false, status: 401, json: async () => ({}) }; };
    const r = await request("Où est la salle ?");
    assert.equal(calls, 1);
    assert.equal(r.status, 200);
    assert.equal(r.payload.via, "local");
    assert.match(r.payload.reply, /12 rue de Fenouillet/i);
    assert.doesNotMatch(JSON.stringify(r.payload), /expired-test-key/);
  });

  await t.test("une clé Gemini refusée laisse Groq répondre", async () => {
    cleanProviders();
    process.env.GEMINI_API_KEY = "expired-test-key";
    process.env.GROQ_API_KEY = "groq-test-key";
    globalThis.fetch = async (url) => {
      if (String(url).includes("generativelanguage.googleapis.com"))
        return { ok: false, status: 401, json: async () => ({}) };
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: "La salle est ouverte du lundi au samedi." } }] }),
      };
    };
    const r = await request("Quand êtes-vous ouverts ?");
    assert.equal(r.status, 200);
    assert.equal(r.payload.via, "groq");
    assert.match(r.payload.reply, /lundi au samedi/i);
  });

  await t.test("un incident de tous les fournisseurs ne crée jamais de bulle vide", async () => {
    cleanProviders();
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.GROQ_API_KEY = "groq-test-key";
    process.env.MISTRAL_API_KEY = "mistral-test-key";
    globalThis.fetch = async () => { throw new Error("provider offline"); };
    const r = await request("Combien coûte la séance d'essai ?");
    assert.equal(r.status, 200);
    assert.equal(r.payload.via, "local");
    assert.match(r.payload.reply, /10€/);
    assert.ok(r.payload.reply.length > 40);
  });

  assert.match(localAnswer("Vous avez des cours pour les enfants ?"), /dès 3 ans/i);
});
