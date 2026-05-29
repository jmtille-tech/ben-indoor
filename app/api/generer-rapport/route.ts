import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function generateShareToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { notes, entretiens, client_nom, mission_id } = await req.json()

    const notesTexte = Object.entries(notes)
      .map(([poste, note]) => `## ${poste}\n${note}`)
      .join('\n\n')

    const entretiensTexte = entretiens && entretiens.length > 0
      ? '\n\n## Micro-entretiens visiteurs\n' + entretiens.map((e: any, i: number) =>
          `### Entretien ${i + 1} (${e.moment})\n- Moment préféré : ${e.q1}\n- Moment frustrant : ${e.q2}\n- Ce qu'ils retiendraient : ${e.q3}`
        ).join('\n\n')
      : ''

    const prompt = `Tu es Ben, expert en expérience visiteur et analyse comportementale pour Neuroplay Xpériences.
Tu as effectué un diagnostic terrain dans un espace de loisirs INDOOR et voici tes observations :

${notesTexte}${entretiensTexte}

Sur la base de ces observations comportementales et cognitives, génère un rapport structuré au format JSON strict.
IMPORTANT : réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks. Commence par { et termine par }.

{
  "executive_summary": {
    "score_global": 7,
    "type_site": "Parc indoor / Trampoline park / Laser game / etc.",
    "frictions": ["friction comportementale 1", "friction 2", "friction 3"],
    "opportunites": ["opportunité immédiate 1", "opportunité 2", "opportunité 3"],
    "insight": "insight stratégique clé sur l'expérience visiteur indoor"
  },
  "parcours_scores": {
    "avant": [
      {"label": "Accessibilité & parking", "score": 7},
      {"label": "Accueil & entrée", "score": 6},
      {"label": "Compréhension offre & tarifs", "score": 5}
    ],
    "pendant": [
      {"label": "Orientation & flux", "score": 7},
      {"label": "Charge cognitive par zone", "score": 6},
      {"label": "Engagement par activité", "score": 7},
      {"label": "F&B indoor", "score": 5}
    ],
    "apres": [
      {"label": "Sortie & dernière impression", "score": 6},
      {"label": "Fidélisation & recontact", "score": 4}
    ]
  },
  "analyse_comportementale": {
    "zones_chaudes": ["zone très fréquentée 1", "zone 2"],
    "zones_froides": ["zone sous-exploitée 1", "zone 2"],
    "comportements_positifs": ["comportement observé positif 1", "2"],
    "comportements_friction": ["comportement de friction 1", "2"]
  },
  "analyse_cognitive": {
    "surcharge": ["point de surcharge cognitive 1", "2", "3"],
    "doute": ["moment d'hésitation observé 1", "2"],
    "waouh": ["moment d'engagement fort 1", "2"]
  },
  "entretiens_syntese": {
    "satisfactions": ["ce qui revient positivement dans les entretiens"],
    "frustrations": ["ce qui revient négativement"],
    "memorabilite": "ce que les visiteurs retiennent le plus"
  },
  "synthese": [
    {"type": "critique", "texte": "action critique 1", "poste": "poste concerné", "delai": "immédiat"},
    {"type": "critique", "texte": "action critique 2", "poste": "poste", "delai": "< 1 mois"},
    {"type": "quickwin", "texte": "quick win facilement actionnable", "poste": "poste", "delai": "1 semaine"},
    {"type": "quickwin", "texte": "quick win 2", "poste": "poste", "delai": "2 semaines"},
    {"type": "optimisation", "texte": "optimisation moyen terme", "poste": "poste", "delai": "1-3 mois"},
    {"type": "long_terme", "texte": "évolution structurelle", "poste": "poste", "delai": "6-12 mois"}
  ],
  "score_indoor": {
    "accessibilite": 7,
    "fluidite_spatiale": 6,
    "clarte_cognitive": 7,
    "engagement_activites": 6,
    "performance_commerciale": 5
  }
}

Remplace toutes les valeurs par celles issues de tes observations. Sois précis, actionnable, orienté terrain indoor.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const rapportData = JSON.parse(cleaned)

    if (mission_id) {
      const { data: existing } = await supabase.from('rapports').select('id, share_token').eq('mission_id', mission_id).single()
      if (existing) {
        const share_token = existing.share_token || generateShareToken()
        await supabase.from('rapports').update({
          executive_summary: rapportData.executive_summary,
          parcours_scores: rapportData.parcours_scores,
          analyse_cognitive: rapportData.analyse_cognitive,
          analyse_comportementale: rapportData.analyse_comportementale,
          entretiens_synthese: rapportData.entretiens_syntese,
          synthese: rapportData.synthese,
          score_neuroplay: rapportData.score_indoor,
          statut: 'publie',
          share_token
        }).eq('mission_id', mission_id)
      } else {
        await supabase.from('rapports').insert({
          mission_id,
          executive_summary: rapportData.executive_summary,
          parcours_scores: rapportData.parcours_scores,
          analyse_cognitive: rapportData.analyse_cognitive,
          analyse_comportementale: rapportData.analyse_comportementale,
          entretiens_synthese: rapportData.entretiens_syntese,
          synthese: rapportData.synthese,
          score_neuroplay: rapportData.score_indoor,
          statut: 'publie',
          share_token: generateShareToken()
        })
      }
    }

    return NextResponse.json({ success: true, rapport: rapportData })
  } catch (error: any) {
    console.error('Erreur génération rapport:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
