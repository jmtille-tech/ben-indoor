# Fragments de prompt et de code évoquant le physio (BEN Indoor, état physio-v1)

Source : `app/api/generer-rapport/route.ts` (trois variantes de prompt : neuroaccess, neurotaste, neuromedia) et `app/terrain/page.tsx`.

## Phrases retirées des prompts

```
Ces observations sont des données qualitatives terrain qui croisent la perception cognitive du visiteur. Elles alimentent directement l'analyse cognitive et comportementale du rapport, et serviront de référence pour le croisement futur avec les données biométriques (EDA/HRV) du Diagnostic Connecté.
```

```
Ces observations qualitatives terrain analysent les stimuli visuels et émotionnels, les déclencheurs de partage et les moments à fort impact cognitif. Elles sont destinées à être croisées avec les données biométriques EDA/HRV du Diagnostic Connecté.
```

```
Les observations neuro doivent enrichir les recommandations neuromarketing et identifier les données à croiser avec EDA/HRV.
```

Commentaire retiré (route.ts) :
```
        // Stocker les réponses neuro pour croisement futur avec données biométriques
```

## Question terrain neuromédia (terrain/page.tsx, ligne 350)
```
        neuro: 'Quels sont les 3 éléments qui créent le plus fort impact émotionnel sur le visiteur ? Comment ces stimuli peuvent-ils être croisés avec les données biométriques EDA/HRV pour cartographier l\'émotion réelle ?',
```
