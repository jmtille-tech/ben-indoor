'use client'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// ── PROTOCOLE NEUROACCESS ──
const protocoleNeuroaccess = [
  {
    phase: 'Avant la visite',
    postes: [
      {
        nom: 'Accessibilité',
        questions: [
          "Le site est-il accessible en transport en commun ? L'information est-elle disponible facilement ?",
          'Y a-t-il des aménagements PMR visibles et fonctionnels ?',
          "L'accès est-il indiqué depuis les axes principaux ?",
        ],
        neuro: "Combien d'étapes faut-il pour trouver comment venir ? C'est simple ou stressant ?",
        media: ['Note vocale', 'Photo signalétique routière']
      },
      {
        nom: 'Parking',
        questions: [
          'Le parking est-il facile à trouver et à comprendre ?',
          "La distance entre le parking et l'entrée est-elle clairement indiquée ?",
          "Y a-t-il des places PMR, familles, vélos, bornes électriques ?",
        ],
        neuro: "Combien de décisions à prendre depuis l'arrivée en voiture jusqu'à l'entrée ?",
        media: ['Note vocale', 'Photo entrée parking', 'Drone vue parking']
      },
      {
        nom: 'Signalétique externe',
        questions: [
          'La signalétique est-elle visible, lisible, cohérente depuis la voie publique ?',
          "Y a-t-il une continuité visuelle entre le parking et l'entrée du site ?",
        ],
        neuro: "Y a-t-il un élément visuel fort qui crée de l'excitation avant même d'entrer ?",
        media: ['Photo signalétique', 'Vidéo cheminement']
      },
      {
        nom: 'Digital site web et réservation',
        questions: [
          "Le site est-il lisible sur mobile ? L'achat de billet est-il fluide en moins de 3 minutes ?",
          'Les tarifs, horaires et infos pratiques sont-ils visibles sans chercher ?',
          "Y a-t-il des options de prévente, abonnements, offres famille mises en avant ?",
        ],
        neuro: "Nombre de clics pour acheter un billet ? Y a-t-il des étapes inutiles ou confuses ?",
        media: ['Note vocale parcours achat', 'Screenshot mobile']
      },
    ]
  },
  {
    phase: 'Pendant la visite',
    postes: [
      {
        nom: 'Accueil humain',
        questions: [
          "Le personnel d'accueil est-il identifiable, souriant, proactif ?",
          'Le temps de passage en caisse / contrôle est-il acceptable (< 2 min) ?',
          "Y a-t-il une information de bienvenue claire sur ce qu'il y a à faire/voir ?",
        ],
        neuro: "Y a-t-il un geste d'accueil mémorable ? Quelque chose qui surprend positivement ?",
        media: ["Note vocale 1ère impression", 'Vidéo zone accueil']
      },
      {
        nom: 'Fluidité du parcours',
        questions: [
          'Les zones sont-elles bien délimitées et compréhensibles sans carte ?',
          'Y a-t-il des zones de congestion ou des zones désertes ?',
          "Le visiteur est-il naturellement guidé vers les activités à fort intérêt ?",
        ],
        neuro: "Faut-il réfléchir pour savoir où aller ? Le parcours est-il intuitif ?",
        media: ['Drone flux global', 'Vidéo zones clés']
      },
      {
        nom: 'Compréhension offre et perception prix',
        questions: [
          'Les prix sont-ils affichés clairement aux points de vente ?',
          "Le visiteur comprend-il ce qui est inclus dans son billet vs en supplément ?",
          "Y a-t-il des opportunités de vente additionnelle bien intégrées ?",
        ],
        neuro: "Le visiteur doit-il calculer, comparer, choisir sous pression ?",
        media: ['Photo affichage prix', 'Note vocale perception']
      },
      {
        nom: 'Friction F&B',
        questions: [
          'Les points F&B sont-ils visibles et accessibles depuis les zones de forte fréquentation ?',
          "L'offre est-elle lisible ? Les menus sont-ils clairs et attractifs ?",
          "Le temps d'attente F&B est-il raisonnable ?",
          'La qualité perçue est-elle cohérente avec le prix affiché ?',
        ],
        neuro: "Y a-t-il un élément F&B mémorable, signature, qui renforce l'identité du lieu ?",
        media: ['Photo menus et implantation', 'Vidéo flux F&B']
      },
    ]
  },
  {
    phase: 'Après la visite',
    postes: [
      {
        nom: 'Sortie',
        questions: [
          'La sortie est-elle clairement indiquée ?',
          'Le visiteur repart-il avec une bonne dernière image ?',
          "Y a-t-il un message de remerciement / au revoir visible ?",
        ],
        neuro: "Y a-t-il un dernier geste fort qui clôt l'expérience de façon mémorable ?",
        media: ['Note vocale impression finale', 'Photo zone sortie']
      },
      {
        nom: 'Souvenir et boutique',
        questions: [
          "Y a-t-il une boutique ou un point souvenir bien placé avant la sortie ?",
          "L'offre souvenir est-elle en cohérence avec l'identité du lieu ?",
          "Y a-t-il une photo souvenir proposée ?",
        ],
        neuro: "Y a-t-il un produit souvenir vraiment original, qu'on ne trouve nulle part ailleurs ?",
        media: ['Photo boutique et offre', 'Note vocale']
      },
      {
        nom: 'Recontact et fidélisation',
        questions: [
          "Y a-t-il une invitation à revenir ? (abonnement, offre fidélité, prochain événement)",
          "Y a-t-il un dispositif de collecte d'avis sur place ?",
          'Le visiteur reçoit-il un email de suivi / enquête satisfaction ?',
          'Les réseaux sociaux sont-ils mis en avant ?',
        ],
        neuro: "Laisser un avis est-il simple et rapide ? Y a-t-il une raison évidente de revenir ?",
        media: ['Photo dispositifs fidélisation', 'Note vocale globale']
      },
    ]
  }
]

