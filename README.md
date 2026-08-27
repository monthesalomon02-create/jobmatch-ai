# JobMatch AI

Assistant intelligent qui analyse une offre d'emploi, la compare à votre CV, et génère automatiquement une lettre de motivation personnalisée accompagnée d'un score de correspondance — propulsé par l'IA générative de Mistral.

**Démo en ligne :** [jobmatch-ai-eta.vercel.app](https://jobmatch-ai-eta.vercel.app)

> Le backend est hébergé sur une instance gratuite Render : la première requête après une période d'inactivité peut prendre 30 à 50 secondes (temps de réveil du serveur).

---

## Pourquoi ce projet

En cherchant mon propre stage, j'ai voulu un outil qui fasse le travail répétitif d'adaptation d'une candidature à chaque offre : relire l'annonce, identifier les compétences clés, et rédiger une lettre pertinente sans travestir mon profil réel. JobMatch AI répond à ce besoin tout en me permettant de mettre en pratique un développement fullstack complet, de l'authentification jusqu'à l'intégration d'un LLM en production.

## Fonctionnalités

- **Authentification sécurisée** — inscription et connexion avec mots de passe hashés (bcrypt) et sessions gérées par JWT
- **Upload et analyse de CV** — envoi d'un PDF, extraction automatique du texte, stockage en base
- **Analyse d'offre par IA** — extraction structurée des compétences techniques, compétences humaines, niveau d'expérience et mots-clés à partir du texte brut d'une offre
- **Génération de lettre de motivation** — rédaction personnalisée en français, croisant le contenu réel du CV avec les exigences de l'offre
- **Score de correspondance** — évaluation chiffrée (0 à 100) du recouvrement entre le profil du candidat et les attentes du poste, avec explication
- **Historique des candidatures** — retrouvez vos CV et vos analyses précédentes

**Choix de conception à noter :** le prompt de génération est explicitement contraint pour ne jamais inventer de compétences absentes du CV. Le système préfère un score honnête et bas plutôt qu'une lettre enjolivée qui ne refléterait pas le profil réel du candidat.

## Stack technique

**Frontend**
- React 18 + Vite
- React Router (navigation, routes protégées)
- Tailwind CSS v4
- Axios

**Backend**
- Node.js + Express 5
- Prisma ORM (PostgreSQL)
- JWT + bcrypt (authentification)
- Multer (upload de fichiers)
- pdf-parse (extraction de texte PDF)
- SDK officiel Mistral AI (`@mistralai/mistralai`)

**Infrastructure**
- Base de données : [Neon](https://neon.tech) (PostgreSQL serverless)
- Backend : [Render](https://render.com)
- Frontend : [Vercel](https://vercel.com)
- IA générative : [Mistral AI](https://mistral.ai) (modèle `mistral-small-latest`)

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐        ┌─────────────────┐
│  Frontend React  │──HTTP──▶│   Backend Express     │──────▶ │  PostgreSQL      │
│  (Vercel)        │◀────────│   (Render)            │◀────── │  (Neon)          │
└─────────────────┘         └──────────┬───────────┘        └─────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │   Mistral AI API   │
                                │  (extraction +      │
                                │   génération)        │
                                └──────────────────┘
```

### Modèle de données

- **User** — comptes utilisateurs
- **CV** — texte extrait des PDF uploadés
- **JobOffer** — texte brut d'une offre + compétences extraites par l'IA (JSON)
- **Application** — lettre générée, score de correspondance, statut

### Routes API principales

| Méthode | Route | Description | Protégée |
|---|---|---|---|
| POST | `/auth/register` | Créer un compte | Non |
| POST | `/auth/login` | Se connecter | Non |
| POST | `/cv/upload` | Uploader et analyser un CV (PDF) | Oui |
| GET | `/cv` | Lister ses CV | Oui |
| POST | `/offers` | Analyser une offre d'emploi | Oui |
| GET | `/offers` | Lister ses offres analysées | Oui |
| POST | `/applications` | Générer une lettre + score | Oui |
| GET | `/applications` | Lister ses candidatures | Oui |

## Installation en local

### Prérequis
- Node.js 18+
- Un compte [Mistral AI](https://console.mistral.ai/) (clé API gratuite)
- Une base PostgreSQL (locale ou [Neon](https://neon.tech) gratuit)

### 1. Cloner le projet

```bash
git clone https://github.com/monthesalomon02-create/jobmatch-ai.git
cd jobmatch-ai
```

### 2. Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans `backend/` :

```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
JWT_SECRET="une-chaine-aleatoire-longue"
MISTRAL_API_KEY="votre-cle-api-mistral"
PORT=3000
```

Appliquer les migrations et lancer le serveur :

```bash
npx prisma migrate deploy
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### 3. Frontend

Dans un nouveau terminal :

```bash
cd frontend
npm install
```

Créer un fichier `.env` dans `frontend/` :

```env
VITE_API_URL="http://localhost:3000"
```

Lancer le serveur de développement :

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Déploiement

| Composant | Plateforme | Configuration clé |
|---|---|---|
| Base de données | Neon | PostgreSQL serverless, plan gratuit |
| Backend | Render | Root Directory : `backend` · Build : `npm install && npx prisma generate` · Start : `node src/app.js` |
| Frontend | Vercel | Root Directory : `frontend` · Variable `VITE_API_URL` pointant vers le backend Render |

## Pistes d'amélioration

- Score de correspondance calculé par une méthode déterministe (embeddings ou correspondance de mots-clés) en complément de l'évaluation par l'IA, pour des résultats plus reproductibles
- Export de la lettre générée en PDF
- Tableau de bord de suivi des candidatures (statuts : envoyée, entretien, refus)
- Mise en cache des analyses d'offres identiques pour limiter les appels API

## Auteur

**Salomon Monthe** — Étudiant en développement fullstack.