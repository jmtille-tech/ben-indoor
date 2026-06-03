import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function generateShareToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ── PROMPT NEUROACCESS ──
function buildPromptNeuroaccess(notesTexte: string, clientNom: string, reponsesNeuroTexte: string): string {
  return `Tu es BEN™, outil d'analyse IA propriétaire de Neuroplay Xpériences, développé à partir de plus de 20 ans d'expertise terrain en expérience visiteur.

Tu viens de réaliser un diagnostic Neuroaccess pour ${clientNom}. Ce diagnostic analyse l'intégralité du parcours visiteur — avant, pendant et après la visite — selon une grille d'observation neuro-comportementale structurée.

Voici tes observations terrain, poste par poste :

${notesTexte}
${reponsesNeuroTexte ? `
---
OBSERVATIONS NEURO-COMPORTEMENTALES (réponses aux questions cognitives terrain) :
Ces observations sont des données qualitatives terrain qui croisent la perception cognitive du visiteur. Elles alimentent directement l'analyse cognitive et comportementale du rapport, et serviront de référence pour le croisement futur avec les données biométriques (EDA/HRV) du Diagnostic Connecté.

${reponsesNeuroTexte}
` : ''}
Sur la base de ces observations, génère un rapport structuré au format JSON strict.
IMPORTANT : réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks. Commence par { et termine par }.

{
  "executive_summary": {
    "score_global": 7,
    "type_site": "type d'établissement identifié",
    "frictions": ["friction parcours 1", "friction 2", "friction 3"],
    "opportunites": ["opportunité immédiate 1", "opportunité 2", "opportunité 3"],
    "insight": "insight stratégique clé sur le parcours visiteur global"
  },
  "parcours_scores": {
    "avant": [
      {"label": "Accessibilité & transport", "score": 7},
      {"label": "Parking & cheminement", "score": 6},
      {"label": "Signalétique externe", "score": 5},
      {"label": "Digital & réservation", "score": 6}
    ],
    "pendant": [
      {"label": "Accueil humain", "score": 7},
      {"label": "Fluidité du parcours", "score": 6},
      {"label": "Compréhension offre & prix", "score": 5},
      {"label": "Expérience F&B", "score": 6}
    ],
    "apres": [
      {"label": "Sortie & dernière impression", "score": 6},
      {"label": "Boutique & souvenir", "score": 5},
      {"label": "Fidélisation & recontact", "score": 4}
    ]
  },
  "analyse_comportementale": {
    "zones_chaudes": ["zone très fréquentée ou très appréciée 1", "zone 2"],
    "zones_froides": ["zone sous-exploitée ou problématique 1", "zone 2"],
    "comportements_positifs": ["comportement observé positif 1", "comportement 2"],
    "comportements_friction": ["comportement de friction ou hésitation 1", "comportement 2"]
  },
  "analyse_cognitive": {
    "surcharge": ["point de surcharge cognitive observé 1", "point 2", "point 3"],
    "doute": ["moment d'hésitation ou de confusion 1", "moment 2"],
    "waouh": ["moment d'engagement fort ou de surprise positive 1", "moment 2"]
  },
  "synthese": [
    {"type": "critique", "texte": "action critique prioritaire 1", "poste": "poste concerné", "delai": "immédiat"},
    {"type": "critique", "texte": "action critique 2", "poste": "poste", "delai": "< 1 mois"},
    {"type": "quickwin", "texte": "quick win facilement actionnable", "poste": "poste", "delai": "1 semaine"},
    {"type": "quickwin", "texte": "quick win 2", "poste": "poste", "delai": "2 semaines"},
    {"type": "optimisation", "texte": "optimisation moyen terme", "poste": "poste", "delai": "1-3 mois"},
    {"type": "long_terme", "texte": "évolution structurelle", "poste": "poste", "delai": "6-12 mois"}
  ],
  "score_neuroaccess": {
    "accessibilite_venue": 7,
    "premier_contact": 6,
    "fluidite_parcours": 7,
    "clarte_cognitive": 6,
    "experience_fb": 5,
    "sortie_fidelisation": 4
  }
}

Remplace toutes les valeurs par celles issues de tes observations terrain. Les réponses neuro-comportementales doivent enrichir particulièrement l'analyse_cognitive (surcharge, doute, waouh) et les insights stratégiques. IMPORTANT : score_global et tous les scores doivent être sur 10 maximum (ex: 6.5, 7, 8.2). Sois précis, actionnable, orienté expérience visiteur réelle.`
}