const allPostesNeuroaccess = protocoleNeuroaccess.flatMap(p =>
  p.postes.map(poste => ({ ...poste, phase: p.phase }))
)

type TypeDiagnostic = 'cognitif' | 'connecte'
type TypeMission = 'neuroaccess' | 'neurotaste' | 'neuromedia'
type Etape = 'choix-diagnostic' | 'choix-mission' | 'selection' | 'intro' | 'terrain' | 'generation' | 'fin'

const REPONSE_SCORES: Record<string, number> = { oui: 10, partiel: 5, non: 0 }

function calculerScorePoste(reponses: Record<string, string>): number {
  const vals = Object.values(reponses)
  if (vals.length === 0) return 5
  const total = vals.reduce((sum, r) => sum + (REPONSE_SCORES[r] ?? 5), 0)
  return Math.round(total / vals.length)
}

function sanitize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').substring(0, 50)
}

const S = {
  page: { minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif' } as React.CSSProperties,
  center: { minHeight: '100vh', background: '#0d1520', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Arial, sans-serif' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c8f135', marginBottom: '20px' },
  title: { color: '#c8f135', fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' as const },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center' as const, margin: '0 0 32px', lineHeight: 1.6, maxWidth: '320px' },
  btn: { background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', maxWidth: '360px' },
  btnGhost: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' },
  select: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' as const },
  label: { color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 8px' },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' },
}

const Avatar = () => (
  <div style={S.avatar}>
    <img src="/ben.jpg" alt="Ben" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
)

export default function Terrain() {
  // ── ÉTAT — démarre sur choix-diagnostic ──
  const [etape, setEtape] = useState<Etape>('choix-diagnostic')
  const [typeDiagnostic, setTypeDiagnostic] = useState<TypeDiagnostic | null>(null)
  const [typeMission, setTypeMission] = useState<TypeMission | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [missions, setMissions] = useState<any[]>([])
  const [posteIndex, setPosteIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noteActuelle, setNoteActuelle] = useState('')
  const [reponsesParPoste, setReponsesParPoste] = useState<Record<string, Record<string, string>>>({})
  const [reponsesActuelles, setReponsesActuelles] = useState<Record<string, string>>({})
  const [rapport, setRapport] = useState<any>(null)
  const [erreur, setErreur] = useState('')
  const [uploadingPoste, setUploadingPoste] = useState(false)
  const [uploadingDrone, setUploadingDrone] = useState(false)
  const [mediasParPoste, setMediasParPoste] = useState<Record<string, any[]>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const droneInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [enregistrement, setEnregistrement] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const allPostes = allPostesNeuroaccess
  const total = allPostes.length
  const poste = allPostes[posteIndex]
  const progression = Math.round((posteIndex / total) * 100)
  const selectedClient = clients.find(c => c.id === selectedClientId)

  useEffect(() => {
    supabase.from('clients').select('id, nom').eq('statut', 'actif').then(({ data }) => {
      if (data) setClients(data)
    })
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    supabase.from('missions').select('id, type, date_mission').eq('client_id', selectedClientId).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMissions(data)
    })
  }, [selectedClientId])

  function setReponse(questionIndex: number, valeur: string) {
    setReponsesActuelles(prev => ({ ...prev, [questionIndex]: valeur }))
  }

  async function handleUploadPoste(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !selectedClientId) return
    setUploadingPoste(true)
    const newMedias: any[] = []
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${selectedClientId}/${Date.now()}_${sanitize(poste.nom)}_${sanitize(file.name.replace(/\.[^.]+$/, ''))}.${ext}`
        const isVideo = file.type.startsWith('video/')
        const { error: uploadError } = await supabase.storage.from('medias').upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) continue
        const { data: urlData } = supabase.storage.from('medias').getPublicUrl(path)
        const { data: mediaData } = await supabase.from('medias').insert({ client_id: selectedClientId, mission_id: selectedMissionId || null, type: isVideo ? 'video' : 'photo', url: urlData.publicUrl, nom: file.name, poste: poste.nom }).select().single()
        if (mediaData) newMedias.push(mediaData)
      } catch {}
    }
    setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), ...newMedias] }))
    setUploadingPoste(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleUploadDrone(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !selectedClientId) return
    setUploadingDrone(true)
    const newMedias: any[] = []
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${selectedClientId}/${Date.now()}_drone_${sanitize(poste.nom)}_${sanitize(file.name.replace(/\.[^.]+$/, ''))}.${ext}`
        const { error: uploadError } = await supabase.storage.from('medias').upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) continue
        const { data: urlData } = supabase.storage.from('medias').getPublicUrl(path)
        const { data: mediaData } = await supabase.from('medias').insert({ client_id: selectedClientId, mission_id: selectedMissionId || null, type: 'drone', url: urlData.publicUrl, nom: file.name, poste: poste.nom }).select().single()
        if (mediaData) newMedias.push(mediaData)
      } catch {}
    }
    setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), ...newMedias] }))
    setUploadingDrone(false)
    if (droneInputRef.current) droneInputRef.current.value = ''
  }

  const toggleEnregistrement = async () => {
    if (enregistrement) { mediaRecorderRef.current?.stop(); setEnregistrement(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([blob], `vocal_${Date.now()}.${ext}`, { type: mimeType })
        setUploadingAudio(true)
        const path = `${selectedClientId}/${sanitize(poste.nom)}_vocal_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('medias').upload(path, file, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('medias').getPublicUrl(path)
          const { data: mediaData } = await supabase.from('medias').insert({ client_id: selectedClientId, mission_id: selectedMissionId || null, poste: poste.nom, type: 'audio', url: urlData.publicUrl, nom: file.name }).select().single()
          if (mediaData) setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), mediaData] }))
        }
        setUploadingAudio(false)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setEnregistrement(true)
    } catch { setErreur('Micro non accessible') }
  }

  function sauvegarderEtContinuer() {
    const nouvellesNotes = { ...notes }
    if (noteActuelle.trim()) { nouvellesNotes[poste.nom] = noteActuelle; setNotes(nouvellesNotes) }
    const nouvellesReponses = { ...reponsesParPoste, [poste.nom]: reponsesActuelles }
    setReponsesParPoste(nouvellesReponses)
    setNoteActuelle('')
    setReponsesActuelles({})
    if (posteIndex < total - 1) {
      const next = allPostes[posteIndex + 1]
      setReponsesActuelles(nouvellesReponses[next.nom] || {})
      setNoteActuelle(nouvellesNotes[next.nom] || '')
      setPosteIndex(posteIndex + 1)
    } else {
      genererRapport(nouvellesNotes, nouvellesReponses)
    }
  }

  function precedent() {
    if (posteIndex > 0) {
      const prev = allPostes[posteIndex - 1]
      setReponsesActuelles(reponsesParPoste[prev.nom] || {})
      setNoteActuelle(notes[prev.nom] || '')
      setPosteIndex(posteIndex - 1)
    }
  }

  async function genererRapport(notesFinales: Record<string, string>, reponsesFinales: Record<string, Record<string, string>>) {
    setEtape('generation')
    setErreur('')
    const scoresCalcules: Record<string, number> = {}
    for (const p of allPostes) { scoresCalcules[p.nom] = calculerScorePoste(reponsesFinales[p.nom] || {}) }
    const notesAvecScores: Record<string, string> = {}
    for (const p of allPostes) {
      const reponses = reponsesFinales[p.nom] || {}
      const lignes = p.questions.map((q, i) => `- ${q} → ${reponses[i] || 'non évalué'}`).join('\n')
      const note = notesFinales[p.nom] || ''
      notesAvecScores[p.nom] = `Score calculé: ${scoresCalcules[p.nom]}/10\n${lignes}${note ? '\nObservations: ' + note : ''}`
    }
    try {
      const res = await fetch('/api/generer-rapport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesAvecScores, scores_calcules: scoresCalcules, client_nom: selectedClient?.nom || 'Diagnostic terrain', mission_id: selectedMissionId || null, type_mission: typeMission, type_diagnostic: typeDiagnostic })
      })
      const data = await res.json()
      if (data.success) { setRapport(data.rapport); setEtape('fin') }
      else { setErreur(data.error || 'Erreur'); setEtape('fin') }
    } catch (e: any) { setErreur(e.message); setEtape('fin') }
  }

  function resetAll() {
    setEtape('choix-diagnostic')
    setTypeDiagnostic(null); setTypeMission(null)
    setPosteIndex(0); setNotes({}); setNoteActuelle(''); setRapport(null)
    setSelectedClientId(''); setSelectedMissionId(''); setMediasParPoste({})
    setReponsesParPoste({}); setReponsesActuelles({})
  }

  const scoreColor = (s: number) => s >= 7 ? '#c8f135' : s >= 5 ? '#EF9F27' : '#E24B4A'
  const mediasPosteActuel = mediasParPoste[poste?.nom] || []

  // ════════════════════════════════════════
  // ÉTAPE 1 — CHOIX DIAGNOSTIC
  // ════════════════════════════════════════
  if (etape === 'choix-diagnostic') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Type de diagnostic</h1>
      <p style={{ ...S.sub, marginBottom: '28px' }}>Choisis le type de diagnostic à réaliser</p>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => { setTypeDiagnostic('cognitif'); setEtape('choix-mission') }}
          style={{ background: 'rgba(200,241,53,0.05)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5C7 5 3 9 3 12s4 7 9 7 9-4 9-7-4-7-9-7z" stroke="#c8f135" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="#c8f135" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="1" fill="#c8f135"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#c8f135', fontSize: '15px', fontWeight: '700', margin: 0 }}>Diagnostic Cognitif</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>IA uniquement · Sans appareil</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Analyse comportementale terrain guidée par BEN&#x2122;. Génération automatique du rapport via IA.
          </p>
        </button>
        <button disabled style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'not-allowed', opacity: 0.5, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.06em' }}>BIENTÔT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h3l2-5 3 10 2-7 2 4 2-2h4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: '700', margin: 0 }}>Diagnostic Connecté</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>EDA / HRV · Données biométriques</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Croise les observations terrain avec les données physiologiques en temps réel.</p>
        </button>
      </div>
      <button onClick={() => window.location.href = '/dashboard'} style={{ ...S.btnGhost, maxWidth: '360px', width: '100%' }}>
        ← Dashboard
      </button>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 2 — CHOIX MISSION
  // ════════════════════════════════════════
  if (etape === 'choix-mission') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Quelle mission ?</h1>
      <p style={{ ...S.sub, marginBottom: '28px' }}>
        Diagnostic Cognitif · choisis ton offre
      </p>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => { setTypeMission('neuroaccess'); setEtape('selection') }}
          style={{ background: 'rgba(200,241,53,0.05)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="3" stroke="#c8f135" strokeWidth="1.5"/>
                <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="#c8f135" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#c8f135', fontSize: '15px', fontWeight: '700', margin: 0 }}>Neuroaccess</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{allPostesNeuroaccess.length} postes · Parcours visiteur</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Analyse complète du parcours visiteur — avant, pendant et après la visite.
          </p>
        </button>
        <button disabled style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'not-allowed', opacity: 0.5, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.06em' }}>BIENTÔT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <path d="M9 7v4c0 1.1.9 2 2 2h.5M10.5 13v4M14 7v2.5a1.5 1.5 0 0 0 3 0V7M15.5 11v6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: '700', margin: 0 }}>Neurotaste</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>Expérience F&B · Protocole en construction</p>
            </div>
          </div>
        </button>
        <button disabled style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'not-allowed', opacity: 0.5, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.06em' }}>BIENTÔT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <circle cx="12" cy="10" r="1.5" fill="rgba(255,255,255,0.3)"/>
                <path d="M8 4.5A7 7 0 0 1 19 10M16 15.5A7 7 0 0 1 5 10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeLinecap="round"/>
                <rect x="9" y="18" width="6" height="3" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3"/>
                <path d="M12 14v4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: '700', margin: 0 }}>Neuromedia</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>Captation média · Protocole en construction</p>
            </div>
          </div>
        </button>
      </div>
      <button onClick={() => setEtape('choix-diagnostic')} style={{ ...S.btnGhost, maxWidth: '360px', width: '100%' }}>
        ← Retour
      </button>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 3 — SÉLECTION CLIENT
  // ════════════════════════════════════════
  if (etape === 'selection') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Pour quel client ?</h1>
      <p style={{ ...S.sub, marginBottom: '28px' }}>
        Mission <strong style={{ color: '#c8f135' }}>Neuroaccess</strong> · Diagnostic Cognitif
      </p>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <p style={S.label}>Client</p>
        <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedMissionId('') }}
          style={{ ...S.select, marginBottom: '16px', color: selectedClientId ? '#fff' : 'rgba(255,255,255,0.3)' }}>
          <option value="">— Sélectionner un client</option>
          {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#1a2540' }}>{c.nom}</option>)}
        </select>

        <button onClick={() => selectedClientId && setEtape('intro')} disabled={!selectedClientId}
          style={{ ...S.btn, maxWidth: '100%', background: selectedClientId ? '#c8f135' : 'rgba(255,255,255,0.1)', color: selectedClientId ? '#0d1520' : 'rgba(255,255,255,0.3)', cursor: selectedClientId ? 'pointer' : 'not-allowed', marginBottom: '12px' }}>
          Continuer →
        </button>
        <button onClick={() => setEtape('choix-mission')} style={{ ...S.btnGhost, width: '100%' }}>
          ← Retour
        </button>
      </div>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 4 — INTRO
  // ════════════════════════════════════════
  if (etape === 'intro') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Bonjour, je suis Ben</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 4px', textAlign: 'center' }}>
        Mission <strong style={{ color: '#c8f135' }}>Neuroaccess</strong> · <strong style={{ color: '#fff' }}>{selectedClient?.nom}</strong>
      </p>
      <p style={S.sub}>
        Je vais te guider poste par poste. On a <strong style={{ color: '#fff' }}>{total} postes</strong> à couvrir. Pour chaque question, réponds par{' '}
        <strong style={{ color: '#c8f135' }}>Oui</strong>, <strong style={{ color: '#EF9F27' }}>Partiel</strong> ou <strong style={{ color: '#E24B4A' }}>Non</strong>.
      </p>
      <div style={{ width: '100%', maxWidth: '360px', marginBottom: '24px' }}>
        {protocoleNeuroaccess.map(p => (
          <div key={p.phase} style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{p.phase}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {p.postes.map(po => (
                <span key={po.nom} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(200,241,53,0.08)', border: '0.5px solid rgba(200,241,53,0.2)', color: 'rgba(255,255,255,0.6)' }}>{po.nom}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setEtape('terrain')} style={{ ...S.btn, maxWidth: '100%' }}>
        Commencer le diagnostic →
      </button>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 5 — GÉNÉRATION
  // ════════════════════════════════════════
  if (etape === 'generation') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Ben analyse tes observations...</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', margin: '0 0 32px' }}>Génération du rapport Neuroaccess — 20 à 30 secondes</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c8f135', animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.2); } }`}</style>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 6 — FIN
  // ════════════════════════════════════════
  if (etape === 'fin') return (
    <main style={{ ...S.page, padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c8f135', marginBottom: '16px' }}>
          <img src="/ben.jpg" alt="Ben" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ color: '#c8f135', fontSize: '20px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
          {rapport ? 'Rapport Neuroaccess généré !' : 'Diagnostic terminé'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
          {rapport ? `Ben a analysé le parcours visiteur de ${selectedClient?.nom}` : erreur}
        </p>
      </div>
      {rapport && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ ...S.card, textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '48px', fontWeight: '700', color: '#c8f135', margin: '0 0 4px', lineHeight: 1 }}>{rapport.executive_summary?.score_global}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score global / 10</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={S.card}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Frictions</p>
              {(rapport.executive_summary?.frictions || []).map((f: string, i: number) => (
                <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '8px', borderLeft: '2px solid #E24B4A', lineHeight: 1.4 }}>{f}</p>
              ))}
            </div>
            <div style={S.card}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Opportunités</p>
              {(rapport.executive_summary?.opportunites || []).map((o: string, i: number) => (
                <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '8px', borderLeft: '2px solid #c8f135', lineHeight: 1.4 }}>{o}</p>
              ))}
            </div>
          </div>
          <div style={{ ...S.card, marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Score Neuroaccess</p>
            {Object.entries(rapport.score_neuroaccess || rapport.score_neuroplay || {}).map(([key, val]: any) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize', minWidth: '160px' }}>{key.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                  <div style={{ width: `${val * 10}%`, height: '4px', background: scoreColor(val), borderRadius: '2px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500', color: scoreColor(val), minWidth: '24px' }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={resetAll} style={{ flex: 1, ...S.btnGhost }}>Nouveau diagnostic</button>
            <button onClick={() => window.location.href = '/dashboard'} style={{ flex: 2, background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Dashboard →</button>
          </div>
        </div>
      )}
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE TERRAIN
  // ════════════════════════════════════════
  return (
    <main style={S.page}>
      <div style={{ background: '#111d30', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #c8f135', flexShrink: 0 }}>
          <img src="/ben.jpg" alt="Ben" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#c8f135', fontSize: '13px', fontWeight: '700', margin: 0 }}>Ben · Neuroaccess · {selectedClient?.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{poste.phase}</p>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{posteIndex + 1}/{total}</span>
        <button onClick={() => { if (window.confirm('Quitter ? Tes notes seront perdues.')) window.location.href = '/dashboard' }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '3px', width: `${progression}%`, background: '#c8f135', transition: 'width 0.3s' }} />
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Poste {posteIndex + 1}</p>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>{poste.nom}</h2>
        </div>
        <div style={{ ...S.card, marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Observer & évaluer</p>
          {poste.questions.map((q, i) => {
            const rep = reponsesActuelles[i]
            return (
              <div key={i} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: i < poste.questions.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 10px', lineHeight: 1.6 }}>{q}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['oui', 'partiel', 'non'] as const).map(val => {
                    const colors = {
                      oui:     { bg: rep === 'oui'     ? 'rgba(200,241,53,0.2)'  : 'transparent', border: rep === 'oui'     ? '#c8f135' : 'rgba(255,255,255,0.12)', text: rep === 'oui'     ? '#c8f135' : 'rgba(255,255,255,0.4)' },
                      partiel: { bg: rep === 'partiel' ? 'rgba(239,159,39,0.2)'  : 'transparent', border: rep === 'partiel' ? '#EF9F27' : 'rgba(255,255,255,0.12)', text: rep === 'partiel' ? '#EF9F27' : 'rgba(255,255,255,0.4)' },
                      non:     { bg: rep === 'non'     ? 'rgba(226,75,74,0.2)'   : 'transparent', border: rep === 'non'     ? '#E24B4A' : 'rgba(255,255,255,0.12)', text: rep === 'non'     ? '#E24B4A' : 'rgba(255,255,255,0.4)' },
                    }
                    const c = colors[val]
                    return (
                      <button key={val} onClick={() => setReponse(i, val)}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: '13px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                        {val === 'oui' ? '✓ Oui' : val === 'partiel' ? '~ Partiel' : '✗ Non'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {Object.keys(reponsesActuelles).length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score poste</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: scoreColor(calculerScorePoste(reponsesActuelles)) }}>{calculerScorePoste(reponsesActuelles)}/10</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>({Object.keys(reponsesActuelles).length}/{poste.questions.length} réponses)</span>
            </div>
          )}
        </div>
        <div style={{ background: 'rgba(200,241,53,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '0.5px solid rgba(200,241,53,0.15)' }}>
          <p style={{ fontSize: '11px', color: '#c8f135', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Question neuro</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{poste.neuro}</p>
        </div>
        <div style={{ background: 'rgba(55,138,221,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '0.5px solid rgba(55,138,221,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mediasPosteActuel.length > 0 ? '12px' : '0' }}>
            <p style={{ fontSize: '11px', color: 'rgba(55,138,221,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Médias {mediasPosteActuel.length > 0 && <span style={{ marginLeft: '8px', background: 'rgba(55,138,221,0.2)', borderRadius: '10px', padding: '1px 7px', fontSize: '10px' }}>{mediasPosteActuel.length}</span>}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleUploadPoste} style={{ display: 'none' }} />
              <input ref={droneInputRef} type="file" accept="image/*,video/*" multiple onChange={handleUploadDrone} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPoste}
                style={{ background: 'rgba(55,138,221,0.15)', border: '1px solid rgba(55,138,221,0.3)', borderRadius: '8px', color: 'rgba(55,138,221,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: uploadingPoste ? 'wait' : 'pointer', opacity: uploadingPoste ? 0.6 : 1 }}>
                {uploadingPoste ? 'Upload...' : '+ Photo / Vidéo'}
              </button>
              <button onClick={toggleEnregistrement} disabled={uploadingAudio}
                style={{ background: enregistrement ? 'rgba(255,59,48,0.2)' : 'rgba(255,149,0,0.15)', border: enregistrement ? '1px solid rgba(255,59,48,0.5)' : '1px solid rgba(255,149,0,0.3)', borderRadius: '8px', color: enregistrement ? 'rgb(255,59,48)' : 'rgba(255,149,0,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: 'pointer' }}>
                {uploadingAudio ? 'Envoi...' : enregistrement ? 'Stop' : 'Vocal'}
              </button>
              <button onClick={() => droneInputRef.current?.click()} disabled={uploadingDrone}
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'rgba(139,92,246,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: uploadingDrone ? 'wait' : 'pointer', opacity: uploadingDrone ? 0.6 : 1 }}>
                {uploadingDrone ? 'Upload...' : 'Drone'}
              </button>
            </div>
          </div>
          {mediasPosteActuel.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {mediasPosteActuel.map(m => (
                <div key={m.id} style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${m.type === 'drone' ? 'rgba(139,92,246,0.4)' : 'rgba(55,138,221,0.3)'}` }}>
                  {m.type === 'audio'
                    ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,149,0,0.1)', fontSize: '24px' }}>🎙</div>
                    : <img src={m.url} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  }
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Observations complémentaires</p>
          <textarea value={noteActuelle} onChange={e => setNoteActuelle(e.target.value)} placeholder="Note tes observations ici..." rows={3}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', resize: 'none', fontFamily: 'Arial', boxSizing: 'border-box', lineHeight: 1.6 }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {posteIndex > 0 && (
            <button onClick={precedent} style={{ flex: 1, ...S.btnGhost }}>&#x2190; Précédent</button>
          )}
          <button onClick={sauvegarderEtContinuer} style={{ flex: 2, background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            {posteIndex < total - 1 ? 'Suivant →' : 'Générer le rapport ✓'}
          </button>
        </div>
      </div>
    </main>
  )
}
