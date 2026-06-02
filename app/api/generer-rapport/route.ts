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
function buildPromptNeuroaccess(notesTexte: string, clientNom: string): string {
  return `Tu es BEN™, outil d'analyse IA propriétaire de Neuroplay Xpériences, développé à partir de plus de 20 ans d'expertise terrain en expérience visiteur.
 
Tu viens de réaliser un diagnostic Neuroaccess pour ${clientNom}. Ce diagnostic analyse l'intégralité du parcours visiteur — avant, pendant et après la visite — selon une grille d'observation neuro-comportementale structurée.
 
Voici tes observations terrain, poste par poste :
 
${notesTexte}
 
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
 
Remplace toutes les valeurs par celles issues de tes observations terrain. Sois précis, actionnable, orienté expérience visiteur réelle.`
}
 
export async function POST(req: NextRequest) {
  try {
    const { notes, scores_calcules, client_nom, mission_id, type_mission, type_diagnostic } = await req.json()
 
    const notesTexte = Object.entries(notes)
      .map(([poste, note]) => `## ${poste}\n${note}`)
      .join('\n\n')
 
    // Sélectionner le prompt selon le type de mission
    let prompt: string
    if (type_mission === 'neuroaccess') {
      prompt = buildPromptNeuroaccess(notesTexte, client_nom || 'l\'établissement')
    } else {
      // Fallback générique pour les futures missions
      prompt = buildPromptNeuroaccess(notesTexte, client_nom || 'l\'établissement')
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
    if (mission_id) {
      const shareToken = generateShareToken()
      const rapportPayload = {
        mission_id,
        executive_summary: rapportData.executive_summary,
        parcours_scores: rapportData.parcours_scores,
        analyse_cognitive: rapportData.analyse_cognitive,
        analyse_comportementale: rapportData.analyse_comportementale,
        synthese: rapportData.synthese,
        score_neuroplay: rapportData.score_neuroaccess,
        statut: 'publie',
        share_token: shareToken,
        // Métadonnées de mission
        type_mission: type_mission || 'neuroaccess',
        type_diagnostic: type_diagnostic || 'cognitif',
      }
 
      const { data: existing } = await supabase
        .from('rapports')
        .select('id, share_token')
        .eq('mission_id', mission_id)
        .single()
 
      if (existing) {
        await supabase.from('rapports').update({
          ...rapportPayload,
          share_token: existing.share_token || shareToken
        }).eq('mission_id', mission_id)
      } else {
        await supabase.from('rapports').insert(rapportPayload)
      }
 
      // Mettre à jour le type de la mission
      await supabase.from('missions').update({
        type: `${type_mission || 'neuroaccess'}-${type_diagnostic || 'cognitif'}`
      }).eq('id', mission_id)
    }
 
    return NextResponse.json({ success: true, rapport: rapportData })
  } catch (error: any) {
    console.error('Erreur génération rapport:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