// ── PROMPT NEUROTASTE ──
function buildPromptNeurotaste(notesTexte: string, clientNom: string, reponsesNeuroTexte: string): string {
  return `Tu es BEN™, outil d'analyse IA propriétaire de Neuroplay Xpériences, développé à partir de plus de 20 ans d'expertise terrain en expérience visiteur et restauration sur sites de loisirs.

Tu viens de réaliser un diagnostic Neurotaste pour ${clientNom}. Ce diagnostic analyse l'intégralité de l'expérience de restauration — avant la commande, pendant et après — selon une grille d'observation neuro-comportementale structurée.

Voici tes observations terrain, poste par poste :

${notesTexte}
${reponsesNeuroTexte ? `
---
OBSERVATIONS NEURO-COMPORTEMENTALES (réponses aux questions cognitives terrain) :
Ces observations qualitatives terrain croisent la perception sensorielle et cognitive du visiteur face à l'offre F&B. Elles alimentent directement l'analyse cognitive et comportementale du rapport.

${reponsesNeuroTexte}
` : ''}
Sur la base de ces observations, génère un rapport structuré au format JSON strict.
IMPORTANT : réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks. Commence par { et termine par }.

{
  "executive_summary": {
    "score_global": 7,
    "type_site": "type d'établissement et contexte restauration identifié",
    "frictions": ["friction F&B 1", "friction 2", "friction 3"],
    "opportunites": ["opportunité immédiate 1", "opportunité 2", "opportunité 3"],
    "insight": "insight stratégique clé sur l'expérience F&B globale"
  },
  "parcours_scores": {
    "avant": [
      {"label": "Accessibilité & signalétique F&B", "score": 7},
      {"label": "Ambiance & scénographie", "score": 6},
      {"label": "Lisibilité menus & prix", "score": 5}
    ],
    "pendant": [
      {"label": "Qualité & cohérence de l'offre", "score": 7},
      {"label": "Accueil & relation client", "score": 6},
      {"label": "Fluidité & temps d'attente", "score": 5}
    ],
    "apres": [
      {"label": "Qualité & présentation produits", "score": 6},
      {"label": "Performance & fidélisation", "score": 4}
    ]
  },
  "analyse_comportementale": {
    "zones_chaudes": ["zone ou moment très appréciés 1", "zone 2"],
    "zones_froides": ["point de friction ou zone sous-exploitée 1", "zone 2"],
    "comportements_positifs": ["comportement observé positif 1", "comportement 2"],
    "comportements_friction": ["friction comportementale observée 1", "friction 2"]
  },
  "analyse_cognitive": {
    "surcharge": ["point de surcharge cognitive ou sensorielle 1", "point 2"],
    "doute": ["moment d'hésitation ou confusion face à l'offre 1", "moment 2"],
    "waouh": ["moment d'engagement fort ou plaisir sensoriel 1", "moment 2"]
  },
  "synthese": [
    {"type": "critique", "texte": "action critique prioritaire", "poste": "poste concerné", "delai": "immédiat"},
    {"type": "critique", "texte": "action critique 2", "poste": "poste", "delai": "< 1 mois"},
    {"type": "quickwin", "texte": "quick win facilement actionnable", "poste": "poste", "delai": "1 semaine"},
    {"type": "quickwin", "texte": "quick win 2", "poste": "poste", "delai": "2 semaines"},
    {"type": "optimisation", "texte": "optimisation moyen terme", "poste": "poste", "delai": "1-3 mois"},
    {"type": "long_terme", "texte": "évolution structurelle de l'offre", "poste": "poste", "delai": "6-12 mois"}
  ],
  "score_neuroaccess": {
    "acces_lisibilite": 7,
    "ambiance_scenographie": 6,
    "qualite_offre": 7,
    "relation_client": 6,
    "fluidite_service": 5,
    "performance_fidelisation": 4
  }
}

Remplace toutes les valeurs par celles issues de tes observations terrain F&B. Les réponses neuro doivent enrichir l'analyse_cognitive (surcharge sensorielle, hésitations face à l'offre, moments waouh gustatifs). IMPORTANT : tous les scores sur 10 maximum. Sois précis, actionnable, orienté expérience F&B réelle sur site de loisirs.`
}

