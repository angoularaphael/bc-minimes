# Boxing Center Minimes

Site vitrine de la salle Boxing Center Minimes (Toulouse, Barrière de Paris — 31200).
Projet Astro statique : 8 pages + page 404, fidèle à la maquette d'origine au pixel près.
S'y ajoutent trois fonctions serverless (assistant IA, carnet de contacts, backoffice).

## Commandes

```bash
npm install        # installer les dépendances
npm run dev        # serveur de développement (http://localhost:4321)
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build

# vérifier le site ET les fonctions ensemble, en local :
node scripts/serve-local.mjs 6902     # sert dist/ + les vrais handlers de api/
```

`astro dev` ne sait pas exécuter les fonctions de `api/` : en développement,
l'assistant tombera donc sur son repli hors-ligne. `scripts/serve-local.mjs`
sert le build ET importe les vrais fichiers de `api/` — c'est le seul moyen
local de vérifier la chaîne complète sans déployer.

## Structure

- `src/pages/` — les pages (HTML de la maquette, scripts et styles inline préservés)
- `src/content.json` — **le contenu modifiable depuis le backoffice** (salle, offres, coachs, planning, questions)
- `src/components/SiteContent.astro` — injecte dans chaque page l'écart entre `content.json` et les défauts de `data.js`
- `public/assets/js/data.js` — la source de vérité du contenu ; la fusion du contenu publié se fait à la fin du fichier
- `public/assets/js/chatbot.js` — le widget conversationnel
- `public/admin/` — le backoffice « Le coin bleu » (hors routage Astro)
- `api/` — les fonctions serverless (Vercel les sert à côté du build statique)

---

## L'assistant du site (`/api/chat`)

Le widget se greffe sur la pastille au **gant de boxe** déjà présente dans le
HTML — la marque de la maison, pas la bulle de messagerie de tout le monde.
**Sans JavaScript, cette pastille reste un lien `tel:` qui appelle la salle** ;
le script la promeut en conversation. Il n'y a donc jamais de bouton mort.

Le prompt système est ancré sur les vraies données de la salle, lues dans
`src/content.json` (adresse, horaires, offres, coachs, planning), avec un repli
statique figé si le fichier devient illisible.

Cascade de fournisseurs, dans l'ordre :

1. **Gemini** — toutes les variables commençant par `GEMINI_API_KEY` forment un
   pool ; elles sont mélangées et les clés mortes sont sautées.
   Modèle réglable par `GEMINI_MODEL` (défaut `gemini-2.5-flash`).
2. **Groq** — `GROQ_API_KEY`, `GROQ_MODEL` (défaut `llama-3.3-70b-versatile`).
3. **Mistral** — `MISTRAL_API_KEY`, `MISTRAL_MODEL` (défaut `mistral-small-latest`).
4. **La base de connaissance locale** — si aucune clé n'est configurée, ou si
   toutes échouent, la fonction répond quand même (200) depuis les faits de la
   salle codés dans `api/chat.js`. L'assistant perd la conversation libre, pas
   son utilité. Aucune page morte, jamais.

### La capture de contacts

Le widget extrait au fil de la conversation, sans jamais interroger de force :

| Ce que le visiteur écrit | Ce qui est capté |
| --- | --- |
| « Salut, moi c'est Karim » | `prenom` |
| « mon numéro c'est 06 12 34 56 78 » | `phone` |
| « karim@mail.com » | `email` |
| « je viens de Ramonville » | `salle` |

