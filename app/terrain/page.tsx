'use client'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const protocole = [
  {
    phase: 'Avant la visite',
    postes: [
      {
        nom: 'Accessibilité & parking',
        questions: [
          "Le site est-il facilement localisable depuis les axes principaux ? La signalétique externe est-elle visible et claire ?",
          "Le parking est-il facile d'accès, bien indiqué, suffisant ? Distance entrée/parking acceptable ?",
          "Y a-t-il des aménagements PMR, places familles, stationnement vélos/trottinettes ?",
          "Le cheminement depuis le parking jusqu'à l'entrée est-il balisé et intuitif ?"
        ],
        cognitif: "Combien de décisions faut-il prendre depuis l'arrivée jusqu'à l'entrée ? C'est stressant ou fluide ?",
        media: ['Photo signalétique externe', 'Photo parking & cheminement', 'Note vocale accessibilité']
      },
      {
        nom: 'Accueil & entrée',
        questions: [
          "L'entrée est-elle identifiable immédiatement depuis l'extérieur ?",
          "Le personnel d'accueil est-il visible, identifiable, souriant, proactif ?",
          "Le temps de passage en caisse / contrôle est-il acceptable (< 2 min) ?",
          "Y a-t-il une information de bienvenue claire sur les activités disponibles ?"
        ],
        cognitif: "Y a-t-il un geste d'accueil mémorable ? Le visiteur sait-il immédiatement où aller après l'entrée ?",
        media: ['Photo zone entrée & accueil', 'Note vocale première impression', 'Vidéo flux entrée']
      },
      {
        nom: 'Compréhension offre & tarifs',
        questions: [
          "Les activités proposées sont-elles listées et décrites clairement à l'entrée ?",
          "Les tarifs sont-ils affichés de façon lisible et compréhensible sans effort ?",
          "Le visiteur comprend-il ce qui est inclus dans son billet vs en supplément ?",
          "Y a-t-il des offres groupées / familles / anniversaire bien mises en avant ?"
        ],
        cognitif: "Le visiteur doit-il calculer, comparer, choisir sous pression ? Charge mentale à l'achat ?",
        media: ['Photo affichage tarifs', 'Photo menu des activités', 'Note vocale perception prix']
      }
    ]
  },
  {
    phase: 'Pendant la visite',
    postes: [
      {
        nom: 'Orientation & flux',
        questions: [
          "Les zones d'activité sont-elles bien délimitées et identifiables sans carte ?",
          "Y a-t-il des zones de congestion ou au contraire des zones complètement désertes ?",
          "Le visiteur est-il naturellement guidé vers les activités principales ?",
          "Les toilettes, vestiaires, consignes sont-ils facilement trouvables ?"
        ],
        cognitif: "Faut-il réfléchir pour savoir où aller ? Le parcours de circulation est-il intuitif ou confus ?",
        media: ['Photo plan / signalétique interne', 'Vidéo flux global', 'Note vocale orientation']
      },
      {
        nom: 'Charge cognitive par zone',
        questions: [
          "La signalétique dans chaque zone est-elle lisible et non-saturante ?",
          "Les règles d'accès aux activités (âge, taille, équipement) sont-elles clairement affichées ?",
          "Y a-t-il trop d'informations à traiter simultanément dans certaines zones ?",
          "Les transitions entre zones sont-elles fluides ou génèrent-elles de la confusion ?"
        ],
        cognitif: "Dans quelle zone la surcharge d'informations est-elle la plus forte ? Où le visiteur hésite-t-il le plus ?",
        media: ['Photo signalétique zones', 'Note vocale charge cognitive', 'Photo affichage règles']
      },
      {
        nom: 'Engagement par activité',
        questions: [
          "Quelles activités sont saturées ? Lesquelles sont sous-fréquentées ?",
          "Le comportement d'entrée dans les activités est-il spontané, guidé ou hésitant ?",
          "Le temps d'engagement estimé par activité est-il conforme au potentiel de l'activité ?",
          "Y a-t-il des activités que les visiteurs ne trouvent pas ou ne comprennent pas ?"
        ],
        cognitif: "Quelle activité génère le plus d'enthousiasme visible ? Laquelle génère de la frustration ou de l'abandon ?",
        media: ['Photo activités saturées vs désertes', 'Vidéo comportements visiteurs', 'Note vocale engagement']
      },
      {
        nom: 'F&B indoor',
        questions: [
          "Le point F&B est-il visible et accessible depuis les zones de forte fréquentation ?",
          "L'offre est-elle lisible ? Les menus sont-ils clairs, attractifs, adaptés au contexte indoor ?",
          "Le temps d'attente F&B est-il raisonnable ? Le flux est-il bien géré ?",
          "La qualité perçue est-elle cohérente avec le prix affiché ?"
        ],
        cognitif: "Y a-t-il un élément F&B mémorable ou signature qui renforce l'identité du lieu ?",
        media: ['Photo implantation F&B', 'Photo menu & affichage', 'Note vocale perception F&B']
      }
    ]
  },
  {
    phase: 'Après la visite',
    postes: [
      {
        nom: 'Sortie & dernière impression',
        questions: [
          "La sortie est-elle clairement indiquée et bien positionnée ?",
          "Le visiteur repart-il avec une bonne dernière image du lieu ?",
          "Y a-t-il un message de remerciement / au revoir visible à la sortie ?",
          "La boutique ou les souvenirs sont-ils positionnés stratégiquement avant la sortie ?"
        ],
        cognitif: "Y a-t-il un dernier geste fort qui clôt l'expérience de façon mémorable ?",
        media: ['Photo zone sortie', 'Note vocale impression finale', 'Photo boutique / souvenirs']
      },
      {
        nom: 'Fidélisation & recontact',
        questions: [
          "Y a-t-il une invitation à revenir visible ? (abonnement, offre fidélité, prochain événement)",
          "Y a-t-il un dispositif de collecte d'avis sur place (QR code, tablette, carte) ?",
          "Les réseaux sociaux sont-ils mis en avant ? Y a-t-il un hashtag ou un spot photo ?",
          "Le visiteur reçoit-il ou peut-il repartir avec quelque chose (bon de réduction, flyer, souvenir) ?"
        ],
        cognitif: "Laisser un avis est-il simple et rapide ? Y a-t-il une raison évidente et immédiate de revenir ?",
        media: ['Photo dispositifs fidélisation', 'Photo spot photo / réseaux sociaux', 'Note vocale globale']
      }
    ]
  }
]