// ── PROMPT NEUROMEDIA ──
function buildPromptNeuromedia(notesTexte: string, clientNom: string, reponsesNeuroTexte: string): string {
  return `Tu es BEN™, outil d'analyse IA propriétaire de Neuroplay Xpériences, développé à partir de plus de 20 ans d'expertise terrain en expérience visiteur et neuromarketing.

Tu viens de réaliser un diagnostic Neuromedia pour ${clientNom}. Ce diagnostic analyse l'activation digitale, le storytelling, la captation de contenus et l'impact neuromarketing — avant, pendant et après la visite.

Voici tes observations terrain, poste par poste :

${notesTexte}
${reponsesNeuroTexte ? `
---
OBSERVATIONS NEURO-COMPORTEMENTALES & NEUROMARKETING :
Ces observations qualitatives terrain analysent les stimuli visuels et émotionnels, les déclencheurs de partage et les moments à fort impact cognitif. Elles sont destinées à être croisées avec les données biométriques EDA/HRV du Diagnostic Connecté.

${reponsesNeuroTexte}
` : ''}
Sur la base de ces observations, génère un rapport structuré au format JSON strict.
IMPORTANT : réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks. Commence par { et termine par }.

{
  "executive_summary": {
    "score_global": 7,
    "type_site": "type d'établissement et contexte média identifié",
    "frictions": ["friction media/digitale 1", "friction 2", "friction 3"],
    "opportunites": ["opportunité activation 1", "opportunité 2", "opportunité 3"],
    "insight": "insight stratégique clé sur l'activation média et le neuromarketing du site"
  },
  "parcours_scores": {
    "avant": [
      {"label": "Présence digitale & contenus", "score": 7},
      {"label": "Communication pré-visite", "score": 6}
    ],
    "pendant": [
      {"label": "Activation sur site", "score": 7},
      {"label": "Captation & instagrammabilité", "score": 6},
      {"label": "Storytelling immersif", "score": 5}
    ],
    "apres": [
      {"label": "Continuité digitale", "score": 6},
      {"label": "Production & exploitation contenus", "score": 5},
      {"label": "Impact neuromarketing", "score": 4}
    ]
  },
  "analyse_comportementale": {
    "zones_chaudes": ["zone ou moment à fort potentiel de captation 1", "zone 2"],
    "zones_froides": ["zone sous-exploitée digitalement 1", "zone 2"],
    "comportements_positifs": ["comportement de partage ou d'engagement observé 1", "comportement 2"],
    "comportements_friction": ["friction digitale ou manque d'activation 1", "friction 2"]
  },
  "analyse_cognitive": {
    "surcharge": ["surcharge visuelle ou informationnelle observée 1", "point 2"],
    "doute": ["moment de décrochage attentionnel ou manque d'émotion 1", "moment 2"],
    "waouh": ["déclencheur émotionnel fort ou moment instagrammable 1", "moment 2"]
  },
  "synthese": [
    {"type": "critique", "texte": "action critique prioritaire activation", "poste": "poste concerné", "delai": "immédiat"},
    {"type": "critique", "texte": "action critique 2", "poste": "poste", "delai": "< 1 mois"},
    {"type": "quickwin", "texte": "quick win activation digitale", "poste": "poste", "delai": "1 semaine"},
    {"type": "quickwin", "texte": "quick win contenu", "poste": "poste", "delai": "2 semaines"},
    {"type": "optimisation", "texte": "optimisation storytelling moyen terme", "poste": "poste", "delai": "1-3 mois"},
    {"type": "long_terme", "texte": "stratégie neuromarketing long terme", "poste": "poste", "delai": "6-12 mois"}
  ],
  "score_neuroaccess": {
    "presence_digitale": 7,
    "activation_site": 6,
    "captation_partage": 7,
    "storytelling": 6,
    "continuite_post_visite": 5,
    "impact_neuromarketing": 4
  }
}

Remplace toutes les valeurs par celles issues de tes observations terrain. L'analyse_cognitive doit refléter les stimuli visuels et émotionnels observés — attention, émotion, mémorabilité, partage. Les observations neuro doivent enrichir les recommandations neuromarketing et identifier les données à croiser avec EDA/HRV. IMPORTANT : tous les scores sur 10 maximum. Sois précis, actionnable, orienté activation et impact émotionnel réel.`
}

