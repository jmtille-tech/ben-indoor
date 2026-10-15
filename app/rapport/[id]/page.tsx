'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

// ── Jauge circulaire SVG ──────────────────────────────────────────────────────
function GaugeCircle({ score, label }: { score: number; label: string }) {
  const r = 26, circ = 2 * Math.PI * r
  const dash = (score / 10) * circ
  const color = score >= 7 ? '#c8f135' : score >= 5 ? '#EF9F27' : '#E24B4A'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 32 32)" />
        <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill={color} fontFamily="Arial">{score}</text>
      </svg>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center', maxWidth: '70px', lineHeight: 1.3 }}>{label}</p>
    </div>
  )
}

// ── Timeline plan d'action ────────────────────────────────────────────────────
function Timeline({ items }: { items: any[] }) {
  const phases = [
    { label: 'Immédiat', icon: '①' },
    { label: '< 2 semaines', icon: '②' },
    { label: '1-3 mois', icon: '③' },
    { label: '6-12 mois', icon: '④' },
  ]

  const getPhase = (delai: string) => {
    const d = (delai || '').toLowerCase()
    if (d.includes('immédiat') || d.includes('immediat')) return 0
    if (d.includes('semaine')) return 1
    if (d.includes('mois') && !d.includes('6') && !d.includes('12')) return 2
    return 3
  }

  const grouped: any[][] = [[], [], [], []]
  items.forEach(item => grouped[getPhase(item.delai)].push(item))

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Axe timeline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
        {phases.map((phase, pi) => (
          <div key={pi} style={{ flex: 1, position: 'relative' }}>
            {pi < phases.length - 1 && (
              <div style={{ position: 'absolute', top: '16px', left: '50%', right: '-50%', height: '1px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: grouped[pi].length > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${grouped[pi].length > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '6px' }}>
                {grouped[pi].length > 0 ? phase.icon : '○'}
              </div>
              <p style={{ fontSize: '10px', fontWeight: '700', color: grouped[pi].length > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', margin: '0 0 2px', textAlign: 'center' }}>{phase.label}</p>
              <span style={{ fontSize: '10px', background: grouped[pi].length > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', color: grouped[pi].length > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', padding: '1px 7px', borderRadius: '20px', fontWeight: '700' }}>
                {grouped[pi].length} action{grouped[pi].length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Rapport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [rapport, setRapport] = useState<any>(null)
  const [mission, setMission] = useState<any>(null)
  const [onglet, setOnglet] = useState('exec')
  const [printMode, setPrintMode] = useState(false)

  function handlePrint() {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintMode(false), 500)
    }, 300)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
    })
    loadRapport()
  }, [])

  async function loadRapport() {
    const { data: m } = await supabase.from('missions').select('*, clients(nom, secteur)').eq('id', id).single()
    if (m) setMission(m)
    const { data: r } = await supabase.from('rapports').select('*').eq('mission_id', id).single()
    if (r) setRapport(r)
  }

  async function handleRetour() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    window.location.href = profile?.role === 'admin' ? '/dashboard' : '/client'
  }

  const scoreColor = (s: number) => s >= 7 ? '#c8f135' : s >= 5 ? '#EF9F27' : '#E24B4A'
  const syntheseColor: any = { critique: '#E24B4A', quickwin: '#c8f135', optimisation: '#378ADD', long_terme: 'rgba(255,255,255,0.4)' }
  const syntheseLabel: any = { critique: 'Friction critique', quickwin: 'Quick win', optimisation: 'Optimisation', long_terme: 'Long terme' }

  const onglets = [
    { id: 'exec', label: 'Executive Summary' },
    { id: 'parcours', label: 'Parcours client' },
    { id: 'cognitif', label: 'Analyse cognitive' },
    { id: 'synthese', label: 'Synthèse stratégique' },
  ]

  const pct = (v: number) => `${Math.round(v * 10)}%`

  if (!rapport) return (
    <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial' }}>Chargement...</p>
    </main>
  )

  const ex = rapport.executive_summary || {}
  const parc = rapport.parcours_scores || {}
  const cog = rapport.analyse_cognitive || {}
  const syn = rapport.synthese || []

  // Tous les scores parcours pour le scorecard
  const allScores = [
    ...(parc.avant || []),
    ...(parc.pendant || []),
    ...(parc.apres || []),
  ]

  const showSection = (id: string) => printMode || onglet === id

  return (
    <main style={{ minHeight: '100vh', background: printMode ? '#fff' : '#0d1520', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #000 !important; }
          @page { margin: 15mm; size: A4; }
          canvas { display: none !important; }
          .chart-container { display: none !important; }
        }
      `}</style>

      {/* Header print-only */}
      {printMode && (
        <div style={{ padding: '20px 24px', borderBottom: '2px solid #eee', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>Neuroplay Xpériences — BEN™</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#0d1520', margin: '0 0 4px' }}>Diagnostic Expérience Visiteur</p>
            <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>Module Neuroaccess — Approche cognitive terrain</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#0d1520', margin: '0 0 2px' }}>{mission?.clients?.nom}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{mission?.date_mission}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="no-print" style={{ background: '#111d30', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleRetour} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>← Retour</button>
          <div>
            <p style={{ color: '#c8f135', fontSize: '13px', fontWeight: '700', margin: 0 }}>NeuroPlay Access — Diagnostic Expérience Visiteur</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{mission?.clients?.nom} · {mission?.type} · {mission?.date_mission}</p>
          </div>
        </div>
        <button onClick={handlePrint} className="no-print" style={{ background: 'rgba(200,241,53,0.12)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '8px', color: '#c8f135', fontSize: '12px', padding: '6px 14px', cursor: 'pointer' }}>
          Télécharger PDF
        </button>
      </div>

      {/* Onglets */}
      {!printMode && <div style={{ display: 'flex', background: '#111d30', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', overflowX: 'auto' }}>
        {onglets.map(o => {
          const isActive = onglet === o.id
          return (
            <div key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 16px', fontSize: '12px', color: isActive ? '#c8f135' : 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: isActive ? '2px solid #c8f135' : '2px solid transparent', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {o.label}
            </div>
          )
        })}
      </div>}

      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

        {/* ── EXECUTIVE SUMMARY ── */}
        {showSection('exec') && (
          <div>
            {/* Score global */}
            <div style={{ textAlign: 'center', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
              <p style={{ fontSize: '64px', fontWeight: '700', color: '#c8f135', margin: '0 0 4px', lineHeight: 1 }}>{ex.score_global}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Score global expérience / 10</p>
            </div>

            {/* ── NOUVEAU : Scorecard jauges ── */}
            {allScores.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Vue d'ensemble — scores par dimension</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                  {allScores.map((item: any) => (
                    <GaugeCircle key={item.label} score={item.score} label={item.label} />
                  ))}
                </div>
              </div>
            )}

            {/* Frictions / Opportunités / Insight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: '3 frictions majeures', items: ex.frictions || [], color: '#E24B4A' },
                { label: '3 opportunités immédiates', items: ex.opportunites || [], color: '#c8f135' },
                { label: 'Insight stratégique', items: [ex.insight], color: '#378ADD' },
              ].map(({ label, items, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>{label}</p>
                  {items.map((item: string, i: number) => (
                    <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '10px', borderLeft: `2px solid ${color}`, lineHeight: 1.4 }}>{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PARCOURS ── */}
        {showSection('parcours') && (
          <div>
            {[
              { label: 'Avant la visite', data: parc.avant || [] },
              { label: 'Pendant la visite', data: parc.pendant || [] },
              { label: 'Après la visite', data: parc.apres || [] },
            ].map(({ label, data }) => (
              <div key={label} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>{label}</p>
                {data.map((item: any) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', flex: 1, margin: 0 }}>{item.label}</p>
                    <div style={{ width: '100px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', flexShrink: 0 }}>
                      <div style={{ width: pct(item.score), height: '5px', background: scoreColor(item.score), borderRadius: '3px' }} />
                    </div>
                    <p style={{ color: scoreColor(item.score), fontSize: '13px', fontWeight: '500', minWidth: '36px', textAlign: 'right', margin: 0 }}>{item.score}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── COGNITIF ── */}
        {showSection('cognitif') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { icon: '🧠', label: 'Surcharge mentale', data: cog.surcharge || [] },
              { icon: '😕', label: 'Moments de doute', data: cog.doute || [] },
              { icon: '😍', label: 'Moments waouh', data: cog.waouh || [] },
            ].map(({ icon, label, data }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{label}</p>
                {data.map((obs: string, i: number) => (
                  <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 8px', paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', lineHeight: 1.5 }}>{obs}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── SYNTHESE ── */}
        {showSection('synthese') && (
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Plan d'action stratégique</p>

            {/* ── NOUVEAU : Timeline visuelle ── */}
            {syn.length > 0 && <Timeline items={syn} />}

            {/* Liste détaillée */}
            {syn.map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: `${syntheseColor[r.type]}18`, color: syntheseColor[r.type], border: `1px solid ${syntheseColor[r.type]}40`, flexShrink: 0, whiteSpace: 'nowrap' }}>{syntheseLabel[r.type]}</span>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 2px' }}>{r.texte}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{r.poste} · {r.delai}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
