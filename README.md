# Ben Indoor — Diagnostic Expérience Visiteur

Plateforme de diagnostic terrain pour espaces de loisirs **indoor** (trampoline parks, laser games, escape games, salles de sport...).

Version de Ben (neuroaccess-rapports) dédiée aux loisirs indoor, centrée sur l'observation **comportementale et cognitive**.

> Depuis octobre 2026, BEN est 100 % cognitif : la partie physiologique (NeuroImpact EDA/HRV, onglets « connecté ») ne fait plus partie de l'app. Le code est conservé dans `archive/physio/` (et dans la branche `archive/physio-v1`) pour l'app « Parcours des émotions ».

---

## Stack

- **Next.js 16** + TypeScript
- **Supabase** (auth + base de données + storage)
- **Anthropic Claude** (génération de rapport IA)
- **Vercel** (hébergement)

---

## Installation

```bash
npm install
```

## Variables d'environnement

Crée un fichier `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

## Lancement en développement

```bash
npm run dev
```

## Déploiement Vercel

1. Push sur GitHub
2. Import le repo sur Vercel
3. Ajoute les 3 variables d'environnement dans Vercel
4. Deploy

---

## Tables Supabase requises

Mêmes tables que `neuroaccess-rapports` :

- `clients` — nom, secteur_cible, plan, offres_actives, statut
- `missions` — client_id, type, date_mission, statut
- `rapports` — mission_id, executive_summary, parcours_scores, analyse_cognitive, **analyse_comportementale**, **entretiens_synthese**, synthese, score_neuroplay, statut, share_token
- `medias` — client_id, mission_id, type, url, nom, poste
- `user_profiles` — id, role, client_id

### Nouvelles colonnes à ajouter sur la table `rapports` :

```sql
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS analyse_comportementale jsonb;
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS entretiens_synthese jsonb;
```

---

## Protocole terrain — 10 postes

### Avant la visite
1. Accessibilité & parking
2. Accueil & entrée
3. Compréhension offre & tarifs

### Pendant la visite
4. Orientation & flux
5. Charge cognitive par zone
6. Engagement par activité
7. F&B indoor

### Après la visite
8. Sortie & dernière impression
9. Fidélisation & recontact

### + Micro-entretiens visiteurs (disponibles à tout moment pendant la visite)

---

## Différences avec Ben (neuroaccess-rapports)

| | Ben (neuroaccess) | Ben Indoor |
|---|---|---|
| Équipement | Aucun (physio archivée) | Aucun |
| Protocole | 11 postes + neuro | 10 postes comportementaux |
| Rapport | Analyse cognitive (sans NeuroImpact ni Score NeuroPlay) | Analyse comportementale + cognitive (sans NeuroImpact ni Score NeuroPlay) |
| Micro-entretiens | Non | Oui — intégrés au rapport |
| Cible | Parcs, musées, zoos | Loisirs indoor |