const allPostes = protocole.flatMap(p => p.postes.map(poste => ({ ...poste, phase: p.phase })))

function sanitize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').substring(0, 50)
}

interface Entretien {
  id: string
  moment: string
  q1: string
  q2: string
  q3: string
}

export default function Terrain() {
  const [etape, setEtape] = useState<'selection' | 'intro' | 'terrain' | 'entretien' | 'generation' | 'fin'>('selection')
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedMissionId, setSelectedMissionId] = useState<string>('')
  const [missions, setMissions] = useState<any[]>([])
  const [posteIndex, setPosteIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noteActuelle, setNoteActuelle] = useState('')
  const [entretiens, setEntretiens] = useState<Entretien[]>([])
  const [entretienEnCours, setEntretienEnCours] = useState<Partial<Entretien>>({})
  const [rapport, setRapport] = useState<any>(null)
  const [erreur, setErreur] = useState('')
  const [uploadingPoste, setUploadingPoste] = useState(false)
  const [uploadingDrone, setUploadingDrone] = useState(false)
  const [mediasParPoste, setMediasParPoste] = useState<Record<string, any[]>>({})
  const [showEntretienForm, setShowEntretienForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const droneInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [enregistrement, setEnregistrement] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  useEffect(() => {
    supabase.from('clients').select('id, nom').eq('statut', 'actif').then(({ data }) => { if (data) setClients(data) })
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    supabase.from('missions').select('id, type, date_mission').eq('client_id', selectedClientId).order('created_at', { ascending: false }).then(({ data }) => { if (data) setMissions(data) })
  }, [selectedClientId])

  const poste = allPostes[posteIndex]
  const total = allPostes.length
  const progression = Math.round((posteIndex / total) * 100)
  const selectedClient = clients.find(c => c.id === selectedClientId)

  async function handleUploadMedia(e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'drone') {
    const files = e.target.files
    if (!files || !selectedClientId) return
    type === 'photo' ? setUploadingPoste(true) : setUploadingDrone(true)
    const newMedias: any[] = []
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const safePoste = sanitize(poste.nom)
        const safeFile = sanitize(file.name.replace(/\.[^.]+$/, ''))
        const prefix = type === 'drone' ? 'drone' : 'media'
        const path = `${selectedClientId}/${Date.now()}_${prefix}_${safePoste}_${safeFile}.${ext}`
        const isVideo = file.type.startsWith('video/')
        const { error: uploadError } = await supabase.storage.from('medias').upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) continue
        const { data: urlData } = supabase.storage.from('medias').getPublicUrl(path)
        const { data: mediaData } = await supabase.from('medias').insert({
          client_id: selectedClientId,
          mission_id: selectedMissionId || null,
          type: type === 'drone' ? 'drone' : (isVideo ? 'video' : 'photo'),
          url: urlData.publicUrl,
          nom: file.name,
          poste: poste.nom,
        }).select().single()
        if (mediaData) newMedias.push(mediaData)
      } catch { }
    }
    setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), ...newMedias] }))
    type === 'photo' ? setUploadingPoste(false) : setUploadingDrone(false)
    if (type === 'photo' && fileInputRef.current) fileInputRef.current.value = ''
    if (type === 'drone' && droneInputRef.current) droneInputRef.current.value = ''
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
          const { data: mediaData } = await supabase.from('medias').insert({
            client_id: selectedClientId, mission_id: selectedMissionId || null,
            poste: poste.nom, type: 'audio', url: urlData.publicUrl, nom: file.name
          }).select().single()
          if (mediaData) setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), mediaData] }))
        }
        setUploadingAudio(false)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setEnregistrement(true)
    } catch { setErreur('Micro non accessible') }
  }

  function ajouterEntretien() {
    if (!entretienEnCours.q1 && !entretienEnCours.q2 && !entretienEnCours.q3) return
    const nouvelEntretien: Entretien = {
      id: Date.now().toString(),
      moment: entretienEnCours.moment || 'En cours de visite',
      q1: entretienEnCours.q1 || '—',
      q2: entretienEnCours.q2 || '—',
      q3: entretienEnCours.q3 || '—'
    }
    setEntretiens(prev => [...prev, nouvelEntretien])
    setEntretienEnCours({})
    setShowEntretienForm(false)
  }

  function sauvegarderEtContinuer() {
    const nouvellesNotes = { ...notes }
    if (noteActuelle.trim()) { nouvellesNotes[poste.nom] = noteActuelle; setNotes(nouvellesNotes) }
    setNoteActuelle('')
    if (posteIndex < total - 1) {
      setPosteIndex(posteIndex + 1)
    } else {
      genererRapport(nouvellesNotes)
    }
  }

  function precedent() {
    if (posteIndex > 0) { setNoteActuelle(notes[allPostes[posteIndex - 1].nom] || ''); setPosteIndex(posteIndex - 1) }
  }

  async function genererRapport(notesFinales: Record<string, string>) {
    setEtape('generation')
    setErreur('')
    try {
      const res = await fetch('/api/generer-rapport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesFinales, entretiens, client_nom: selectedClient?.nom || 'Diagnostic indoor', mission_id: selectedMissionId || null })
      })
      const data = await res.json()
      if (data.success) { setRapport(data.rapport); setEtape('fin') }
      else { setErreur(data.error || 'Erreur lors de la génération'); setEtape('fin') }
    } catch (e: any) { setErreur(e.message); setEtape('fin') }
  }

  const scoreColor = (s: number) => s >= 7 ? '#c8f135' : s >= 5 ? '#EF9F27' : '#E24B4A'
  const mediasPosteActuel = mediasParPoste[poste?.nom] || []

  // ── SÉLECTION CLIENT ──
  if (etape === 'selection') return (
    <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏟️</div>
      <h1 style={{ color: '#c8f135', fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>Pour quel client ?</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', margin: '0 0 32px' }}>Sélectionne le client avant de démarrer le diagnostic indoor</p>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Client</p>
        <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedMissionId('') }}
          style={{ width: '100%', padding: '12px 16px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: selectedClientId ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}>
          <option value="">— Sélectionner un client</option>
          {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#1a2540' }}>{c.nom}</option>)}
        </select>
        {selectedClientId && (
          <>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Mission (optionnel)</p>
            <select value={selectedMissionId} onChange={e => setSelectedMissionId(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: selectedMissionId ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}>
              <option value="">— Sans mission spécifique</option>
              {missions.map(m => <option key={m.id} value={m.id} style={{ background: '#1a2540' }}>{m.type} · {m.date_mission}</option>)}
            </select>
          </>
        )}
        <button onClick={() => selectedClientId && setEtape('intro')} disabled={!selectedClientId}
          style={{ width: '100%', background: selectedClientId ? '#c8f135' : 'rgba(255,255,255,0.1)', color: selectedClientId ? '#0d1520' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: selectedClientId ? 'pointer' : 'not-allowed' }}>
          Continuer →
        </button>
      </div>
    </main>
  )

  if (etape === 'intro') return (
    <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏟️</div>
      <h1 style={{ color: '#c8f135', fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>Diagnostic Indoor</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 4px', textAlign: 'center' }}>Pour <strong style={{ color: '#fff' }}>{selectedClient?.nom}</strong></p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textAlign: 'center', margin: '0 0 8px', lineHeight: 1.6, maxWidth: '340px' }}>
        <strong style={{ color: '#fff' }}>{total} postes</strong> à couvrir — observation comportementale et cognitive, sans équipement neuro.
      </p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', margin: '0 0 32px', maxWidth: '340px' }}>
        Tu peux ajouter des micro-entretiens visiteurs à tout moment pendant la visite.
      </p>
      <div style={{ width: '100%', maxWidth: '360px', marginBottom: '24px' }}>
        {protocole.map(p => (
          <div key={p.phase} style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{p.phase}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {p.postes.map(po => <span key={po.nom} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(200,241,53,0.08)', border: '0.5px solid rgba(200,241,53,0.2)', color: 'rgba(255,255,255,0.6)' }}>{po.nom}</span>)}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setEtape('terrain')} style={{ background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', maxWidth: '360px' }}>
        Commencer le diagnostic →
      </button>
    </main>
  )

  if (etape === 'generation') return (
    <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
      <h1 style={{ color: '#c8f135', fontSize: '20px', fontWeight: '700', margin: '0 0 12px', textAlign: 'center' }}>Analyse en cours...</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', margin: '0 0 8px' }}>Génération du rapport comportemental — 20 à 30 secondes</p>
      {entretiens.length > 0 && <p style={{ color: 'rgba(200,241,53,0.6)', fontSize: '13px', textAlign: 'center', margin: '0 0 32px' }}>{entretiens.length} micro-entretien{entretiens.length > 1 ? 's' : ''} intégré{entretiens.length > 1 ? 's' : ''}</p>}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c8f135', animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate` }} />)}
      </div>
      <style>{`@keyframes pulse { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.2); } }`}</style>
    </main>
  )

  if (etape === 'fin') return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏟️</div>
        <h1 style={{ color: '#c8f135', fontSize: '20px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>{rapport ? 'Rapport généré !' : 'Diagnostic terminé'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', margin: 0 }}>{rapport ? `Analyse comportementale complète pour ${selectedClient?.nom}` : erreur}</p>
      </div>
      {rapport && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '12px' }}>
            <p style={{ fontSize: '48px', fontWeight: '700', color: '#c8f135', margin: '0 0 4px', lineHeight: 1 }}>{rapport.executive_summary?.score_global}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score global / 10</p>
            {rapport.executive_summary?.type_site && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{rapport.executive_summary.type_site}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Frictions</p>
              {(rapport.executive_summary?.frictions || []).map((f: string, i: number) => <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '8px', borderLeft: '2px solid #E24B4A', lineHeight: 1.4 }}>{f}</p>)}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Opportunités</p>
              {(rapport.executive_summary?.opportunites || []).map((o: string, i: number) => <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '8px', borderLeft: '2px solid #c8f135', lineHeight: 1.4 }}>{o}</p>)}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Score Indoor</p>
            {Object.entries(rapport.score_indoor || {}).map(([key, val]: any) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize', minWidth: '160px' }}>{key.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}><div style={{ width: `${val * 10}%`, height: '4px', background: scoreColor(val), borderRadius: '2px' }} /></div>
                <span style={{ fontSize: '12px', fontWeight: '500', color: scoreColor(val), minWidth: '24px' }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setEtape('selection'); setPosteIndex(0); setNotes({}); setNoteActuelle(''); setRapport(null); setSelectedClientId(''); setSelectedMissionId(''); setMediasParPoste({}); setEntretiens([]) }}
              style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' }}>
              Nouveau diagnostic
            </button>
            <button onClick={() => window.location.href = '/dashboard'}
              style={{ flex: 2, background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Dashboard →
            </button>
          </div>
        </div>
      )}
    </main>
  )

  // ── TERRAIN PRINCIPAL ──
  return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#111d30', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🏟️</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#c8f135', fontSize: '13px', fontWeight: '700', margin: 0 }}>Ben Indoor · {selectedClient?.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{poste.phase}</p>
        </div>
        {entretiens.length > 0 && <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.3)', color: '#c8f135' }}>💬 {entretiens.length}</span>}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{posteIndex + 1}/{total}</span>
        <button onClick={() => { if (window.confirm('Quitter ? Les notes seront perdues.')) window.location.href = '/dashboard' }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '3px', width: `${progression}%`, background: '#c8f135', transition: 'width 0.3s' }} />
      </div>

      <div style={{ padding: '20px' }}>
        {/* Poste title */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Poste {posteIndex + 1}</p>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>{poste.nom}</h2>
        </div>

        {/* Questions d'observation */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Observer & évaluer</p>
          {poste.questions.map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8f135', flexShrink: 0, marginTop: '6px' }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{q}</p>
            </div>
          ))}
        </div>

        {/* Question cognitive */}
        <div style={{ background: 'rgba(200,241,53,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '0.5px solid rgba(200,241,53,0.15)' }}>
          <p style={{ fontSize: '11px', color: '#c8f135', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>🧠 Lecture cognitive</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{poste.cognitif}</p>
        </div>

        {/* Médias */}
        <div style={{ background: 'rgba(55,138,221,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '0.5px solid rgba(55,138,221,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mediasPosteActuel.length > 0 ? '12px' : '0' }}>
            <p style={{ fontSize: '11px', color: 'rgba(55,138,221,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              📸 Médias {mediasPosteActuel.length > 0 && <span style={{ marginLeft: '8px', background: 'rgba(55,138,221,0.2)', borderRadius: '10px', padding: '1px 7px', fontSize: '10px' }}>{mediasPosteActuel.length}</span>}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={e => handleUploadMedia(e, 'photo')} style={{ display: 'none' }} />
              <input ref={droneInputRef} type="file" accept="image/*,video/*" multiple onChange={e => handleUploadMedia(e, 'drone')} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPoste}
                style={{ background: 'rgba(55,138,221,0.15)', border: '1px solid rgba(55,138,221,0.3)', borderRadius: '8px', color: 'rgba(55,138,221,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: uploadingPoste ? 'wait' : 'pointer', opacity: uploadingPoste ? 0.6 : 1 }}>
                {uploadingPoste ? 'Upload...' : '+ Photo / Vidéo'}
              </button>
              <button onClick={toggleEnregistrement} disabled={uploadingAudio}
                style={{ background: enregistrement ? 'rgba(255,59,48,0.2)' : 'rgba(255,149,0,0.15)', border: enregistrement ? '1px solid rgba(255,59,48,0.5)' : '1px solid rgba(255,149,0,0.3)', borderRadius: '8px', color: enregistrement ? 'rgb(255,59,48)' : 'rgba(255,149,0,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: 'pointer' }}>
                {uploadingAudio ? 'Envoi...' : enregistrement ? '⏹ Stop' : '🎙️ Vocal'}
              </button>
              <button onClick={() => droneInputRef.current?.click()} disabled={uploadingDrone}
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'rgba(139,92,246,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: uploadingDrone ? 'wait' : 'pointer', opacity: uploadingDrone ? 0.6 : 1 }}>
                {uploadingDrone ? 'Upload...' : '🚁 Drone'}
              </button>
            </div>
          </div>
          {mediasPosteActuel.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {mediasPosteActuel.map(m => (
                <div key={m.id} style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${m.type === 'drone' ? 'rgba(139,92,246,0.4)' : 'rgba(55,138,221,0.3)'}` }}>
                  {m.type === 'audio' ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,149,0,0.1)', fontSize: '24px' }}>🎙️</div>
                    : <img src={m.url} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton micro-entretien */}
        <div style={{ marginBottom: '12px' }}>
          {!showEntretienForm ? (
            <button onClick={() => setShowEntretienForm(true)}
              style={{ width: '100%', background: 'rgba(246,173,85,0.08)', border: '1px solid rgba(246,173,85,0.3)', borderRadius: '10px', padding: '10px 14px', color: 'rgba(246,173,85,0.9)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
              💬 Ajouter un micro-entretien visiteur {entretiens.length > 0 && `(${entretiens.length} déjà réalisé${entretiens.length > 1 ? 's' : ''})`}
            </button>
          ) : (
            <div style={{ background: 'rgba(246,173,85,0.06)', border: '1px solid rgba(246,173,85,0.25)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(246,173,85,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>💬 Micro-entretien visiteur</p>
              <select value={entretienEnCours.moment || ''} onChange={e => setEntretienEnCours(prev => ({ ...prev, moment: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}>
                <option value="En cours de visite">En cours de visite</option>
                <option value="À la sortie">À la sortie</option>
                <option value="Zone F&B">Zone F&B</option>
                <option value="Après une activité">Après une activité</option>
              </select>
              {[
                { key: 'q1', label: 'Quel moment vous a le plus plu ?' },
                { key: 'q2', label: 'Y a-t-il eu un moment frustrant ou confus ?' },
                { key: 'q3', label: 'Qu\'est-ce que vous allez retenir ?' }
              ].map(({ key, label }) => (
                <textarea key={key} placeholder={label} value={(entretienEnCours as any)[key] || ''} onChange={e => setEntretienEnCours(prev => ({ ...prev, [key]: e.target.value }))} rows={2}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px', resize: 'none', fontFamily: 'Arial', boxSizing: 'border-box', marginBottom: '8px' }} />
              ))}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowEntretienForm(false); setEntretienEnCours({}) }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>Annuler</button>
                <button onClick={ajouterEntretien} style={{ flex: 2, background: 'rgba(246,173,85,0.2)', border: '1px solid rgba(246,173,85,0.4)', borderRadius: '8px', padding: '8px', color: 'rgba(246,173,85,1)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Enregistrer l'entretien</button>
              </div>
            </div>
          )}
        </div>

        {/* Zone notes */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Tes observations</p>
          <textarea value={noteActuelle} onChange={e => setNoteActuelle(e.target.value)} placeholder="Note tes observations comportementales ici..." rows={4}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', resize: 'none', fontFamily: 'Arial', boxSizing: 'border-box', lineHeight: 1.6 }} />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {posteIndex > 0 && <button onClick={precedent} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' }}>← Précédent</button>}
          <button onClick={sauvegarderEtContinuer} style={{ flex: 2, background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            {posteIndex < total - 1 ? 'Suivant →' : 'Générer le rapport ✓'}
          </button>
        </div>
      </div>
    </main>
  )
}