export async function POST(req: NextRequest) {
  try {
    const { notes, scores_calcules, reponses_neuro, client_nom, client_id, mission_id, type_mission, type_diagnostic } = await req.json()
    console.log('BEN API reçu:', { client_nom, client_id, mission_id, type_mission, type_diagnostic })

    const notesTexte = Object.entries(notes)
      .map(([poste, note]) => `## ${poste}\n${note}`)
      .join('\n\n')

    // Formater les réponses neuro pour le prompt
    const reponsesNeuroTexte = reponses_neuro && Object.keys(reponses_neuro).length > 0
      ? Object.entries(reponses_neuro)
          .map(([poste, reponse]) => `### ${poste}\n${reponse}`)
          .join('\n\n')
      : ''

    // Sélectionner le prompt selon le type de mission
    let prompt: string
    if (type_mission === 'neurotaste') {
      prompt = buildPromptNeurotaste(notesTexte, client_nom || 'l\'établissement', reponsesNeuroTexte)
    } else if (type_mission === 'neuromedia') {
      prompt = buildPromptNeuromedia(notesTexte, client_nom || 'l\'établissement', reponsesNeuroTexte)
    } else {
      prompt = buildPromptNeuroaccess(notesTexte, client_nom || 'l\'établissement', reponsesNeuroTexte)
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const rapportData = JSON.parse(cleaned)

    // Sauvegarder en Supabase
    const shareToken = generateShareToken()
    const missionType = `${type_mission || 'neuroaccess'}-${type_diagnostic || 'cognitif'}`

    let finalMissionId = mission_id
    if (!finalMissionId && client_id) {
      const { data: newMission } = await supabase
        .from('missions')
        .insert({
          client_id: client_id,
          type: missionType,
          date_mission: new Date().toISOString().split('T')[0],
          statut: 'publie'
        })
        .select()
        .single()
      console.log('Nouvelle mission créée:', newMission, 'finalMissionId:', finalMissionId)
      if (newMission) finalMissionId = newMission.id
    }
    console.log('finalMissionId final:', finalMissionId)

    if (finalMissionId) {
      const rapportPayload = {
        mission_id: finalMissionId,
        executive_summary: rapportData.executive_summary,
        parcours_scores: rapportData.parcours_scores,
        analyse_cognitive: rapportData.analyse_cognitive,
        analyse_comportementale: rapportData.analyse_comportementale,
        synthese: rapportData.synthese,
        score_neuroplay: rapportData.score_neuroaccess,
        // Stocker les réponses neuro pour croisement futur avec données biométriques
        reponses_neuro: reponses_neuro || {},
        publie: true,
        share_token: shareToken,
        nom_rapport: `${type_mission || 'neuroaccess'}-${type_diagnostic || 'cognitif'}`,
      }

      const { data: existing } = await supabase
        .from('rapports')
        .select('id, share_token')
        .eq('mission_id', finalMissionId)
        .single()

      if (existing) {
        await supabase.from('rapports').update({
          ...rapportPayload,
          share_token: existing.share_token || shareToken
        }).eq('mission_id', finalMissionId)
      } else {
        await supabase.from('rapports').insert(rapportPayload)
      }

      await supabase.from('missions').update({ type: missionType }).eq('id', finalMissionId)
    }

    return NextResponse.json({ success: true, rapport: rapportData })
  } catch (error: any) {
    console.error('Erreur génération rapport:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