Le prénom est aussi capté en un seul mot quand le bot vient de le demander
(drapeau `expectName`). Dès qu'on a un moyen de recontact (email **ou**
téléphone), le lead part vers `/api/lead`. Une signature anti-doublon évite les
envois répétés ; un profil enrichi (le téléphone puis l'email) repart une fois,
complété. Après deux échanges sans coordonnées, le bot propose **une seule
fois**, gentiment, de laisser un contact.

## Le carnet de contacts (`/api/lead`)

Trois voies, cumulables, toutes optionnelles :

| Variables | Effet |
| --- | --- |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_*`) | **Stockage** : le lead est relisible dans le backoffice, section « Les contacts ». 500 derniers gardés. |
| `RESEND_API_KEY` (+ `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`) | Un email part à chaque contact. `LEAD_EMAIL_TO` vaut `boxingcenter31@gmail.com` par défaut. |
| `LEAD_WEBHOOK_URL` | Un POST JSON (Zapier, Make, Google Sheets…). |

**Rien de configuré ?** La fonction répond quand même `200` et journalise le
lead dans les logs Vercel. Le parcours du visiteur n'est jamais cassé par un
secret manquant. Le backoffice, lui, affiche franchement ce qu'il manque à
brancher au lieu d'un tableau vide qui mentirait.

Voie recommandée pour démarrer : **Vercel KV** (gratuit, deux variables, aucune
dépendance npm) + **Resend** pour recevoir l'alerte par email.

## La galerie du club (`/api/community/*`)

La page `/galerie/` n'est plus seulement à regarder : les gens de la salle y
**déposent** leurs photos et leurs vidéos, et ça sert aussi à **capter des
contacts** — le dépôt exige un prénom **et** un email **ou** un numéro, qui
partent dans le carnet existant (`/api/lead`, `event: "upload_contributor"`).
Un seul carnet, pas deux systèmes.

**Le stockage est Cloudinary**, comme à Portet — et il fait tout à la fois :
stockage, transcodage (transformations à la livraison), base de données
(l'**état vit dans les tags**) et modération. Chaque salle a **son propre
dossier** : ici `bc-minimes-community`.

| Route | Rôle |
| --- | --- |
| `POST /api/community/sign` | Valide prénom / contact / titre (filtre d'injures), limite par IP, puis **signe** un dépôt direct vers Cloudinary. Les octets ne traversent jamais Vercel (limite de 4,5 Mo sur le corps). |
| `POST /api/community/verify` | **L'œil de la machine** sur les photos : une vignette part chez Gemini, qui écarte l'évident. Voir plus bas. |
| `GET /api/community/items` | Le mur public — **uniquement** les médias tagués `approved`. |
| `GET /api/community/pending` | La file de modération (staff, `x-admin-token`). |
| `POST /api/community/moderate` | Approuver (retag `approved`) ou refuser (destruction du fichier). |

**Rien n'est publié directement.** Tout dépôt atterrit tagué `pending`,
invisible du public, et n'apparaît sur le site qu'après approbation dans
*Le coin bleu → La galerie du club*.

Le fichier est vérifié **côté navigateur ET côté serveur** : octets d'en-tête
(pas l'extension : un `.jpg` peut être n'importe quoi), **décodage réel** de
l'image, **durée de la vidéo ≤ 15 s**, taille max, prénom et titre passés au
filtre d'injures partagé (`cleanName`), limite de dépôts par IP.

### L'œil de la machine (photos uniquement)

Tout ça dit que le fichier **est** une image. Ça ne dit rien de **ce qu'il y a
dessus**. Avant qu'une photo ne parte chez Cloudinary, le navigateur en fabrique
une vignette (640 px, JPEG, quelques dizaines de Ko) et l'envoie à
`POST /api/community/verify`, qui la montre à Gemini — **les mêmes clés
`GEMINI_API_KEY*` que l'assistant**, lues en pool, rien de plus à configurer.

Le modèle ne rend qu'un mot. Il écarte l'évident — nudité, violence, haine,
capture d'écran, mème, document, hors sujet complet — et **dans le doute il
laisse passer**. Ce n'est pas un juge, c'est un tamis : il fait gagner du temps
au staff, il ne décide rien.

- **Sans clé, avec une clé morte, sur panne ou sur lenteur : le dépôt passe.**
  Il part en file de modération humaine, exactement comme avant. Une
  vérification qu'on n'a pas ne doit jamais devenir une porte fermée.
- **Les vidéos ne passent pas par là.** On n'analyse pas des images animées avec
  un outil qui regarde des images fixes — elles vont droit à la file humaine, et
  le vestiaire le dit.
- Le vestiaire affiche pour chaque dépôt s'il a été filtré (« Photo passée par
  l'œil machine ») ou non (« Non filtré — à toi de regarder »). C'est une
  **indication**, pas une garantie : un client bricolé peut sauter l'étape.
  C'est précisément pour ça qu'un humain tranche derrière, toujours.

### Le contact du déposant

Il part dans le carnet (`/api/lead`, `event: "upload_contributor"`) **et** il est
attaché au média, pour que le staff qui modère sache qui a envoyé quoi sans
croiser deux écrans. Il ne ressort **que** par `/api/community/pending`, derrière
`isAdmin()` — `publicItem()` ne le rend jamais sur le mur public.

**Perf** : la feuille et le module du mur ne descendent que lorsque la section
approche de l'écran, et une vidéo approuvée n'est jamais téléchargée au premier
rendu — on ne sert que son affiche.

| Variables | Rôle |
| --- | --- |
| `CLOUDINARY_URL` | **La seule requise.** Forme : `cloudinary://<api_key>:<api_secret>@<cloud_name>`. Sans elle, la section se ferme proprement — aucun dépôt, aucun cadre vide. |
| `COMMUNITY_FOLDER` | Le dossier de la salle. `bc-minimes-community` par défaut. `CLOUDINARY_FOLDER` est accepté comme second nom. |
| `GEMINI_API_KEY*` | Les clés de l'assistant, réutilisées pour l'œil de la machine. **Aucune = tout part en file humaine**, rien ne casse. |
| `CLOUDINARY_MODERATION` | Modération automatique (add-on Cloudinary : `aws_rek` pour les images, `google_video_moderation` pour les vidéos). **Vide = tout part en file humaine** : le système marche sans, on ne promet pas une vérification qu'on n'a pas. |
| `COMMUNITY_MAX_MB`, `COMMUNITY_MAX_SEC` | Les limites annoncées au visiteur et vérifiées avant l'envoi. `60` / `15` par défaut. |
| `RATE_WINDOW_MIN`, `RATE_MAX` | La limite de dépôts par IP. `10` min / `3` dépôts par défaut. |

> La CSP de `vercel.json` autorise `https://api.cloudinary.com` en `connect-src`
> et `https://res.cloudinary.com` en `media-src`. Sans ces deux entrées, l'envoi
> et la lecture des vidéos sont bloqués par le navigateur.

## Le backoffice — « Le coin bleu » (`/admin/`)

Protégé par `ADMIN_TOKEN`, vérifié **côté fonction** : aucun secret ne vit dans
le front, le mot de passe saisi n'est qu'un en-tête `x-admin-token` que le
serveur compare en temps constant.

Il permet d'éditer la salle, les offres, les coachs, le planning et les
questions, puis de **publier** : commit de `src/content.json` sur GitHub, ce qui
déclenche une reconstruction Vercel. « Aperçu » ouvre `/?apercu=1`, qui affiche
le site avec le brouillon local — **rien n'est en ligne tant qu'on n'a pas
publié**.

Une visite guidée se lance au premier passage, et quatre assistants pas à pas
(changer les horaires, modifier un prix, ajouter un créneau, voir les contacts)
guident geste par geste : ils assombrissent l'écran sauf la cible, et attendent
le vrai clic de l'utilisateur au lieu d'un bouton « Suivant ».

| Variables | Rôle |
| --- | --- |
| `ADMIN_TOKEN` | Le mot de passe du staff. **Obligatoire**, sinon l'accès est refusé (aucune porte ouverte par défaut). |
| `GITHUB_TOKEN`, `GITHUB_REPO` | La publication. Sans eux, le backoffice passe en **lecture seule** et le dit. |
| `GITHUB_BRANCH` | `main` par défaut. |
| `VERCEL_DEPLOY_HOOK` | Déclenche la reconstruction après publication (recommandé). |

## Déploiement

Importer le repo dans Vercel — le framework Astro est détecté automatiquement,
et le dossier `api/` est servi en fonctions serverless à côté du build statique.

`vercel.json` porte les en-têtes de sécurité (HSTS, CSP, X-Frame-Options,
Referrer-Policy, Permissions-Policy, X-Content-Type-Options), les durées de
cache par type d'asset (polices immuables un an, images et vidéos 30 jours avec
revalidation en arrière-plan), le `no-store` sur `/api/` et le `noindex` sur
`/admin/`.

---

## Mise en ligne (Vercel)

1. **Importer** — Vercel → *Add New Project* → importe `Bc-minimes`. Le framework (Astro) est détecté tout seul : rien à configurer.
2. **Variables d'environnement** — copie celles de [`.env.example`](.env.example) dans *Settings → Environment Variables*. Toutes sont facultatives : sans elles le site tourne, en mode dégradé honnête (l'assistant répond depuis sa base locale, les contacts partent dans les logs, le vestiaire explique ce qui lui manque au lieu de casser).
3. **Domaine** — branche `minimes.boxingcenter.fr` dans *Settings → Domains*.
4. **Vérifier les en-têtes** — une fois en ligne : `curl -I https://boxe-toulouse.com` doit montrer `strict-transport-security`, `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy` et `content-security-policy`. Ils ne s'activent que sur Vercel, jamais en local.

### La boutique
Les liens boutique pointent vers **`https://boutique.boxingcenter.fr/`** (la nouvelle boutique Box-Plus).
Le jour où le domaine payant est en place, il n'y a qu'UN endroit à changer : `LINKS.boutique`
dans `public/assets/js/data.js` — tout le site, le maillage et le JSON-LD suivent.

### Sécurité
`.env` est ignoré par git ; aucun secret n'est présent dans le dépôt (vérifié). Les clés vivent
uniquement dans les variables d'environnement Vercel, jamais dans le front : l'admin s'authentifie
côté serverless, en comparaison à temps constant.
