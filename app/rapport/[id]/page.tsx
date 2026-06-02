'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Rapport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [rapport, setRapport] = useState<any>(null)
  const [mission, setMission] = useState<any>(null)
  const [modeToken, setModeToken] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) { setModeToken(true); loadRapportParToken(token) }
    else { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/' }); loadRapport() }
  }, [])

  async function loadRapport() {
    const { data: m } = await supabase.from('missions').select('*, clients(nom, secteur)').eq('id', id).single()
    if (m) setMission(m)
    const { data: r } = await supabase.from('rapports').select('*').eq('mission_id', id).single()
    if (r) setRapport(r)
  }

  async function loadRapportParToken(token: string) {
    const { data: r } = await supabase.from('rapports').select('*').eq('share_token', token).single()
    if (!r) { window.location.href = '/'; return }
    setRapport(r)
    const { data: m } = await supabase.from('missions').select('*, clients(nom, secteur)').eq('id', r.mission_id).single()
    if (m) setMission(m)
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

  // Titre du rapport selon le type de mission
  function rapportTitre(): string {
    const type = mission?.type || ''
    if (type.includes('neuroaccess')) return 'Rapport Neuroaccess — Parcours visiteur'
    if (type.includes('neurotaste')) return 'Rapport Neurotaste — Expérience F&B'
    if (type.includes('neuromedia')) return 'Rapport Neuromedia — Captation & Médias'
    return 'Rapport Diagnostic — Neuroplay Xpériences'
  }

  // Titre du score selon le type de mission
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
          .print-only { display: flex !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0; size: A4; }
        }
        @media screen { .print-only { display: none !important; } }
        body { margin: 0; }
      `}</style>

      {/* Header écran */}
      <div className="no-print" style={{ background: '#fff', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {!modeToken && <button onClick={handleRetour} style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>← Retour</button>}
          <div>
            <p style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: 0, fontFamily: 'Arial' }}>Neuroplay Xpériences · {rapportTitre()}</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, fontFamily: 'Arial' }}>{mission?.clients?.nom} · {mission?.date_mission}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleMail} style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '13px', fontWeight: '600', padding: '8px 18px', cursor: 'pointer', fontFamily: 'Arial' }}>✉ Envoyer par mail</button>
          <button onClick={() => window.print()} style={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', padding: '8px 18px', cursor: 'pointer', fontFamily: 'Arial' }}>↓ Télécharger PDF</button>
        </div>
      </div>

      <main style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '40px 32px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Page de garde */}
          <div style={{ background: '#0f172a', borderRadius: '16px', padding: '48px', marginBottom: '32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#c8f135' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="10" r="3" stroke="#c8f135" strokeWidth="1.5"/>
                    <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="#c8f135" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: '0 0 8px', lineHeight: 1.2 }}>{rapportTitre()}</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 4px' }}>{mission?.clients?.nom}</p>
                {ex.type_site && <p style={{ color: '#c8f135', fontSize: '13px', margin: 0 }}>{ex.type_site}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</p>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 20px' }}>{dateDoc}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200,241,53,0.12)', border: '1px solid rgba(200,241,53,0.35)', borderRadius: '20px', padding: '5px 14px' }}>
                  <span style={{ color: '#c8f135', fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>🔒 Document confidentiel</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '72px', fontWeight: '700', color: '#c8f135', margin: 0, lineHeight: 1 }}>{ex.score_global}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score global / 10</p>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '32px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Insight stratégique</p>
                <p style={{ color: '#fff', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>{ex.insight}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>Executive Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0 0 12px' }}>Frictions comportementales</p>
                {(ex.frictions || []).map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ color: '#374151', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{f}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0 0 12px' }}>Opportunités immédiates</p>
                {(ex.opportunites || []).map((o: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ color: '#374151', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parcours */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>Parcours visiteur</h2>
            {[
              { label: 'Avant la visite', data: parc.avant || [], color: '#7C83FD' },
              { label: 'Pendant la visite', data: parc.pendant || [], color: '#EF9F27' },
              { label: 'Après la visite', data: parc.apres || [], color: '#16a34a' },
            ].map(({ label, data, color }) => (
              <div key={label} style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0 0 12px' }}>{label}</p>
                {data.map((item: any) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#374151', fontSize: '13px', flex: 1, margin: 0 }}>{item.label}</p>
                    <div style={{ width: '140px', height: '6px', background: '#f1f5f9', borderRadius: '3px', flexShrink: 0 }}>
                      <div style={{ width: `${item.score * 10}%`, height: '6px', background: scoreColor(item.score), borderRadius: '3px' }} />
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: scoreColorLight(item.score), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: scoreColor(item.score), fontSize: '13px', fontWeight: '700' }}>{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Analyse comportementale */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>Analyse comportementale</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Zones chaudes', data: comportemental.zones_chaudes || [], color: '#16a34a', bg: '#dcfce7', icon: '🔥' },
                { label: 'Zones froides', data: comportemental.zones_froides || [], color: '#64748b', bg: '#f1f5f9', icon: '❄️' },
                { label: 'Comportements positifs', data: comportemental.comportements_positifs || [], color: '#2563eb', bg: '#dbeafe', icon: '✅' },
                { label: 'Points de friction', data: comportemental.comportements_friction || [], color: '#dc2626', bg: '#fee2e2', icon: '⚠️' },
              ].map(({ label, data, color, bg, icon }) => (
                <div key={label} style={{ background: bg, borderRadius: '10px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', margin: '0 0 12px' }}>{icon} {label}</p>
                  {data.map((obs: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 8px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: `2px solid ${color}` }}>{obs}</p>)}
                </div>
              ))}
            </div>
          </div>

          {/* Analyse cognitive */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>Analyse cognitive — BEN™</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Surcharge mentale', data: cog.surcharge || [], color: '#dc2626', bg: '#fee2e2', icon: '🧠' },
                { label: "Moments d'hésitation", data: cog.doute || [], color: '#d97706', bg: '#fef3c7', icon: '😕' },
                { label: "Moments d'engagement fort", data: cog.waouh || [], color: '#16a34a', bg: '#dcfce7', icon: '✨' },
              ].map(({ label, data, color, bg, icon }) => (
                <div key={label} style={{ background: bg, borderRadius: '10px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', margin: '0 0 12px' }}>{icon} {label}</p>
                  {data.map((obs: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 8px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: `2px solid ${color}` }}>{obs}</p>)}
                </div>
              ))}
            </div>
          </div>

          {/* Micro-entretiens */}
          {(entretiensSynthese.satisfactions?.length > 0 || entretiensSynthese.frustrations?.length > 0) && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>Synthèse micro-entretiens visiteurs</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: '#dcfce7', borderRadius: '10px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#16a34a', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 12px' }}>Satisfactions</p>
                  {(entretiensSynthese.satisfactions || []).map((s: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 8px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: '2px solid #16a34a' }}>{s}</p>)}
                </div>
                <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#dc2626', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 12px' }}>Frustrations</p>
                  {(entretiensSynthese.frustrations || []).map((f: string, i: number) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 8px', lineHeight: 1.5, paddingLeft: '8px', borderLeft: '2px solid #dc2626' }}>{f}</p>)}
                </div>
              </div>
              {entretiensSynthese.memorabilite && (
                <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#d97706', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px' }}>Ce que les visiteurs retiennent</p>
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.6 }}>{entretiensSynthese.memorabilite}</p>
                </div>
              )}
            </div>
          )}

          {/* Plan d'action */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>Plan d'action</h2>
            {syn.map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: syntheseBg[r.type], color: syntheseColor[r.type], flexShrink: 0, whiteSpace: 'nowrap' }}>{syntheseLabel[r.type]}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#0f172a', fontSize: '13px', fontWeight: '500', margin: '0 0 3px' }}>{r.texte}</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{r.poste} · {r.delai}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Score */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>{scoreTitre()}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {Object.entries(sn).map(([key, val]: any) => (
                <div key={key} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 12px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
                  <div style={{ height: '48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '28px', background: scoreColor(val), borderRadius: '4px 4px 0 0', height: `${val * 4.8}px` }} />
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: scoreColor(val), margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#c8f135' }} />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 4px' }}>{scoreTitre()}</p>
                <p style={{ fontSize: '48px', fontWeight: '700', color: '#c8f135', margin: 0, lineHeight: 1 }}>{scoreGlobal}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '4px 0 0' }}>/ 10 · BEN™ — Neuroplay Xpériences</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 4px' }}>Client</p>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>{mission?.clients?.nom}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 4px' }}>Généré le</p>
                <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{dateDoc}</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
