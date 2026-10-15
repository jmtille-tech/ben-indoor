# Archive — partie physio de BEN Indoor

Contexte : décision d'octobre 2026 (« Architecture BEN · TicketMatch V2 ») — BEN devient 100 % cognitif ;
NeuroImpact et Score NeuroPlay quittent BEN et rejoignent l'app dédiée « Parcours des émotions ».
Même traitement que sur `neuroaccess-rapports`.

| Fichier | Origine | Rôle |
|---|---|---|
| `TeaserConnecte.tsx` | `app/rapport/[id]/page.tsx` | Teaser « Disponible en diagnostic connecté » (compile seul) |
| `rapport-onglet-neuroimpact.txt` | idem | Onglet NeuroImpact (données EDA/HRV ou teaser) |
| `rapport-onglet-score.txt` | idem | Onglet Score NeuroPlay (radar, barres, score global, ou teaser) |
| `rapport-effects-charts.txt` | idem | Effets Chart.js (lignes EDA/HRV, radar) |
| `terrain-choix-diagnostic-connecte.txt` | `app/terrain/page.tsx` | Carte désactivée « Diagnostic Connecté » |
| `prompt-fragments.md` | `route.ts`, `terrain/page.tsx` | Phrases de prompt évoquant les données biométriques |

Fichiers `.txt` : fragments non autonomes, à reprendre à la main. Le dossier est exclu du build (`tsconfig.json`).

## Retrouver l'état complet d'avant
Branche `archive/physio-v1`, tag `physio-v1`.

## Points d'attention
- Les courbes EDA/HRV de l'onglet NeuroImpact étaient tracées à partir de tableaux **codés en dur**, pas des données du rapport.
- Le « Score NeuroPlay » de cette app est dérivé de `score_neuroaccess` (dimensions propres à chaque type de mission). Cette valeur reste produite et stockée dans la colonne `score_neuroplay`, et reste affichée au récap de fin de diagnostic terrain (« Score Neuroaccess »). Seul l'onglet « Score NeuroPlay » du rapport est retiré.

## Non modifié
Les fiches commerciales `app/fiches/*` décrivent toujours un « diagnostic cognitif et connecté » (EDA & HRV). C'est du contenu commercial à réécrire selon la nouvelle structure d'offres.
