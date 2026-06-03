'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Rapport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [rapport, setRapport] = useState<any>(null)
  const [mission, setMission] = useState<any>(null)
  const [medias, setMedias] = useState<any[]>([])
  const [modeToken, setModeToken] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) { setModeToken(true); loadRapportParToken(token) }
    else { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/' }); loadRapport() }
  }, [])

  async function loadRapport() {
    const { data: m } = await supabase.from('missions').select('*, clients(nom, secteur)').eq('id', id).single()
    if (m) { setMission(m); loadMedias(m.client_id) }
    const { data: r } = await supabase.from('rapports').select('*').eq('mission_id', id).single()
    if (r) setRapport(r)
  }

  async function loadRapportParToken(token: string) {
    const { data: r } = await supabase.from('rapports').select('*').eq('share_token', token).single()
    if (!r) { window.location.href = '/'; return }
    setRapport(r)
    const { data: m } = await supabase.from('missions').select('*, clients(nom, secteur)').eq('id', r.mission_id).single()
    if (m) { setMission(m); loadMedias(m.client_id) }
  }

  async function loadMedias(clientId: string) {
    const { data } = await supabase.from('medias').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    if (data) setMedias(data)
  }

  async function handleRetour() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    window.location.href = profile?.role === 'admin' ? '/dashboard' : '/client'
  }

  function handleMail() {
    const sujet = encodeURIComponent(`Rapport diagnostic Neuroplay — ${mission?.clients?.nom}`)
    const token = rapport?.share_token
    const lien = token ? `${window.location.origin}/rapport/${id}?token=${token}` : window.location.href
    const corps = encodeURIComponent(`Bonjour,\n\nVoici le rapport de diagnostic Neuroplay Xpériences pour ${mission?.clients?.nom}.\n\nScore global : ${rapport?.executive_summary?.score_global}/10\n\nConsultez le rapport : ${lien}\n\nCordialement,\nNeuroplay Xpériences`)
    window.location.href = `mailto:?subject=${sujet}&body=${corps}`
  }

  function rapportTitre(): string {
    const type = mission?.type || ''
    if (type.includes('neuroaccess')) return 'Rapport Neuroaccess — Parcours visiteur'
    if (type.includes('neurotaste')) return 'Rapport Neurotaste — Expérience F&B'
    if (type.includes('neuromedia')) return 'Rapport Neuromedia — Captation & Médias'
    return 'Rapport Diagnostic — Neuroplay Xpériences'
  }

  function scoreTitre(): string {
    const type = mission?.type || ''
    if (type.includes('neuroaccess')) return 'Score Neuroaccess'
    if (type.includes('neurotaste')) return 'Score Neurotaste'
    if (type.includes('neuromedia')) return 'Score Neuromedia'
    return 'Score Neuroplay'
  }

  const scoreColor = (s: number) => s >= 7 ? '#16a34a' : s >= 5 ? '#d97706' : '#dc2626'
  const scoreColorLight = (s: number) => s >= 7 ? '#dcfce7' : s >= 5 ? '#fef3c7' : '#fee2e2'
  const syntheseColor: any = { critique: '#dc2626', quickwin: '#16a34a', optimisation: '#2563eb', long_terme: '#6b7280' }
  const syntheseLabel: any = { critique: 'Friction critique', quickwin: 'Quick win', optimisation: 'Optimisation', long_terme: 'Long terme' }
  const syntheseBg: any = { critique: '#fee2e2', quickwin: '#dcfce7', optimisation: '#dbeafe', long_terme: '#f3f4f6' }
  const dateDoc = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  // Médias groupés par poste
  const mediasParPoste = medias.reduce((acc: any, m: any) => {
    const key = m.poste || 'Général'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  function typeBorder(type: string) {
    if (type === 'drone') return 'rgba(139,92,246,0.4)'
    if (type === 'audio') return 'rgba(255,149,0,0.4)'
    if (type === 'doc') return 'rgba(52,199,89,0.4)'
    return 'rgba(55,138,221,0.3)'
  }
  function typeBg(type: string) {
    if (type === 'drone') return 'rgba(139,92,246,0.1)'
    if (type === 'audio') return 'rgba(255,149,0,0.1)'
    if (type === 'doc') return 'rgba(52,199,89,0.1)'
    return 'rgba(55,138,221,0.08)'
  }
  function typeIcon(type: string) {
    if (type === 'audio') return '🎙'
    if (type === 'video') return '🎬'
    if (type === 'drone') return '🚁'
    if (type === 'doc') return '📄'
    return '📷'
  }

  if (!rapport) return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8', fontFamily: 'Arial' }}>Chargement...</p>
    </main>
  )

  const ex = rapport.executive_summary || {}
  const parc = rapport.parcours_scores || {}
  const cog = rapport.analyse_cognitive || {}
  const comportemental = rapport.analyse_comportementale || {}
  const entretiensSynthese = rapport.entretiens_synthese || {}
  const syn = rapport.synthese || []
  const sn = rapport.score_neuroplay || {}
  const scoreGlobal = Object.keys(sn).length > 0
    ? ((Object.values(sn) as number[]).reduce((a: number, b: number) => a + b, 0) / Object.keys(sn).length).toFixed(1)
    : ex.score_global

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0; size: A4; }
        }
        body { margin: 0; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr !important; gap: 12px !important; }
          .grid-3 { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .header-actions { flex-direction: column; gap: 8px !important; }
          .garde-inner { flex-direction: column !important; gap: 16px !important; }
          .garde-score { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px !important; }
          .score-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .score-footer { flex-direction: column !important; gap: 12px !important; text-align: left !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {!modeToken && (
            <button onClick={handleRetour} style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>← Retour</button>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#0f172a', fontSize: '13px', fontWeight: '700', margin: 0, fontFamily: 'Arial', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mission?.clients?.nom}</p>
            <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0, fontFamily: 'Arial' }}>{rapportTitre()}</p>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={handleMail} style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px', fontWeight: '600', padding: '7px 14px', cursor: 'pointer', fontFamily: 'Arial' }}>✉ Mail</button>
          <button onClick={() => window.print()} style={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '7px 14px', cursor: 'pointer', fontFamily: 'Arial' }}>↓ PDF</button>
        </div>
      </div>

      <main style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '20px 16px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Page de garde */}
          <div style={{ background: '#0f172a', borderRadius: '16px', padding: '28px 24px', marginBottom: '20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#c8f135' }} />
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 6px', lineHeight: 1.2 }}>{rapportTitre()}</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 2px' }}>{mission?.clients?.nom}</p>
              <p style={{ color: '#c8f135', fontSize: '12px', margin: 0 }}>{dateDoc} · {ex.type_site || ''}</p>
            </div>
            <div className="garde-inner" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: '64px', fontWeight: '700', color: '#c8f135', margin: 0, lineHeight: 1 }}>{ex.score_global}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score / 10</p>
              </div>
              <div className="garde-score" style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Insight stratégique</p>
                <p style={{ color: '#fff', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{ex.insight}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Executive Summary</h2>
            <div className="grid-2">
              <div>
                <p style={{ fontSize: '10px', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0 0 10px' }}>Frictions comportementales</p>
                {(ex.frictions || []).map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ color: '#374151', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{f}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '10px', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0 0 10px' }}>Opportunités immédiates</p>
                {(ex.opportunites || []).map((o: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ color: '#374151', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parcours */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Parcours visiteur</h2>
            {[
              { label: 'Avant la visite', data: parc.avant || [], color: '#7C83FD' },
              { label: 'Pendant la visite', data: parc.pendant || [], color: '#EF9F27' },
              { label: 'Après la visite', data: parc.apres || [], color: '#16a34a' },
            ].map(({ label, data, color }) => (
              <div key={label} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0 0 10px' }}>{label}</p>
                {data.map((item: any) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                    <p style={{ color: '#374151', fontSize: '12px', flex: 1, margin: 0, minWidth: '100px' }}>{item.label}</p>
                    <div style={{ width: '100px', height: '5px', background: '#f1f5f9', borderRadius: '3px', flexShrink: 0 }}>
                      <div style={{ width: `${item.score * 10}%`, height: '5px', background: scoreColor(item.score), borderRadius: '3px' }} />
                    </div>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: scoreColorLight(item.score), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: scoreColor(item.score), fontSize: '12px', fontWeight: '700' }}>{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Analyse comportementale */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Analyse comportementale</h2>
            <div className="grid-2">
              {[
                { label: 'Zones chaudes', data: comportemental.zones_chaudes || [], color: '#16a34a', bg: '#dcfce7', icon: '🔥' },
                { label: 'Zones froides', data: comportemental.zones_froides || [], color: '#64748b', bg: '#f1f5f9', icon: '❄️' },
                { label: 'Comportements positifs', data: comportemental.comportements_positifs || [], color: '#2563eb', bg: '#dbeafe', icon: '✅' },
                { label: 'Points de friction', data: comportemental.comportements_friction || [], color: '#dc2626', bg: '#fee2e2', icon: '⚠️' },
              ].map(({ label, data, color, bg, icon }) => (
                <div key={label} style={{ background: bg, borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '10px', color: color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', margin: '0 0 10px' }}>{icon} {label}</p>
                  {data.map((obs: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: `2px solid ${color}` }}>{obs}</p>)}
                </div>
              ))}
            </div>
          </div>

          {/* Analyse cognitive */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Analyse cognitive — BEN™</h2>
            <div className="grid-3">
              {[
                { label: 'Surcharge mentale', data: cog.surcharge || [], color: '#dc2626', bg: '#fee2e2', icon: '🧠' },
                { label: "Hésitations", data: cog.doute || [], color: '#d97706', bg: '#fef3c7', icon: '😕' },
                { label: "Engagement fort", data: cog.waouh || [], color: '#16a34a', bg: '#dcfce7', icon: '✨' },
              ].map(({ label, data, color, bg, icon }) => (
                <div key={label} style={{ background: bg, borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '10px', color: color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', margin: '0 0 10px' }}>{icon} {label}</p>
                  {data.map((obs: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: `2px solid ${color}` }}>{obs}</p>)}
                </div>
              ))}
            </div>
          </div>

          {/* Micro-entretiens */}
          {(entretiensSynthese.satisfactions?.length > 0 || entretiensSynthese.frustrations?.length > 0) && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Synthèse micro-entretiens visiteurs</h2>
              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div style={{ background: '#dcfce7', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '10px', color: '#16a34a', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 10px' }}>Satisfactions</p>
                  {(entretiensSynthese.satisfactions || []).map((s: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: '2px solid #16a34a' }}>{s}</p>)}
                </div>
                <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '10px', color: '#dc2626', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 10px' }}>Frustrations</p>
                  {(entretiensSynthese.frustrations || []).map((f: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: '2px solid #dc2626' }}>{f}</p>)}
                </div>
              </div>
              {entretiensSynthese.memorabilite && (
                <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '10px', color: '#d97706', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px' }}>Ce que les visiteurs retiennent</p>
                  <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: 1.6 }}>{entretiensSynthese.memorabilite}</p>
                </div>
              )}
            </div>
          )}

          {/* Plan d'action */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Plan d'action</h2>
            {syn.map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: syntheseBg[r.type], color: syntheseColor[r.type], flexShrink: 0, whiteSpace: 'nowrap' }}>{syntheseLabel[r.type]}</span>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <p style={{ color: '#0f172a', fontSize: '12px', fontWeight: '500', margin: '0 0 2px' }}>{r.texte}</p>
                  <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>{r.poste} · {r.delai}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Score */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>{scoreTitre()}</h2>
            <div className="score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {Object.entries(sn).map(([key, val]: any) => (
                <div key={key} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '12px 8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 8px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '24px', background: scoreColor(val), borderRadius: '3px 3px 0 0', height: `${val * 3.6}px` }} />
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: scoreColor(val), margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            <div className="score-footer" style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', gap: '16px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#c8f135' }} />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 4px' }}>{scoreTitre()}</p>
                <p style={{ fontSize: '40px', fontWeight: '700', color: '#c8f135', margin: 0, lineHeight: 1 }}>{scoreGlobal}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '4px 0 0' }}>/ 10 · BEN™ — Neuroplay Xpériences</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 2px' }}>Client</p>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: '0 0 8px' }}>{mission?.clients?.nom}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 2px' }}>Généré le</p>
                <p style={{ color: '#fff', fontSize: '12px', margin: 0 }}>{dateDoc}</p>
              </div>
            </div>
          </div>

          {/* ── SECTION MÉDIAS ── */}
          {medias.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: 0 }}>Médias captés</h2>
                <span style={{ fontSize: '11px', background: 'rgba(55,138,221,0.1)', border: '1px solid rgba(55,138,221,0.3)', borderRadius: '10px', padding: '2px 8px', color: 'rgba(55,138,221,0.9)' }}>
                  {medias.length} fichier{medias.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Récap types */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {(['photo', 'video', 'audio', 'drone', 'doc'] as const).map(type => {
                  const count = medias.filter((m: any) => m.type === type).length
                  if (count === 0) return null
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: typeBg(type), border: `1px solid ${typeBorder(type)}`, borderRadius: '8px', padding: '3px 8px' }}>
                      <span style={{ fontSize: '11px' }}>{typeIcon(type)}</span>
                      <span style={{ fontSize: '11px', color: '#374151' }}>{count} {type}</span>
                    </div>
                  )
                })}
              </div>

              {/* Par poste */}
              {Object.entries(mediasParPoste).map(([poste, items]: any) => (
                <div key={poste} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{poste}</span>
                    <div style={{ flex: 1, height: '0.5px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{items.length}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {items.map((m: any) => (
                      <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <div style={{ width: '68px', height: '68px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${typeBorder(m.type)}`, background: typeBg(m.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '3px', position: 'relative' }}>
                          {(m.type === 'photo' || (m.type === 'drone' && m.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)))
                            ? <img src={m.url} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (m.type === 'video' || (m.type === 'drone' && m.url?.match(/\.(mp4|mov|avi|webm)/i)))
                            ? <>
                                <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="8" height="8" viewBox="0 0 10 10" fill="#000"><path d="M3 2l6 3-6 3V2z"/></svg>
                                  </div>
                                </div>
                              </>
                            : <>
                                <span style={{ fontSize: '22px' }}>{typeIcon(m.type)}</span>
                                <span style={{ fontSize: '8px', color: '#64748b', textAlign: 'center', padding: '0 4px', wordBreak: 'break-all' }}>{m.nom?.substring(0, 10)}</span>
                              </>
                          }
                          {m.type === 'drone' && (
                            <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', padding: '1px 3px', fontSize: '8px' }}>🚁</div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
